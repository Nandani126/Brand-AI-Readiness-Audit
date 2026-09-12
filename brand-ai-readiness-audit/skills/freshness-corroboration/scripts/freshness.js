const cheerio = require('cheerio');

/**
 * Freshness & Corroboration Auditor
 * @param {string} html Raw page HTML content
 * @param {string} url Target website URL
 */
function auditFreshness(html, url, crawledPages = []) {
  const $ = cheerio.load(html || '');
  const findings = [];
  let score = 25; // Max score for this component is 25 points

  // Ensure crawledPages contains at least the home page data if empty
  const pagesToAudit = crawledPages && crawledPages.length > 0 
    ? crawledPages 
    : [{ url, html, status: 200, depth: 0 }];

  // Check 1: Copyright year in footers (10 pts)
  let copyrightScore = 10;
  const currentYear = 2026;
  let youngestYear = 0;
  let hasCopyright = false;
  const allOlderYears = [];

  pagesToAudit.forEach(page => {
    if (!page.html) return;
    const page$ = cheerio.load(page.html);
    const footerText = page$('footer, .footer, #footer').text() || page$('body').text() || '';

    // Regex to find copyright indicators and years
    const copyrightRegex = /(?:copyright|©|\(c\))\s*(?:20\d{2}\s*-\s*)?(20\d{2})/i;
    const match = footerText.match(copyrightRegex);
    
    if (match) {
      hasCopyright = true;
      const yearFound = parseInt(match[1], 10);
      if (yearFound > youngestYear) youngestYear = yearFound;
    }

    const yearMatches = footerText.match(/\b(20\d{2})\b/g) || [];
    yearMatches.forEach(yr => {
      const yVal = Number(yr);
      if (yVal >= 2018 && yVal < currentYear) {
        allOlderYears.push(yVal);
      }
    });
  });

  if (hasCopyright && youngestYear > 0) {
    if (youngestYear < currentYear) {
      copyrightScore = Math.max(0, 10 - (currentYear - youngestYear) * 3);
      findings.push({
        id: 'F-FC-01',
        title: `Outdated copyright notice (${youngestYear})`,
        severity: 'MEDIUM',
        evidence: `Footer copyright across the website shows year ${youngestYear}, which is behind the current year ${currentYear}.`,
        suggested_action: `Update the footer copyright year to ${currentYear} manually or dynamically via JavaScript (e.g., \`new Date().getFullYear()\`).`,
        priority: 'MEDIUM'
      });
    }
  } else {
    // If no copyright found at all
    const uniqueOlder = [...new Set(allOlderYears)];
    if (uniqueOlder.length > 0) {
      copyrightScore = 5;
      findings.push({
        id: 'F-FC-02',
        title: 'Neglected update markers and outdated years',
        severity: 'MEDIUM',
        evidence: `No standard copyright notice found, but pages contain references to past years: ${uniqueOlder.join(', ')}.`,
        suggested_action: 'Perform a comprehensive content freshness audit and update stale dates and facts to reflect current operations.',
        priority: 'MEDIUM'
      });
    }
  }
  score -= (10 - copyrightScore);

  // Check 2: Last modified time metadata (5 pts)
  let modifiedScore = 5;
  let modifiedDatesCount = 0;
  
  pagesToAudit.forEach(page => {
    if (!page.html) return;
    const page$ = cheerio.load(page.html);
    const dateModified = page$('meta[property="article:modified_time"]').attr('content') ||
                         page$('meta[name="revised"]').attr('content') ||
                         page$('meta[property="og:updated_time"]').attr('content');
    
    if (dateModified) {
      modifiedDatesCount++;
    } else {
      const jsonLdScripts = page$('script[type="application/ld+json"]').html() || '';
      if (jsonLdScripts.includes('dateModified') || jsonLdScripts.includes('datePublished')) {
        modifiedDatesCount++;
      }
    }
  });

  if (modifiedDatesCount === 0) {
    modifiedScore = 2;
    findings.push({
      id: 'F-FC-03',
      title: 'Missing publication or modification timestamps',
      severity: 'LOW',
      evidence: `No dateModified or revised meta tags found, and JSON-LD structured schemas lack dateModified attributes across all pages.`,
      suggested_action: 'Add publication and last-updated metadata tags to articles and fact pages to signal information freshness to crawlers.',
      priority: 'LOW'
    });
  }
  score -= (5 - modifiedScore);

  // Check 3: External citations (5 pts)
  let citationScore = 5;
  let totalExternalLinks = 0;
  let totalAuthoritativeLinks = 0;
  
  let baseHostname = '';
  try {
    baseHostname = new URL(url).hostname;
  } catch (e) {}

  pagesToAudit.forEach(page => {
    if (!page.html) return;
    const page$ = cheerio.load(page.html);
    const links = page$('a[href]');

    links.each((_, link) => {
      const href = page$(link).attr('href');
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        try {
          const linkUrl = new URL(href);
          const linkHost = linkUrl.hostname.toLowerCase();
          const cleanBase = baseHostname.replace('www.', '').toLowerCase();
          const cleanLink = linkHost.replace('www.', '').toLowerCase();
          
          if (cleanLink !== cleanBase && cleanLink !== '') {
            totalExternalLinks++;
            // Check authority patterns
            if (linkHost.endsWith('.gov') || linkHost.endsWith('.edu') || linkHost.includes('wikipedia.org') || linkHost.includes('w3.org') || linkHost.includes('doi.org')) {
              totalAuthoritativeLinks++;
            }
          }
        } catch (e) {}
      }
    });
  });

  if (totalExternalLinks === 0) {
    citationScore = 2;
    findings.push({
      id: 'F-FC-04',
      title: 'Lack of external citation links (Corroboration Gap)',
      severity: 'MEDIUM',
      evidence: `The audited site contains 0 external link citations across ${pagesToAudit.length} pages, making it difficult for AI models to corroborate facts.`,
      suggested_action: 'Reference and link to external authoritative sources (e.g. statistics portals, research papers, public databases) to build E-E-A-T credentials.',
      priority: 'MEDIUM'
    });
  }
  score -= (5 - citationScore);

  // Check 4: Entity matches / Brand clarity (5 pts)
  let entityScore = 5;
  let genericTitlesCount = 0;
  let missingTitlesCount = 0;
  
  pagesToAudit.forEach(page => {
    if (!page.html) return;
    const page$ = cheerio.load(page.html);
    const pageTitle = page$('title').text() || '';
    
    if (pageTitle) {
      const titleLower = pageTitle.trim().toLowerCase();
      const genericTerms = ['home', 'index', 'welcome', 'my website', 'new page'];
      if (genericTerms.includes(titleLower) || titleLower.length < 5) {
        genericTitlesCount++;
      }
    } else {
      missingTitlesCount++;
    }
  });

  if (missingTitlesCount > 0) {
    entityScore = 0;
    findings.push({
      id: 'F-FC-06',
      title: 'Missing title tags on pages',
      severity: 'HIGH',
      evidence: `Missing <title> tags detected on ${missingTitlesCount} audited page(s). Title is the primary identifier for crawler indexing.`,
      suggested_action: 'Insert a descriptive <title> tag into the <head> section naming the brand and page purpose for every page.',
      priority: 'HIGH'
    });
  } else if (genericTitlesCount > 0) {
    entityScore = 2;
    findings.push({
      id: 'F-FC-05',
      title: 'High entity ambiguity in page titles',
      severity: 'MEDIUM',
      evidence: `${genericTitlesCount} page title(s) are generic (e.g., "Home", "Index") and do not name the company entity.`,
      suggested_action: 'Update title tags to follow a clear entity structure (e.g., "[Brand Name] | [Purpose/Value Proposition]").',
      priority: 'MEDIUM'
    });
  }
  score -= (5 - entityScore);

  return {
    score,
    findings
  };
}

module.exports = { auditFreshness };
