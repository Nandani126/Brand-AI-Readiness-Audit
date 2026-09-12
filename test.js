const assert = require('assert');
const { isPrivateIP, validateUrlAndResolveIP, RobotsTxtRules } = require('./brand-ai-readiness-audit/skills/audit-orchestrator/scripts/crawler.js');
const { auditCrawlRender } = require('./brand-ai-readiness-audit/skills/crawl-render-audit/scripts/crawl_render.js');
const { auditFreshness } = require('./brand-ai-readiness-audit/skills/freshness-corroboration/scripts/freshness.js');
const { auditEngagement } = require('./brand-ai-readiness-audit/skills/engagement-audit/scripts/engagement.js');

// Color helpers for terminal output
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;

let passedTestsCount = 0;
let totalTestsCount = 0;

function runTest(name, fn) {
  totalTestsCount++;
  console.log(`Running test: ${name}...`);
  try {
    fn();
    console.log(green(`  ✓ Passed`));
    passedTestsCount++;
  } catch (err) {
    console.error(red(`  ✗ Failed`));
    console.error(err);
  }
}

console.log(yellow('=============================================='));
console.log(yellow('   BRAND AI-READINESS AUDIT TEST RUNNER      '));
console.log(yellow('==============================================\n'));

// Test Group 1: SSRF Guard & IP Validation
runTest('isPrivateIP filters local and internal IPv4 addresses', () => {
  assert.strictEqual(isPrivateIP('127.0.0.1'), true);
  assert.strictEqual(isPrivateIP('10.0.5.1'), true);
  assert.strictEqual(isPrivateIP('192.168.1.100'), true);
  assert.strictEqual(isPrivateIP('172.16.0.5'), true);
  assert.strictEqual(isPrivateIP('169.254.169.254'), true);
  assert.strictEqual(isPrivateIP('0.0.0.0'), true);
  assert.strictEqual(isPrivateIP('8.8.8.8'), false); // Google DNS (public)
  assert.strictEqual(isPrivateIP('142.250.190.46'), false); // Google public IP
});

runTest('isPrivateIP filters local and internal IPv6 addresses', () => {
  assert.strictEqual(isPrivateIP('::1'), true);
  assert.strictEqual(isPrivateIP('fe80::1'), true);
  assert.strictEqual(isPrivateIP('fc00::'), true);
  assert.strictEqual(isPrivateIP('fdff:ffff:ffff:ffff::'), true);
  assert.strictEqual(isPrivateIP('2001:4860:4860::8888'), false); // Google DNS IPv6 (public)
});

runTest('validateUrlAndResolveIP rejects dangerous schemes and domains', async () => {
  // Invalid protocol
  await assert.rejects(
    validateUrlAndResolveIP('ftp://example.com'),
    /Forbidden protocol scheme/
  );
  // Malformed URL
  await assert.rejects(
    validateUrlAndResolveIP('not-a-url'),
    /Malformed URL format/
  );
  // Resolves to private IP
  await assert.rejects(
    validateUrlAndResolveIP('http://localhost'),
    /SSRF Guard/
  );
});

// Test Group 2: Robots.txt AI Agent Rules Matcher
runTest('RobotsTxtRules parses and respects disallow/allow instructions', () => {
  const robotsContent = `
User-agent: GPTBot
Disallow: /admin
Disallow: /private/

User-agent: ClaudeBot
Disallow: /

User-agent: *
Disallow: /temp/
Allow: /temp/public
  `;

  const rules = new RobotsTxtRules(robotsContent);

  // GPTBot allowed/disallowed paths
  assert.strictEqual(rules.isAllowed('GPTBot', '/index.html'), true);
  assert.strictEqual(rules.isAllowed('GPTBot', '/admin/dashboard'), false);
  assert.strictEqual(rules.isAllowed('GPTBot', '/private/file.txt'), false);

  // ClaudeBot completely disallowed
  assert.strictEqual(rules.isAllowed('ClaudeBot', '/index.html'), false);
  assert.strictEqual(rules.isAllowed('ClaudeBot', '/about'), false);

  // Wildcard agent paths
  assert.strictEqual(rules.isAllowed('PerplexityBot', '/index.html'), true);
  assert.strictEqual(rules.isAllowed('PerplexityBot', '/temp/secret'), false);
  assert.strictEqual(rules.isAllowed('PerplexityBot', '/temp/public/page'), true);
});

