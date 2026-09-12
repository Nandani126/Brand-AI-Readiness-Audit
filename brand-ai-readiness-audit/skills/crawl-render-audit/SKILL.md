---
name: crawl-render-audit
description: Analyzes technical crawlability, AI bot permissions, structured schema data, and JS-rendering dependencies.
---

# Crawl & Render Audit Skill

This skill performs low-level technical crawling checks to ensure that AI search engines, agents, and automated scrapers can read, parse, and structure your website's content.

## 🔍 Audit Checklist

The auditing agent must evaluate these specific metrics:

### 1. AI Bot Crawl Access (Robots.txt)
- **Check**: Fetch `/robots.txt` from the root domain.
- **Rule**: Verify rules for user-agents: `GPTBot`, `ChatGPT-User`, `ClaudeBot`, `Google-Extended`, `PerplexityBot`, `OAI-SearchBot`.
- **Finding Flag**: If any of these are disallowed for important content sub-directories, report a `HIGH` severity finding. If all AI bots are disallowed, report a `CRITICAL` finding.

### 2. Structured Data Markup (Schema.org JSON-LD)
- **Check**: Parse the HTML document and look for `<script type="application/ld+json">` blocks.
- **Rule**: Verify the presence of standard schema types such as `Organization`, `LocalBusiness`, `Product`, `Article`, or `FAQPage`.
- **Finding Flag**: If zero structured schemas are found, report a `HIGH` severity finding (`F-001`). If schemas exist but miss crucial fields (e.g., `logo`, `url`, `contactPoint`), report a `MEDIUM` severity finding.

### 3. JavaScript Rendering Gaps
- **Check**: Compare the content in the raw HTML payload with expected visual elements (or check for client-rendered DOM dependencies).
- **Rule**: Core content, titles, and menus must be readable from raw HTML source code, as many AI bots do not execute heavy JS frameworks.
- **Finding Flag**: If raw body content is empty or contains only wrapper elements (e.g. `<div id="root"></div>`), report a `HIGH` severity finding.

### 4. Text Locked in Images (Missing Alt Text)
- **Check**: Count `<img>` tags on the page and verify if they have non-empty `alt` attributes.
- **Rule**: Important graphic content, badges, or text-heavy diagrams must have descriptive `alt` tags so LLMs can extract details.
- **Finding Flag**: If over 25% of images are missing `alt` attributes, report a `MEDIUM` or `LOW` severity finding.

### 5. Emerging AI Standards (`llms.txt`)
- **Check**: Try to fetch `/llms.txt` and `/.well-known/llms.txt`.
- **Rule**: Modern websites should offer an `llms.txt` summary file at the root to assist prompt-driven crawlers.
- **Finding Flag**: If missing, report a `LOW` severity finding with a suggestion to implement it.

---

## 🛠️ Automated Checker Script

This skill includes an automated helper script [crawl_render.js](file:///d:/Web%20TECH/brand-ai-readiness-audit/skills/crawl-render-audit/scripts/crawl_render.js) which performs the scraping and parsing. Use this script to gather raw evidence during execution.
