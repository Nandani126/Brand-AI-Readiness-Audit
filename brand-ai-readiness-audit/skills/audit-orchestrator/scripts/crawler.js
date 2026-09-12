const dns = require('dns').promises;
const net = require('net');
const cheerio = require('cheerio');

// Configuration Defaults
const DEFAULT_MAX_PAGES = 20;
const DEFAULT_MAX_DEPTH = 2;
const DEFAULT_REQUEST_TIMEOUT = 10; // in seconds

/**
 * Checks if an IP address is a private/internal network IP.
 * Protects against SSRF (Server-Side Request Forgery).
 */
function isPrivateIP(ip) {
  if (!net.isIP(ip)) return true; // Treat invalid IP as unsafe/private

  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    // Loopback: 127.0.0.0/8
    if (parts[0] === 127) return true;
    // Private network Class A: 10.0.0.0/8
    if (parts[0] === 10) return true;
    // Private network Class B: 172.16.0.0/12
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // Private network Class C: 192.168.0.0/16
    if (parts[0] === 192 && parts[1] === 168) return true;
    // Link-local: 169.254.0.0/16
    if (parts[0] === 169 && parts[1] === 254) return true;
    // Wildcard / local broadcast: 0.0.0.0
    if (ip === '0.0.0.0') return true;

    return false;
  }

  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    // Loopback: ::1
    if (lower === '::1' || lower === '0:0:0:0:0:0:0:1') return true;
    
    // Check segments for Link-local (fe80::/10) and Unique local (fc00::/7)
    const firstSegment = lower.split(':')[0];
    if (firstSegment) {
      const val = parseInt(firstSegment, 16);
      if (val >= 0xfe80 && val <= 0xfebf) return true; // Link-local
      if (val >= 0xfc00 && val <= 0xfdff) return true; // Unique local
    }

    // IPv4-mapped IPv6 address: ::ffff:192.168.1.1
    if (lower.startsWith('::ffff:')) {
      const ipv4 = ip.substring(7);
      return isPrivateIP(ipv4);
    }
    return false;
  }

  return true;
}

/**
 * Validates the URL scheme and resolves the hostname to ensure it does not point to a private IP.
 */
async function validateUrlAndResolveIP(urlStr) {
  let urlObj;
  try {
    urlObj = new URL(urlStr);
  } catch (err) {
    throw new Error('Malformed URL format.');
  }

  // Enforce protocol schemes
  if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
    throw new Error(`Forbidden protocol scheme: ${urlObj.protocol}. Only http and https are allowed.`);
  }

  const hostname = urlObj.hostname;
  if (!hostname) {
    throw new Error('URL is missing a valid hostname.');
  }

  // Resolve hostname and test the resolved IP address
  try {
    const result = await dns.lookup(hostname);
    const ip = result.address;
    if (isPrivateIP(ip)) {
      throw new Error(`SSRF Guard: Target IP ${ip} is blocked (Private/Internal Network).`);
    }
    return { ip, urlObj };
  } catch (err) {
    // If DNS resolution fails, throw the error
    if (err.message.includes('SSRF Guard')) {
      throw err;
    }
    throw new Error(`DNS lookup failed for hostname: ${hostname}. Error: ${err.message}`);
  }
}

/**
 * Parses robots.txt files and checks if specific paths are disallowed.
 */
class RobotsTxtRules {
  constructor(content = '') {
    this.rules = {}; // Map of user-agent -> { allowed: [], disallowed: [] }
    this.parse(content);
  }

  parse(content) {
    if (!content) return;
    const lines = content.split('\n');
    let currentAgents = [];
    let inNewAgentBlock = true;

    for (let line of lines) {
      line = line.trim();
      // Remove comments
      if (line.startsWith('#') || line === '') continue;

      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;

      const key = line.substring(0, colonIndex).trim().toLowerCase();
      const val = line.substring(colonIndex + 1).trim();

      if (key === 'user-agent') {
        if (!inNewAgentBlock) {
          currentAgents = [];
          inNewAgentBlock = true;
        }
        currentAgents.push(val.toLowerCase());
      } else if (key === 'disallow' || key === 'allow') {
        inNewAgentBlock = false;
        const isDisallow = key === 'disallow';
        for (const agent of currentAgents) {
          if (!this.rules[agent]) {
            this.rules[agent] = { allow: [], disallow: [] };
          }
          if (isDisallow) {
            this.rules[agent].disallow.push(val);
          } else {
            this.rules[agent].allow.push(val);
          }
        }
      }
    }
  }

