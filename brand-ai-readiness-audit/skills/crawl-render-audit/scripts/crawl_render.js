const cheerio = require('cheerio');

/**
 * Technical Crawl & Render Auditor
 * @param {string} html Raw page HTML content
 * @param {string} robotsTxt Content of robots.txt (optional)
 * @param {number} llmsTxtStatus HTTP status of /llms.txt (e.g. 200, 404)
 * @param {string} url Target website URL
 */
function auditCrawlRender(html, robotsTxt, llmsTxtStatus, url, crawledPages = []) {
  const $ = cheerio.load(html || '');
  const findings = [];
  let score = 50; // Max score for this component is 50 points

  // Ensure crawledPages contains at least the home page data if empty
  const pagesToAudit = crawledPages && crawledPages.length > 0 
    ? crawledPages 
    : [{ url, html, status: 200, depth: 0 }];

  // Check 1: Robots.txt AI Agent crawling rules (15 pts)
  let robotsScore = 15;
  const blockedBots = [];
  const aiBots = ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'Google-Extended', 'PerplexityBot', 'OAI-SearchBot'];
  
  if (robotsTxt) {
    const lines = robotsTxt.split('\n');
    let currentAgent = '';
    for (let line of lines) {
      line = line.trim().toLowerCase();
      if (line.startsWith('user-agent:')) {
        currentAgent = line.split(':')[1].trim();
      } else if (line.startsWith('disallow:')) {
        const path = line.split(':')[1].trim();
        if (path === '/' || path === '/*') {
          for (const bot of aiBots) {
            if (currentAgent === '*' || currentAgent === bot.toLowerCase()) {
              if (!blockedBots.includes(bot)) {
                blockedBots.push(bot);
              }
            }
          }
        }
      }
    }
  }

  if (blockedBots.length > 0) {
    const allBlocked = blockedBots.length === aiBots.length || blockedBots.includes('*');
    const severity = allBlocked ? 'CRITICAL' : 'HIGH';
    robotsScore = allBlocked ? 0 : Math.max(0, 15 - (blockedBots.length * 3));
    findings.push({
      id: 'F-CR-01',
      title: allBlocked ? 'AI Search Bots completely blocked in robots.txt' : 'Multiple AI crawlers blocked in robots.txt',
      severity: severity,
      evidence: `robots.txt restricts access. Blocked bots: ${blockedBots.join(', ')}.`,
      suggested_action: `Update your robots.txt file to allow AI crawlers. Add:
User-agent: GPTBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Google-Extended
Allow: /`,
      priority: allBlocked ? 'IMMEDIATE' : 'HIGH'
    });
  }
  score -= (15 - robotsScore);

  // Check 2: Structured Data JSON-LD Schema (15 pts)
  let schemaScore = 15;
  const foundSchemas = [];
  let totalJsonLdScripts = 0;
  
  // Scan all crawled pages for JSON-LD scripts to find all schemas
  pagesToAudit.forEach(page => {
    if (!page.html) return;
    const page$ = cheerio.load(page.html);
    const scripts = page$('script[type="application/ld+json"]');
    totalJsonLdScripts += scripts.length;
    
    scripts.each((_, script) => {
      try {
        const content = page$(script).html();
        const parsed = JSON.parse(content);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of items) {
          if (item['@type']) {
            foundSchemas.push(item['@type']);
          } else if (item['@graph']) {
            for (const graphItem of item['@graph']) {
              if (graphItem['@type']) {
                foundSchemas.push(graphItem['@type']);
              }
            }
          }
        }
      } catch (e) {
        // JSON syntax error
      }
    });
  });

  // Deduplicate found schemas
  const uniqueSchemas = [...new Set(foundSchemas)];

  if (uniqueSchemas.length === 0) {
    schemaScore = 0;
    findings.push({
      id: 'F-CR-02',
      title: 'Missing structured data (Schema.org JSON-LD)',
      severity: 'HIGH',
      evidence: `0 structured data markup scripts found across all ${pagesToAudit.length} audited page(s).`,
      suggested_action: 'Add JSON-LD structured data to your pages (e.g., Organization, LocalBusiness, Product, or Article schemas) to help AI search engines identify facts and entity relationships.',
      priority: 'HIGH'
    });
  } else {
    const hasOrg = uniqueSchemas.some(type => 
      ['Organization', 'LocalBusiness', 'WebSite', 'Brand'].includes(type) ||
      (Array.isArray(type) && type.some(t => ['Organization', 'LocalBusiness', 'WebSite', 'Brand'].includes(t)))
    );
    if (!hasOrg) {
      schemaScore = 8;
      findings.push({
        id: 'F-CR-03',
        title: 'Structured data missing Organization or LocalBusiness identity',
        severity: 'MEDIUM',
        evidence: `Found structured schemas: [${uniqueSchemas.join(', ')}], but missing main brand Organization/LocalBusiness entity.`,
        suggested_action: 'Incorporate an Organization JSON-LD block on the home page linking the brand identity, logo, and social channels.',
        priority: 'MEDIUM'
      });
    }
  }
  score -= (15 - schemaScore);

  // Check 3: JS Rendering dependence (10 pts)
  let jsScore = 10;
  let jsDependentPagesCount = 0;
  
  pagesToAudit.forEach(page => {
    if (!page.html) return;
    const page$ = cheerio.load(page.html);
    const bodyText = page$('body').text() || '';
    const textLength = bodyText.replace(/\s+/g, '').length;
    const hasAppDiv = page$('#root, #app, #__next, [data-reactroot]').length > 0;
    
    if (textLength < 250 && hasAppDiv) {
      jsDependentPagesCount++;
    }
  });

  if (jsDependentPagesCount > 0) {
    jsScore = jsDependentPagesCount === pagesToAudit.length ? 2 : 6;
    findings.push({
      id: 'F-CR-04',
      title: 'Critical content requires client-side JavaScript rendering',
      severity: 'HIGH',
      evidence: `${jsDependentPagesCount} out of ${pagesToAudit.length} audited page(s) require JavaScript to render. Raw HTML payload is virtually empty.`,
      suggested_action: 'Implement Server-Side Rendering (SSR) or Static Site Generation (SSG) so search and AI bots can read the page facts directly from the raw HTML payload.',
      priority: 'HIGH'
    });
  }
  score -= (10 - jsScore);

  // Check 4: Image alt text coverage (5 pts)
  let altScore = 5;
  let totalImages = 0;
  let missingAltCount = 0;
  
  pagesToAudit.forEach(page => {
    if (!page.html) return;
    const page$ = cheerio.load(page.html);
    const images = page$('img');
    totalImages += images.length;
    images.each((_, img) => {
      const alt = page$(img).attr('alt');
      if (alt === undefined || alt.trim() === '') {
        missingAltCount++;
      }
    });
  });

  if (totalImages > 0) {
    const missingRatio = missingAltCount / totalImages;
    if (missingRatio > 0.25) {
      altScore = Math.max(0, Math.round(5 - (missingRatio * 5)));
      findings.push({
        id: 'F-CR-05',
        title: 'High ratio of images missing descriptive alt text',
        severity: 'LOW',
        evidence: `${missingAltCount} out of ${totalImages} image(s) (${Math.round(missingRatio * 100)}%) across the site lack descriptive 'alt' attributes.`,
        suggested_action: 'Add meaningful alt attributes containing facts, diagrams labels, or company names to all img elements.',
        priority: 'LOW'
      });
    }
  }
  score -= (5 - altScore);

  // Check 5: llms.txt availability (5 pts)
  let llmsScore = 5;
  if (llmsTxtStatus !== 200) {
    llmsScore = 0;
    findings.push({
      id: 'F-CR-06',
      title: 'Missing llms.txt file',
      severity: 'LOW',
      evidence: `llms.txt file is not present at domain root (HTTP Status: ${llmsTxtStatus || 404}).`,
      suggested_action: 'Create an llms.txt file at the root directory of your website explaining your site structure, main pages, and content summary specifically formatted for AI assistants.',
      priority: 'LOW'
    });
  }
  score -= (5 - llmsScore);

  return {
    score,
    findings
  };
}

module.exports = { auditCrawlRender };
