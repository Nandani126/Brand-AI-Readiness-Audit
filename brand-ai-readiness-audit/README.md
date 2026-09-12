# 🤖 Brand AI-Readiness Audit Marketplace

Welcome to the **Brand AI-Readiness Audit Marketplace**, built for **Round 3 of the Adobe University Hackathon 2026**. 

This repository implements a lightweight, compliant, and beginner-friendly auditing application that parses public website URLs to audit them for **AI Discoverability** (indexability by modern LLM engines and AI search bots) and **On-site Engagement** (human user navigation, layout, and retention signals). It structures the auditing capabilities as standalone **Agent Skills** conforming to the `agentskills.io` marketplace design.

---

## 🚀 System Architecture & Flow

The audit pipeline is orchestrator-driven. The entrypoint skill coordinates independent sub-skills and aggregates their individual metrics:

```text
                     Website URL (Arbitrary Public Domain)
                                       │
                                       ▼
                       ┌──────────────────────────────┐
                       │      [audit-orchestrator]    │ (Entrypoint Skill)
                       └──────────────┬───────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        ▼                             ▼                             ▼
  [crawl-render-audit]    [freshness-corroboration]       [engagement-audit]
   - Robots.txt bot rules  - Copyright footer years        - Single H1 title
   - JSON-LD structured    - Revised date metadata         - Navigation menu
   - JS SPA frameworks     - Outbound EEAT citation links  - Call-To-Action buttons
   - Alt text attributes   - Brand entity consistency      - Policy pages (Privacy/Terms)
   - /llms.txt standard                                    - Heading ordering skips
        │                             │                             │
        └─────────────────────────────┼─────────────────────────────┘
                                      ▼
                       ┌──────────────────────────────┐
                       │     [Consolidated Report]    │ (Score, Findings, MD Outputs)
                       └──────────────────────────────┘
```

1. **`audit-orchestrator`** (Entrypoint): Validates schemes, runs safe depth-limited crawling, triggers worker skills, normalizes severity tiers, deduplicates findings, and compiles the final report.
2. **`crawl-render-audit`**: Reviews robots.txt crawlers rules, scans Schema.org structured data, detects client-side rendering frameworks (JS gaps), and validates image alt labels.
3. **`freshness-corroboration`**: Audits copyright year currencies, revision signals, brand names consistency, and citation densities to external high-authority resources (.gov, .edu, wikipedia).
4. **`engagement-audit`**: Audits value proposition header clarity, semantic navigation menu tags, Call-To-Action buttons, and the presence of critical trust links (Privacy Policy, Terms of Service, Contact Page).

---

## 📁 Marketplace Directory Layout

This marketplace folder is packaged directly into a ZIP submission of less than 50MB:

```text
brand-ai-readiness-audit/
├── marketplace.json                 # Core skill configuration manifest
├── README.md                        # Project details and instructions (This file)
└── skills/
    ├── audit-orchestrator/
    │   ├── SKILL.md                 # Agent prompt instructions for orchestrator
    │   └── scripts/
    │       └── crawler.js           # SSRF validator, robots.txt parser, BFS crawler
    ├── crawl-render-audit/
    │   ├── SKILL.md                 # Technical crawler check guidelines
    │   ├── scripts/
    │   │   └── crawl_render.js      # Technical parser (cheerio based)
    │   └── references/
    │       └── agents.txt           # Reference of common AI crawler user-agents
    ├── freshness-corroboration/
    │   ├── SKILL.md                 # Trustworthiness evaluation guidelines
    │   └── scripts/
    │       └── freshness.js         # Date modified & citations parser
    └── engagement-audit/
        ├── SKILL.md                 # On-site layout engagement guidelines
        └── scripts/
            └── engagement.js        # CTA & navigation menu structure parser
```

---

## 📈 Scoring Matrix (100 Points Total)

| Component | Weight | Checked Metric | Points |
| :--- | :--- | :--- | :--- |
| **AI Discoverability** | **50 Points** | Robots.txt allows main AI agents (e.g. GPTBot, ClaudeBot) | 15 |
| | | Valid JSON-LD Structured Data (Organization/Product/Article) | 15 |
| | | Text content accessible in raw HTML (No JS render gap) | 10 |
| | | Presence of `/llms.txt` or `/.well-known/llms.txt` | 5 |
| | | Clear images description (Alt text coverage > 75%) | 5 |
| **On-Site Engagement** | **50 Points** | Clear header value proposition (H1 length and structure) | 15 |
| | | Accessible navigation menu structure | 10 |
| | | Clear Call-To-Action (CTA) elements | 10 |
| | | Trust policy pages present (Privacy, Terms, Contact) | 10 |
| | | Structured headings hierarchy and reading flow | 5 |

*Note: Freshness & Corroboration checks verify the authority credentials of AI Discoverability, evaluating copyright years (10 pts), updated/revised dates (5 pts), external citations (5 pts), and brand entity title clarity (5 pts) to contribute 25 points to the total score, mapping the rest of the engagement layout score to 25 points.*

---

## 🔴 Severity System & Priority Rules