  isAllowed(userAgent, path) {
    const agentLower = userAgent.toLowerCase();
    // Try matching specific agent rules, fallback to wildcard '*' rules
    const agentsToTest = [agentLower, '*'];
    
    for (const agent of agentsToTest) {
      if (this.rules[agent]) {
        // Simple prefix check for rules.
        // A more advanced parser would support wildcard patterns, but prefix match is the base standard.
        // Check Allow paths first:
        for (const allowPattern of this.rules[agent].allow) {
          if (allowPattern && path.startsWith(allowPattern)) {
            return true;
          }
        }
        
        // Check Disallow paths next:
        for (const disallowPattern of this.rules[agent].disallow) {
          if (disallowPattern && (disallowPattern === '/' || path.startsWith(disallowPattern))) {
            return false;
          }
        }
      }
    }
    return true;
  }
}

/**
 * Safe fetch wrapper that handles timeouts, follows redirects with safety checks, and prevents SSRF.
 */
async function safeFetch(urlStr, options = {}, logs = []) {
  const timeoutMs = (options.timeout || DEFAULT_REQUEST_TIMEOUT) * 1000;
  const maxRedirects = 5;
  let currentUrl = urlStr;
  let redirectCount = 0;

  const headers = {
    'User-Agent': 'Mozilla/5.0 (compatible; BrandAuditBot/1.0; +https://github.com/Antigravity/brand-ai-readiness-audit)',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    ...(options.headers || {})
  };

  while (redirectCount <= maxRedirects) {
    // 1. SSRF and Domain safety checks
    const { urlObj } = await validateUrlAndResolveIP(currentUrl);

    // 2. Fetch page with Timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Use redirect: 'manual' to intercept redirects and run SSRF check on target
      const response = await fetch(currentUrl, {
        headers,
        signal: controller.signal,
        redirect: 'manual'
      });

      clearTimeout(timeoutId);

      // Handle redirect status codes manually (301, 302, 303, 307, 308)
      if (response.status >= 300 && response.status < 400) {
        let redirectLocation = response.headers.get('location');
        if (!redirectLocation) {
          throw new Error(`HTTP redirect status ${response.status} returned without location header.`);
        }

        // If redirect URL is relative, resolve it against the current URL
        if (!/^https?:\/\//i.test(redirectLocation)) {
          redirectLocation = new URL(redirectLocation, currentUrl).toString();
        }

        redirectCount++;
        logs.push(`[Crawler] Redirected (${response.status}) to: ${redirectLocation}`);
        currentUrl = redirectLocation;
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP status code ${response.status}`);
      }

      // Check Content-Length to prevent memory exhaustion (limit: 2MB)
      const contentLengthHeader = response.headers.get('content-length');
      if (contentLengthHeader) {
        const contentLength = parseInt(contentLengthHeader, 10);
        if (contentLength > 2 * 1024 * 1024) {
          throw new Error(`Response size limit exceeded: ${contentLength} bytes (Max: 2MB).`);
        }
      }

      const text = await response.text();
      return {
        url: currentUrl,
        status: response.status,
        html: text,
        headers: response.headers
      };

    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeoutMs / 1000}s`);
      }
      throw err;
    }
  }

  throw new Error(`Too many redirects (max: ${maxRedirects})`);
}

/**
 * Main Web Crawler implementation.
 */
