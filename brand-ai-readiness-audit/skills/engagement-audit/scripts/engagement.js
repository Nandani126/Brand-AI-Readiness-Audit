const cheerio = require('cheerio');

/**
 * On-Site Engagement Auditor
 * @param {string} html Raw page HTML content
 * @param {string} url Target website URL
 */
function auditEngagement(html, url, crawledPages = []) {
  const $ = cheerio.load(html || '');
  const findings = [];
  let score = 50; // Max score for this component is 50 points

  // Ensure crawledPages contains at least the home page data if empty
  const pagesToAudit = crawledPages && crawledPages.length > 0 
    ? crawledPages 
    : [{ url, html, status: 200, depth: 0 }];

  // Find the homepage in the list (depth === 0)
  const homePage = pagesToAudit.find(p => p.depth === 0) || pagesToAudit[0];

  // Check 1: Value Proposition / H1 elements on Homepage (15 pts)
  let h1Score = 15;
  const home$ = cheerio.load(homePage.html || '');
  const h1Elements = home$('h1');
  
  if (h1Elements.length === 0) {
    h1Score = 0;
    findings.push({
      id: 'F-EN-01',
      title: 'Missing H1 heading (No defined value proposition)',
      severity: 'HIGH',
      evidence: '0 H1 elements found on the main landing page.',
      suggested_action: 'Add a singular, prominent <h1> header at the top of the page clearly stating your business value proposition or the primary purpose of the page.',
      priority: 'HIGH'
    });
  } else if (h1Elements.length > 1) {
    h1Score = 8;
    findings.push({
      id: 'F-EN-02',
      title: 'Multiple H1 headings present',
      severity: 'MEDIUM',
      evidence: `Found ${h1Elements.length} H1 headers on the main landing page. Pages should only have a single main title.`,
      suggested_action: 'Consolidate H1 structures. Keep only one H1 for the main heading, and demote others to H2 or H3 tags.',
      priority: 'MEDIUM'
    });
  } else {
    // Check length of singular H1
    const h1Text = h1Elements.first().text().trim();
    if (h1Text.length < 10) {
      h1Score = 10;
      findings.push({
        id: 'F-EN-03',
        title: 'H1 heading is too short or generic',
        severity: 'LOW',
        evidence: `H1 heading "${h1Text}" is only ${h1Text.length} characters long.`,
        suggested_action: 'Expand the H1 text to clearly describe what your product/service does (ideally between 15-60 characters).',
        priority: 'LOW'
      });
    }
  }
  score -= (15 - h1Score);

  // Check 2: Navigation menu accessibility (10 pts)
  let navScore = 10;
  let hasValidNav = false;
  let nonSemanticNav = false;
  
  pagesToAudit.forEach(page => {
    if (hasValidNav || !page.html) return;
    const page$ = cheerio.load(page.html);
    const navContainer = page$('nav, [role="navigation"], .nav, .navigation, .menu, #menu');
    const navLinks = navContainer.find('a');
    
    if (navContainer.length > 0 && navLinks.length >= 3) {
      hasValidNav = true;
    } else {
      const headerLinks = page$('header a, #header a');
      if (headerLinks.length >= 3) {
        nonSemanticNav = true;
      }
    }
  });

  if (!hasValidNav) {
    if (nonSemanticNav) {
      navScore = 7;
      findings.push({
        id: 'F-EN-05',
        title: 'Non-semantic navigation structure',
        severity: 'LOW',
        evidence: 'Header links exist, but they are not wrapped in a semantic <nav> element or navigation ARIA role.',
        suggested_action: 'Wrap header navigation links in a semantic <nav> element to improve accessibility and machine readability.',
        priority: 'LOW'
      });
    } else {
      navScore = 0;
      findings.push({
        id: 'F-EN-04',
        title: 'Inaccessible navigation menu structure',
        severity: 'HIGH',
        evidence: 'No clear semantic navigation container (<nav>) or header link structures found on the website pages.',
        suggested_action: 'Implement a semantic <nav> block containing a clean list of links to help human users and crawlers explore key website pages.',
        priority: 'HIGH'
      });
    }
  }
  score -= (10 - navScore);

  // Check 3: Clear CTA paths (10 pts)
  let ctaScore = 10;
  const ctaSelector = 'button, a.btn, a.button, input[type="submit"], .btn, .button';
  let totalMatchingCtas = 0;
  let maxButtonsFound = 0;
  const ctaTerms = ['get started', 'buy', 'sign up', 'register', 'subscribe', 'join', 'try for free', 'contact us', 'download', 'learn more', 'shop'];

  pagesToAudit.forEach(page => {
    if (!page.html) return;
    const page$ = cheerio.load(page.html);
    const ctaElements = page$(ctaSelector);
    if (ctaElements.length > maxButtonsFound) maxButtonsFound = ctaElements.length;
    
    ctaElements.each((_, el) => {
      const text = page$(el).text().trim().toLowerCase();
      if (ctaTerms.some(term => text.includes(term))) {
        totalMatchingCtas++;
      }
    });
  });

  if (totalMatchingCtas === 0) {
    ctaScore = 0;
    findings.push({
      id: 'F-EN-06',
      title: 'Missing clear Call-To-Action (CTA) elements',
      severity: 'HIGH',
      evidence: `Found buttons/links, but 0 contain common action-oriented terms.`,
      suggested_action: 'Add at least one prominent Call-To-Action button (e.g. "Get Started" or "Contact Us") in the hero section of the landing page.',
      priority: 'HIGH'
    });
  } else if (totalMatchingCtas < 2 && maxButtonsFound < 3) {
    ctaScore = 7;
    findings.push({
      id: 'F-EN-07',
      title: 'Low Call-To-Action visual cue count',
      severity: 'MEDIUM',
      evidence: `Only ${totalMatchingCtas} CTA element(s) detected across the site.`,
      suggested_action: 'Ensure secondary CTAs (like "Learn More") are available below the fold to guide users who need more context.',
      priority: 'MEDIUM'
    });
  }
  score -= (10 - ctaScore);

  // Check 4: Essential Trust policy pages (10 pts)
  let trustScore = 10;
  let hasPrivacy = false;
  let hasTerms = false;
  let hasContact = false;

  pagesToAudit.forEach(page => {
    if (!page.html) return;
    const page$ = cheerio.load(page.html);
    const links = page$('a');

    links.each((_, link) => {
      const text = page$(link).text().trim().toLowerCase();
      const href = page$(link).attr('href') || '';
      
      if (text.includes('privacy') || href.includes('privacy')) hasPrivacy = true;
      if (text.includes('terms') || text.includes('conditions') || href.includes('terms') || href.includes('tos')) hasTerms = true;
      if (text.includes('contact') || text.includes('support') || href.includes('contact') || href.includes('support') || href.includes('help')) hasContact = true;
    });
  });

  const missingTrustPages = [];
  if (!hasPrivacy) missingTrustPages.push('Privacy Policy');
  if (!hasTerms) missingTrustPages.push('Terms of Service / Conditions');
  if (!hasContact) missingTrustPages.push('Contact / Support Page');

  if (missingTrustPages.length > 0) {
    trustScore = Math.max(0, 10 - (missingTrustPages.length * 3.5));
    findings.push({
      id: 'F-EN-08',
      title: 'Missing critical trust policy pages',
      severity: 'MEDIUM',
      evidence: `Missing links for: ${missingTrustPages.join(', ')} across all crawled pages.`,
      suggested_action: `Create and link essential pages (e.g. /privacy, /terms, /contact) in the website footer to satisfy compliance and trust markers.`,
      priority: 'MEDIUM'
    });
  }
  score -= (10 - trustScore);

  // Check 5: Reading Flow & Layout structure (5 pts)
  let flowScore = 5;
  let minWordsCount = 999999;
  let homeWordCount = 0;
  let hasHeadingSkip = false;

  pagesToAudit.forEach(page => {
    if (!page.html) return;
    const page$ = cheerio.load(page.html);
    const bodyText = page$('body').text() || '';
    const wordCount = bodyText.trim().split(/\s+/).length;
    if (wordCount < minWordsCount) minWordsCount = wordCount;
    if (page.depth === 0) homeWordCount = wordCount;

    // Check heading skips on this page
    const headingLevels = [];
    page$('h1, h2, h3, h4, h5, h6').each((_, heading) => {
      headingLevels.push(parseInt(heading.tagName.substring(1), 10));
    });

    for (let i = 1; i < headingLevels.length; i++) {
      if (headingLevels[i] - headingLevels[i-1] > 1) {
        hasHeadingSkip = true;
        break;
      }
    }
  });

  if (homeWordCount < 150) {
    flowScore = 2;
    findings.push({
      id: 'F-EN-09',
      title: 'Insufficient text content for user engagement',
      severity: 'MEDIUM',
      evidence: `Landing page contains only ${homeWordCount} words, which fails to provide sufficient context for incoming visitors.`,
      suggested_action: 'Expand the page content to provide a clear narrative, descriptions of core features, and supporting copy.',
      priority: 'MEDIUM'
    });
  } else if (hasHeadingSkip) {
    flowScore = 4;
    findings.push({
      id: 'F-EN-10',
      title: 'Non-sequential heading level hierarchy',
      severity: 'LOW',
      evidence: `Detected gaps in headings ordering (e.g. H1 skipping directly to H3) on one or more pages.`,
      suggested_action: 'Reorder headings structurally (e.g. H2 must follow H1, H3 must follow H2) to improve reading flow and accessibility.',
      priority: 'LOW'
    });
  }
  score -= (5 - flowScore);

  return {
    score,
    findings
  };
}

module.exports = { auditEngagement };