Findings are assigned one of four severity tiers based on how severely they impact crawler visibility or user engagement:
* **CRITICAL**: The website completely blocks index access (e.g., disallowing all user-agents in robots.txt) or crashes the page render for bots. Priority: **IMMEDIATE**.
* **HIGH**: Major technical barrier (e.g., missing Schema structured data, empty client-side React shell containing no raw text, or missing primary value proposition H1 header). Priority: **HIGH**.
* **MEDIUM**: Notable issues (e.g., outdated copyright notices from past years, no outbound citation references, missing Privacy Policy links, or inadequate CTA counts). Priority: **MEDIUM**.
* **LOW**: Minor optimization opportunity (e.g., missing `/llms.txt` standard, missing alt attributes on some images, or non-semantic heading skips). Priority: **LOW**.

---

## 🛡️ Security Guardrails & SSRF Protection

Because the system crawls arbitrary URL entries, it includes robust filters to prevent SSRF (Server-Side Request Forgery) attacks:
1. **Scheme Validation**: Only `http:` and `https:` schemes are allowed. Schemes like `file://`, `gopher://`, or `ftp://` are rejected.
2. **Localhost & Private IP Filter**: Resolves URL hostnames to IP addresses using DNS. It rejects all loopback, local, link-local, and private subnets:
   - IPv4: `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`, `0.0.0.0`
   - IPv6: `::1`, `fe80::/10`, `fc00::/7` (Unique Local Addresses)
3. **Manual Redirect Guard**: Redirects are followed manually, validating the resolved IP address on every redirect step to block redirection loops pointing to internal assets.
4. **Size and Speed Enforcements**: Limits each response payload size to `2MB` to prevent memory exhaustion and sets request timeouts to `10s`.

---

## 💻 Local Development Setup

To run the auditor locally, make sure you have Node.js (v18+) installed.

### Step 1: Clone or Download the Project
Extract the zip folder or clone the repository to your workspace.

### Step 2: Install Dependencies
Run npm install in the root folder of the project:
```bash
npm install
```
This installs the dependencies: `express` (routing API server), `cheerio` (fast DOM parser), and `adm-zip` (marketplace packager).

### Step 3: Set Environment Variables (Optional)
Copy the example file to `.env` to customize settings:
```bash
cp .env.example .env
```

### Step 4: Run the Application
Start the unified Node.js server:
```bash
npm start
```
The server will boot and serve the static client dashboard and APIs on:
`http://localhost:3000`

### Step 5: Start Auditing!
Open the browser, input a public website URL (e.g. `example.com`), and click **Analyze Website** to run the crawl and view real-time logs and scores!

---

## 🧪 Automated Testing

The repository includes a comprehensive, zero-dependency test suite verifying crawler safety, parsing modules, and scoring engines.

Run tests using:
```bash
npm test
```
Tests will evaluate:
* SSRF validation (loopback and private IPv4/IPv6 blocks).
* Robots.txt matching patterns.
* Cheerio parsing filters (headers, Schemas, alt attributes).
* Scored report aggregators.

---

## ☁️ Deployment Instructions

### Frontend & Backend (Render / Railway / Heroku)
Because the frontend files are served statically from the Node Express application, the entire app can be deployed on a single cloud service in seconds:
1. **Render**:
   - Create a **Web Service** linked to your Github repository.
   - Set Build Command to: `npm install`
   - Set Start Command to: `npm start`
   - Add environment variables if needed (`PORT=3000`).
2. **Railway / Heroku**:
   - Create a new project and drag/drop the repository. Railway will detect the `package.json` file, install dependencies, and start the app automatically.
3. **CORS Safe**:
   - Because the API endpoints and frontend layout share the same origin, there are zero CORS conflicts when executing live audits!

---

## 📋 Example Structured Report Output

The orchestrator return payload matches the required challenge schema:

```json
{
  "site": "example.com",
  "website": "https://example.com",
  "audited_at": "2026-08-28T10:48:00Z",
  "score": 78,
  "breakdown": {
    "discoverability": 30,
    "freshness": 23,
    "engagement": 25
  },
  "summary": {
    "total_findings": 3,
    "critical": 0,
    "high": 1,
    "medium": 1,
    "low": 1
  },
  "findings": [
    {
      "id": "F-CR-02",
      "title": "Missing structured data (Schema.org JSON-LD)",
      "severity": "high",
      "evidence": "0 structured data markup scripts found across all 3 audited page(s).",
      "suggested_action": {
        "summary": "Add JSON-LD structured data to your pages (e.g., Organization, LocalBusiness, Product, or Article schemas) to help AI search engines identify facts and entity relationships.",
        "priority": "high"
      }
    },
    {
      "id": "F-FC-01",
      "title": "Outdated copyright notice (2024)",
      "severity": "medium",
      "evidence": "Footer copyright across the website shows year 2024, which is behind the current year 2026.",
      "suggested_action": {
        "summary": "Update the footer copyright year to 2026 manually or dynamically via JavaScript (e.g., new Date().getFullYear()).",
        "priority": "medium"
      }
    },
    {
      "id": "F-CR-06",
      "title": "Missing llms.txt file",
      "severity": "low",
      "evidence": "llms.txt file is not present at domain root (HTTP Status: 404).",
      "suggested_action": {
        "summary": "Create an llms.txt file at the root directory of your website explaining your site structure, main pages, and content summary specifically formatted for AI assistants.",
        "priority": "low"
      }
    }
  ]
}
```