async function crawlWebsite(startUrl, customConfig = {}, logs = []) {
  const maxPages = customConfig.maxPages || DEFAULT_MAX_PAGES;
  const maxDepth = customConfig.maxDepth || DEFAULT_MAX_DEPTH;
  const requestTimeout = customConfig.timeout || DEFAULT_REQUEST_TIMEOUT;

  logs.push(`[Crawler] Initializing crawler for: ${startUrl}`);
  logs.push(`[Crawler] Settings: MAX_PAGES=${maxPages}, MAX_DEPTH=${maxDepth}, REQUEST_TIMEOUT=${requestTimeout}s`);

  // Parse start URL domain for scoping
  let startUrlObj;
  let startIP;
  try {
    const check = await validateUrlAndResolveIP(startUrl);
    startUrlObj = check.urlObj;
    startIP = check.ip;
  } catch (err) {
    logs.push(`[Crawler] Initial validation failed: ${err.message}`);
    throw err;
  }

  const startHostname = startUrlObj.hostname;
  
  // 1. Fetch robots.txt first
  let robotsTxt = '';
  let robotsRules = new RobotsTxtRules('');
  try {
    const robotsUrl = `${startUrlObj.protocol}//${startHostname}/robots.txt`;
    logs.push(`[Crawler] Fetching robots.txt rules from: ${robotsUrl}`);
    const robotsRes = await safeFetch(robotsUrl, { timeout: requestTimeout }, logs);
    robotsTxt = robotsRes.html;
    robotsRules = new RobotsTxtRules(robotsTxt);
    logs.push(`[Crawler] robots.txt retrieved successfully.`);
  } catch (err) {
    logs.push(`[Crawler] robots.txt check skipped or failed: ${err.message}. Assuming fully allowed.`);
  }

  // 2. Fetch llms.txt status
  let llmsTxtStatus = 404;
  try {
    const llmsUrl = `${startUrlObj.protocol}//${startHostname}/llms.txt`;
    logs.push(`[Crawler] Checking for emerging AI standard llms.txt at: ${llmsUrl}`);
    const llmsController = new AbortController();
    const llmsTimeoutId = setTimeout(() => llmsController.abort(), 4000);
    const llmsResponse = await fetch(llmsUrl, { redirect: 'manual', signal: llmsController.signal });
    clearTimeout(llmsTimeoutId);
    llmsTxtStatus = llmsResponse.status;
    logs.push(`[Crawler] Checked /llms.txt. Status: ${llmsTxtStatus}`);
  } catch (err) {
    logs.push(`[Crawler] Checked /llms.txt. Skipped: ${err.message}`);
  }

  // Crawler queue states
  const visited = new Set();
  const queue = [{ url: startUrl, depth: 0 }];
  const crawledPages = [];

  while (queue.length > 0 && crawledPages.length < maxPages) {
    const { url, depth } = queue.shift();

    if (visited.has(url)) continue;
    visited.add(url);

    // Parse URL object to check path and host scope
    let urlObj;
    try {
      urlObj = new URL(url);
    } catch (e) {
      continue;
    }

    // Enforce scoping: Stay within the same base domain name
    // e.g. Allow example.com and www.example.com to match, but block external.com
    const cleanHostname = urlObj.hostname.replace('www.', '').toLowerCase();
    const cleanStartHost = startHostname.replace('www.', '').toLowerCase();

    if (cleanHostname !== cleanStartHost) {
      // Skip out-of-scope external URLs
      continue;
    }

    // Check Robots.txt permission for crawler bot
    if (!robotsRules.isAllowed('BrandAuditBot', urlObj.pathname)) {
      logs.push(`[Crawler] Skipping page disallowed by robots.txt: ${urlObj.pathname}`);
      continue;
    }

    logs.push(`[Crawler] Crawling page [${crawledPages.length + 1}/${maxPages}] (Depth ${depth}): ${url}`);

    try {
      const pageData = await safeFetch(url, { timeout: requestTimeout }, logs);
      crawledPages.push({
        url: pageData.url,
        html: pageData.html,
        status: pageData.status,
        depth: depth
      });

      // Extract internal links if depth limit is not reached
      if (depth < maxDepth) {
        const $ = cheerio.load(pageData.html);
        const anchors = $('a[href]');

        anchors.each((_, anchor) => {
          let href = $(anchor).attr('href');
          if (!href) return;

          // Trim anchors
          href = href.split('#')[0].trim();
          if (!href) return;

          try {
            // Resolve relative link
            const resolvedUrl = new URL(href, pageData.url).toString();
            const resObj = new URL(resolvedUrl);

            // Filter for http/https, ignore mailto:, tel:, javascript: etc.
            if (resObj.protocol === 'http:' || resObj.protocol === 'https:') {
              if (!visited.has(resolvedUrl)) {
                queue.push({ url: resolvedUrl, depth: depth + 1 });
              }
            }
          } catch (e) {
            // Ignore parse errors on invalid anchor links
          }
        });
      }

    } catch (err) {
      logs.push(`[Crawler] Failed crawling page ${url}: ${err.message}`);
      crawledPages.push({
        url: url,
        html: '',
        status: 500,
        error: err.message,
        depth: depth
      });
    }
  }

  logs.push(`[Crawler] Finished. Total pages audited successfully: ${crawledPages.length}`);

  return {
    crawledPages,
    robotsTxt,
    llmsTxtStatus,
    targetUrl: startUrl,
    hostname: startHostname
  };
}

module.exports = {
  validateUrlAndResolveIP,
  crawlWebsite,
  isPrivateIP,
  RobotsTxtRules
};