// Test Group 3: Technical Crawl & Render Audit Parser (HTML Fixtures)
runTest('auditCrawlRender detects structured data schema and missing llms.txt', () => {
  // Empty page HTML
  const emptyHtml = `<html><body><div id="root"></div></body></html>`;
  const resultEmpty = auditCrawlRender(emptyHtml, '', 404, 'https://example.com');
  
  // Score should be penalised for missing Structured Data, JS Render reliance, and missing llms.txt
  assert.ok(resultEmpty.score < 25);
  assert.ok(resultEmpty.findings.some(f => f.id === 'F-CR-02')); // Missing structured data
  assert.ok(resultEmpty.findings.some(f => f.id === 'F-CR-04')); // JS dependent
  assert.ok(resultEmpty.findings.some(f => f.id === 'F-CR-06')); // Missing llms.txt

  // Good page HTML containing valid schema and meta
  const goodHtml = `
    <html>
      <head>
        <title>TechCorp Brand | Solutions</title>
        <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "TechCorp",
            "url": "https://example.com"
          }
        </script>
      </head>
      <body>
        <h1>Optimized Value Proposition Title</h1>
        <img src="logo.png" alt="TechCorp official brand logo" />
      </body>
    </html>
  `;
  const resultGood = auditCrawlRender(goodHtml, '', 200, 'https://example.com');
  
  // Score should be high
  assert.ok(resultGood.score >= 45); // Deducted 0 for Schema, 0 for JS render, 0 for alt text, 0 for llms.txt
  assert.strictEqual(resultGood.findings.length, 0); // No discoverability problems
});

// Test Group 4: Freshness & Corroboration parser
runTest('auditFreshness identifies outdated years and missing citations', () => {
  const staleHtml = `
    <html>
      <body>
        <p>Stale details from 2023.</p>
        <footer>Copyright 2023 TechCorp</footer>
      </body>
    </html>
  `;
  const resultStale = auditFreshness(staleHtml, 'https://example.com');
  assert.ok(resultStale.findings.some(f => f.id === 'F-FC-01')); // Outdated copyright
  assert.ok(resultStale.findings.some(f => f.id === 'F-FC-04')); // Missing citations

  const freshHtml = `
    <html>
      <head>
        <title>Active Company Title</title>
        <meta name="revised" content="2026-08-28" />
      </head>
      <body>
        <p>Dynamic page citing research links <a href="https://wikipedia.org/wiki/AI">Wiki link</a></p>
        <footer>Copyright © 2026 TechCorp Inc.</footer>
      </body>
    </html>
  `;
  const resultFresh = auditFreshness(freshHtml, 'https://example.com');
  assert.strictEqual(resultFresh.findings.length, 0);
  assert.strictEqual(resultFresh.score, 25); // Max points
});

// Test Group 5: On-Site Engagement UX parser
runTest('auditEngagement checks single H1, CTA elements, and policy links', () => {
  // Bad UX: Missing H1, missing CTA buttons, missing policies
  const badUxHtml = `<html><body><p>Only text.</p></body></html>`;
  const resultBad = auditEngagement(badUxHtml, 'https://example.com');
  assert.ok(resultBad.findings.some(f => f.id === 'F-EN-01')); // Missing H1
  assert.ok(resultBad.findings.some(f => f.id === 'F-EN-04')); // Inaccessible nav
  assert.ok(resultBad.findings.some(f => f.id === 'F-EN-06')); // Missing CTAs
  assert.ok(resultBad.findings.some(f => f.id === 'F-EN-08')); // Missing policy pages

  // Good UX: Clean elements, buttons, and footers
  const goodUxHtml = `
    <html>
      <body>
        <header>
          <nav>
            <a href="/">Home</a>
            <a href="/features">Features</a>
            <a href="/pricing">Pricing</a>
          </nav>
        </header>
        <main>
          <h1>Enterprise AI readiness audit tool dashboard</h1>
          <button class="btn">Get started now for free</button>
          <a href="/features" class="btn">Learn more of features</a>
          
          <h2>System Features</h2>
          <p>Our platform provides a state of the art brand readiness auditing framework specifically designed to help modern enterprises discover and optimize their content for LLM powered search engines like SearchGPT, Perplexity, and Claude. By analyzing robots.txt crawlers rules, checking JSON-LD Schema structured data graphs, looking for hidden text elements behind JavaScript walls, and evaluating alt descriptions, we ensure maximum visibility in search results. Furthermore, our engine benchmarks human engagement criteria, including navigation usability interfaces, heading semantic level skips, visual call to action buttons count, footer trust page matches (like privacy declarations, support contact points, and terms of service documents), and overall body text readability flow. These metrics are processed and normalized to calculate a final score, highlight critical problems, assign severity weights, and provide actionable prioritizing recommendations. Start your automated audit today to unlock premium analytics reports and download compliance marketplace assets instantly.</p>
        </main>
        <footer>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/contact">Contact Support</a>
        </footer>
      </body>
    </html>
  `;
  const resultGood = auditEngagement(goodUxHtml, 'https://example.com');
  assert.strictEqual(resultGood.findings.length, 0);
  assert.strictEqual(resultGood.score, 50); // Max points
});

// Summarize Test Run results
console.log(yellow('\n=============================================='));
console.log(yellow('   TEST RESULTS SUMMARY'));
console.log(yellow('=============================================='));
console.log(`Passed: ${green(`${passedTestsCount}/${totalTestsCount}`)} tests.`);

if (passedTestsCount === totalTestsCount) {
  console.log(green('\n✓ All tests passed successfully!'));
  process.exit(0);
} else {
  console.error(red('\n✗ Some tests failed. Please review output trace.'));
  process.exit(1);
}
