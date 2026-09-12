# 🚀 Brand AI-Readiness Audit Marketplace & Web Dashboard

[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-green.svg?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.19-blue.svg?style=flat-square&logo=express)](https://expressjs.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-7%2F7%20Passed-brightgreen.svg?style=flat-square)](file:///d:/Web%20TECH/test.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](file:///d:/Web%20TECH/package.json)
[![Package Size](https://img.shields.io/badge/ZIP%20Size-0.02%20MB-blueviolet.svg?style=flat-square)](file:///d:/Web%20TECH/brand-ai-readiness-audit.zip)
[![Specification](https://img.shields.io/badge/agentskills.io-Compliant-orange.svg?style=flat-square)](https://agentskills.io/)

> **Next-Generation Website Auditing System & Agent Skill Marketplace** built for **Round 3 of the Adobe University Hackathon 2026**.
> Evaluates public websites for **AI Discoverability** (LLM search indexability, Perplexity, GPTBot, ClaudeBot, schema markup) and **On-Site Engagement** (human user retention, visual CTAs, navigation accessibility, E-E-A-T trust signals).

---

## 📑 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
- [Agent Skills Marketplace](#-agent-skills-marketplace)
- [Scoring Matrix & Weights](#-scoring-matrix--weights)
- [Severity System & Priorities](#-severity-system--priorities)
- [Security & SSRF Guardrails](#-security--ssrf-guardrails)
- [Directory Structure](#-directory-structure)
- [REST API Reference](#-rest-api-reference)
- [Getting Started & Quickstart](#-getting-started--quickstart)
- [Automated Testing Suite](#-automated-testing-suite)
- [ZIP Marketplace Packaging](#-zip-marketplace-packaging)
- [Deployment Guide](#-deployment-guide)
- [Configuration Reference](#-configuration-reference)
- [License](#-license)

---

## 💡 Overview

As AI-driven search engines (ChatGPT Search, Perplexity, Claude, Google Gemini AI Overviews) redefine how users find information, traditional SEO metrics are no longer sufficient. Modern websites must be structured for both **machine comprehension by autonomous AI crawlers** and **seamless conversion for human visitors**.

The **Brand AI-Readiness Audit System** provides an end-to-end platform comprising:
1. **Interactive Web Application**: A dark-mode glassmorphic dashboard with dynamic radial gauge scoring, live streaming console telemetry, severity filters, full markdown report exporting, and an interactive animated robot mascot.
2. **Modular Agent Skill Marketplace**: An `agentskills.io`-compliant agent package (`brand-ai-readiness-audit/`) with autonomous skills that can be invoked via CLI, AI agents (Antigravity IDE), or HTTP endpoints.

```
                     Public Target URL
                            │
                            ▼
              ┌───────────────────────────┐
              │   Pre-Flight SSRF Guard   │ (DNS resolution, private IP filter)
              └─────────────┬─────────────┘
                            │
                            ▼
              ┌───────────────────────────┐
              │    Safe BFS Web Crawler   │ (Robots.txt, HTML parser, depth limit)
              └─────────────┬─────────────┘
                            │
                            ▼
              ┌───────────────────────────┐
              │   [audit-orchestrator]    │ (Coordinator Entrypoint Skill)
              └─────────────┬─────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
┌──────────────────┐ ┌───────────────┐ ┌──────────────┐
│crawl-render-audit│ │ freshness-    │ │ engagement-  │
│(Discoverability) │ │ corroboration │ │ audit (UX)   │
└────────┬─────────┘ └───────┬───────┘ └──────┬───────┘
         │                   │                │
         └───────────────────┼────────────────┘
                             ▼
              ┌───────────────────────────┐
              │   Scored Audit Report     │ (Score /100, Findings, Markdown)
              └───────────────────────────┘
```

---

## ⚡ System Architecture

The project is built on a clean, decoupled architecture:

- **Frontend (`index.html`, `index.css`, `app.js`)**: Modern single-page application with dark theme glassmorphism, responsive CSS variables, SVG radial gauge, tab switching, and accordion findings.
- **Robot Mascot (`robot.js`, `robot.css`)**: Dynamic physics-based walking mascot patrolling the footer, with collision detection, turnarounds, speech bubbles, and interactive backflip somersaults with sparkles.
- **Backend API Server (`server.js`)**: Express.js server providing REST endpoints, streaming audit telemetry, SSRF pre-flight validation, and dynamic ZIP compilation.
- **Skill Engine (`brand-ai-readiness-audit/`)**: Standalone, modular Agent Skills conforming to the `agentskills.io` standard with individual `SKILL.md` instructions and standalone Node.js parser scripts.

---

## 🌟 Key Features

- 🔍 **Dual-Pillar Evaluation**: Checks **AI Discoverability** (50 pts) and **On-Site Engagement** (50 pts) to produce a unified 100-point AI-Readiness score.
- 🛡️ **Zero-Vulnerability SSRF Guard**: Pre-resolves DNS records and blocks loopback, link-local, private subnets (IPv4 and IPv6), and malformed protocols before any network request is made.
- 🤖 **AI Crawler Permission Auditing**: Inspects `robots.txt` for specific AI bot directives (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot, Amazonbot).
- 🏷️ **Schema.org Structured Data Verification**: Scans for JSON-LD scripts (`Organization`, `Product`, `Article`, `LocalBusiness`, etc.) essential for LLM entity recognition.
- ⚡ **JavaScript Render Gap Detection**: Analyzes raw HTML text-to-code ratios to detect client-side SPA rendering walls that prevent indexing by static crawlers.
- 📄 **LLMs.txt Standard Validation**: Verifies the presence of `/llms.txt` and `/.well-known/llms.txt` files for structured LLM ingestion.
- 📅 **Freshness & E-E-A-T Corroboration**: Flags outdated copyright footer years, checks `article:modified_time` metadata, and evaluates outbound citations to high-authority domains (`.edu`, `.gov`, Wikipedia).
- 🎨 **UX & Conversion Cues**: Audits H1 value propositions, semantic `<nav>` menus, Call-To-Action (CTA) densities, and mandatory trust pages (Privacy Policy, Terms of Service, Contact).
- 🛡️ **Heuristic Fallback Engine**: If a target website is blocked by Cloudflare, WAF, or anti-bot protections, a high-fidelity simulation engine generates category-specific diagnostic insights (E-Commerce, SaaS, Org/Edu, General).
- 📋 **Export & Download Options**:
  - One-click clipboard copy for Markdown audit reports.
  - Direct download of `.md` formatted reports.
  - One-click ZIP download of the complete `brand-ai-readiness-audit.zip` marketplace archive.

---

## 📦 Agent Skills Marketplace

The standalone `brand-ai-readiness-audit/` folder is packaged into a compliant submission archive (`brand-ai-readiness-audit.zip`, size: ~0.02 MB, well under the 50 MB Adobe limit):

```text
brand-ai-readiness-audit/
├── marketplace.json                 # Marketplace manifest registering all skills
├── README.md                        # Skill-specific documentation
└── skills/
    ├── audit-orchestrator/          # [Entrypoint] Coordinates the entire audit pipeline
    │   ├── SKILL.md                 # Agent instructions and scoring contract
    │   └── scripts/
    │       └── crawler.js           # SSRF validator, robots.txt parser, bounded BFS crawler
    ├── crawl-render-audit/          # [Worker] Analyzes technical crawler discoverability
    │   ├── SKILL.md                 # Agent instructions for crawl/render audit
    │   ├── scripts/
    │   │   └── crawl_render.js      # Technical parser (cheerio DOM analysis)
    │   └── references/
    │       └── agents.txt           # Reference dictionary of major AI crawler user-agents
    ├── freshness-corroboration/     # [Worker] Evaluates E-E-A-T and data freshness
    │   ├── SKILL.md                 # Agent instructions for content freshness
    │   └── scripts/
    │       └── freshness.js         # Copyright, date revision, and citation parser
    └── engagement-audit/            # [Worker] Evaluates human UX and retention cues
        ├── SKILL.md                 # Agent instructions for on-site engagement
        └── scripts/
            └── engagement.js        # H1 headings, nav structure, CTAs, and policy links
```

### Marketplace Manifest (`marketplace.json`)
```json
{
  "name": "brand-ai-readiness-audit",
  "version": "1.0.0",
  "skills": [
    {
      "id": "audit-orchestrator",
      "path": "skills/audit-orchestrator",
      "entrypoint": true
    },
    {
      "id": "crawl-render-audit",
      "path": "skills/crawl-render-audit"
    },
    {
      "id": "freshness-corroboration",
      "path": "skills/freshness-corroboration"
    },
    {
      "id": "engagement-audit",
      "path": "skills/engagement-audit"
    }
  ]
}
```

---

## 📊 Scoring Matrix & Weights

The audit system calculates a **total readiness score out of 100 points**:

| Category | Checked Metric | Points | Weight |
| :--- | :--- | :---: | :---: |
| **AI Discoverability** | `robots.txt` allows AI agents (GPTBot, ClaudeBot, PerplexityBot) | 15 | **50%** |
| | Valid JSON-LD Structured Data (`Organization`, `Product`, `Article`) | 15 | |
| | Text content accessible in raw HTML (No JS SPA rendering wall) | 10 | |
| | Presence of `/llms.txt` or `/.well-known/llms.txt` | 5 | |
| | Image description coverage (Alt text coverage > 75%) | 5 | |
| **Information Freshness** | Current copyright footer year (verified against 2026) | 10 | **25%** |
| | Page revision tags (`article:modified_time`, updated dates) | 5 | |
| | Outbound citation density to authoritative sources (`.edu`, `.gov`, Wikipedia) | 5 | |
| | Brand entity consistency across titles and headings | 5 | |
| **On-Site Engagement** | Clear header value proposition (H1 length and presence) | 15 | **25%** |
| | Semantic navigation menu structure (`<nav>`, `<ul>`, `<li>`) | 10 | |
| | Prominent Call-To-Action (CTA) elements | 10 | |
| | Essential trust policy pages (Privacy Policy, Terms of Service, Contact) | 10 | |
| | Semantic heading hierarchy (no skipped heading levels H1 -> H2 -> H3) | 5 | |

*Note: The engagement score (out of 50 in module output) is proportionally normalized to 25 points when aggregating with Freshness (25 points) and Discoverability (50 points).*

---

## 🚨 Severity System & Priorities

Findings are automatically categorized into four standardized severity tiers:

| Severity | Color | Description | Priority |
| :---: | :---: | :--- | :---: |
| **CRITICAL** | 🔴 Red | Site completely blocks crawlers (`Disallow: /` for AI bots), page render crashes, or zero indexable content. | **IMMEDIATE** |
| **HIGH** | 🟠 Orange | Missing JSON-LD schemas, empty client-side JavaScript shells, or missing primary H1 value proposition. | **HIGH** |
| **MEDIUM** | 🟡 Yellow | Outdated copyright years (e.g., 2024), missing outbound citation references, or absent Privacy Policy / Terms links. | **MEDIUM** |
| **LOW** | 🔵 Blue | Missing `/llms.txt` file, missing alt attributes on some images, or minor heading hierarchy skips. | **LOW** |

---

## 🛡️ Security & SSRF Guardrails

Auditing arbitrary user-supplied URLs presents severe Server-Side Request Forgery (SSRF) risks. This application enforces multi-layered defense-in-depth:

1. **Protocol Whitelist**: Rejects non-HTTP schemes (`file://`, `gopher://`, `ftp://`, `ssh://`). Only `http:` and `https:` are permitted.
2. **Pre-Flight DNS Resolution & IP Blocklist**: Resolves domain names to IP addresses prior to issuing network requests, blocking:
   - **IPv4 Private/Loopback**: `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`, `0.0.0.0`
   - **IPv6 Private/Loopback**: `::1`, `fe80::/10` (link-local), `fc00::/7` (unique local addresses)
3. **Manual Redirect Inspection**: Disables automatic redirect following. Follows redirects step-by-step, validating the resolved IP address at every step to prevent open-redirect SSRF bypasses.
4. **Clamped Payload Quotas**: Clamps responses at **2 MB** per page to prevent memory exhaustion and "decompression bomb" attacks.
5. **Configurable Request Timeouts**: Bounded by default to 10 seconds per request.

---

## 📂 Directory Structure

```text
d:\Web TECH\
├── .env.example                     # Sample configuration variables
├── index.html                       # Responsive glassmorphism auditor dashboard
├── index.css                        # CSS design system (tokens, glassmorphism, responsive grid)
├── app.js                           # Frontend controller (tabs, SVG gauge, markdown exporter, modal)
├── robot.css                        # Mascot animations (walking, backflip, sparkles, glowing heart)
├── robot.js                         # Mascot physics engine (patrol loop, turnarounds, backflip click)
├── server.js                        # Express backend, SSRF guard, BFS crawler, API endpoints
├── test.js                          # Zero-dependency automated test runner (7/7 tests)
├── zip-builder.js                   # Packaging utility to compile marketplace ZIP (<50MB)
├── package.json                     # Project manifest and scripts
├── package-lock.json                # Locked dependency tree
├── brand-ai-readiness-audit.zip     # Compiled marketplace archive (0.02 MB)
└── brand-ai-readiness-audit/        # Standalone Agent Skill Marketplace
    ├── marketplace.json             # Manifest registering all 4 skills
    ├── README.md                    # Skill documentation
    └── skills/
        ├── audit-orchestrator/      # Entrypoint skill
        │   ├── SKILL.md
        │   └── scripts/
        │       └── crawler.js
        ├── crawl-render-audit/      # Discoverability skill
        │   ├── SKILL.md
        │   ├── scripts/
        │   │   └── crawl_render.js
        │   └── references/
        │       └── agents.txt
        ├── freshness-corroboration/ # Freshness skill
        │   ├── SKILL.md
        │   └── scripts/
        │       └── freshness.js
        └── engagement-audit/        # UX & Engagement skill
            ├── SKILL.md
            └── scripts/
                └── engagement.js
```

---

## 🔌 REST API Reference

### 1. `GET /api/health`
Health check status.
```json
{ "status": "ok" }
```

### 2. `GET /api/config`
Retrieves the active server limits and timeout settings.
```json
{
  "maxPages": 20,
  "maxDepth": 2,
  "timeout": 10,
  "port": 3000
}
```

### 3. `GET /api/audit?url=<target-url>` & `POST /api/audit`
Executes the full audit pipeline for a target website.

**POST Body:**
```json
{
  "url": "https://example.com"
}
```

**Response Payload (`200 OK`):**
```json
{
  "site": "example.com",
  "website": "https://example.com",
  "audited_at": "2026-09-05T03:43:00.000Z",
  "score": 82,
  "breakdown": {
    "discoverability": 38,
    "freshness": 22,
    "engagement": 22
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
      "evidence": "0 structured data markup scripts found across audited page(s).",
      "suggested_action": {
        "summary": "Implement JSON-LD structured data (Organization, Product, Article schemas) to help AI search engines identify entity relationships.",
        "priority": "high"
      }
    },
    {
      "id": "F-FC-01",
      "title": "Outdated copyright footer year (2024)",
      "severity": "medium",
      "evidence": "Footer copyright shows year 2024, which is behind current year 2026.",
      "suggested_action": {
        "summary": "Update copyright year notice to 2026 using dynamic JavaScript (new Date().getFullYear()).",
        "priority": "medium"
      }
    },
    {
      "id": "F-CR-06",
      "title": "Missing llms.txt directory file",
      "severity": "low",
      "evidence": "Fetching /llms.txt returned HTTP status code 404.",
      "suggested_action": {
        "summary": "Add a clean markdown directory structure at /llms.txt describing your site maps and key content for LLMs.",
        "priority": "low"
      }
    }
  ],
  "report": "Website: https://example.com\nAI READINESS SCORE: 82/100\n...",
  "logs": [
    "[Orchestrator] Initializing brand AI-readiness audit...",
    "[Orchestrator] Resolving DNS and validating SSRF safety rules...",
    "[Orchestrator] SSRF validation passed. Target domain is clean and public.",
    "[Crawler] Starting depth-limited crawl (Max Pages: 20, Max Depth: 2)...",
    "[Crawl-Render] Evaluating Robots.txt, Schema.org entities, and llms.txt...",
    "[Freshness] Auditing copyright years, revision tags, and citations...",
    "[Engagement] Evaluating H1 headings, nav menu structures, and CTAs...",
    "[Orchestrator] Audit complete. Scores: Discoverability: 38/50, Freshness: 22/25, Engagement: 22/25."
  ]
}
```

### 4. `GET /api/download-zip`
Dynamically triggers compilation and serves `brand-ai-readiness-audit.zip` for marketplace submission.

---

## 🚀 Getting Started & Quickstart

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Step 1: Install Dependencies
From the project root, install all required packages:
```bash
npm install
```

### Step 2: Environment Configuration (Optional)
Copy the provided `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Default parameters are pre-configured:
```env
PORT=3000
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
MAX_PAGES=20
MAX_DEPTH=2
REQUEST_TIMEOUT=10
```

### Step 3: Run the Server
```bash
npm start
```
Or for live-reload development:
```bash
npm run dev
```

### Step 4: Open the Dashboard
Open your browser and navigate to:
```
http://localhost:3000
```
Input any public URL (e.g., `example.com` or `adobe.com`) and click **Analyze Website** to run the live audit!

---

## 🧪 Automated Testing Suite

The repository includes a standalone automated test suite (`test.js`) verifying security controls, parsing logic, and scoring calculations:

```bash
npm test
```

### Test Coverage Breakdown:
- ✅ **SSRF IPv4 Filter**: Verifies blocking of `127.0.0.1`, `10.0.5.1`, `192.168.1.100`, `172.16.0.5`, `169.254.169.254`, `0.0.0.0` while allowing public IPs (`8.8.8.8`).
- ✅ **SSRF IPv6 Filter**: Verifies blocking of `::1`, `fe80::1`, `fc00::`, `fdff:...` while allowing public IPv6.
- ✅ **Protocol Validator**: Rejects `ftp://`, `file://`, and malformed URLs.
- ✅ **Robots.txt Parser**: Confirms wildcard and specific AI bot rule matching (`GPTBot`, `ClaudeBot`).
- ✅ **Cheerio Crawl & Render Evaluator**: Validates schema detection, SPA text ratios, alt text percentages, and `/llms.txt` checks.
- ✅ **Freshness Corroboration Engine**: Verifies detection of outdated copyright years (2024 vs 2026) and outbound citation densities.
- ✅ **Engagement & UX Engine**: Checks single H1 constraints, CTA counts, navigation semantic tags, and mandatory policy links.

---

## 📦 ZIP Marketplace Packaging

To package the marketplace submission into a compliant ZIP file:

```bash
npm run zip
```
Or:
```bash
node zip-builder.js
```

This compiles `brand-ai-readiness-audit/` into `brand-ai-readiness-audit.zip`.
- **Adobe Limit**: 50.00 MB
- **Actual Size**: ~0.02 MB (**99.96% under limit**)
- **Root Manifest**: `marketplace.json` is placed directly at the archive root.

---

## ☁️ Deployment Guide

Because the application serves its frontend directly from Express, it is 100% **CORS-free** and deployable as a single unified service:

### Option A: Render
1. Connect your GitHub repository to [Render](https://render.com/).
2. Create a new **Web Service**.
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Set environment variable: `PORT=3000`.

### Option B: Railway / Heroku
1. Push the repository to your Git provider.
2. Link the repository to Railway or Heroku. The platform automatically detects `package.json` and runs `npm start`.

### Option C: Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

## ⚙️ Configuration Reference

| Variable | Default | Description |
| :--- | :---: | :--- |
| `PORT` | `3000` | HTTP port on which the Express server listens. |
| `BACKEND_URL` | `http://localhost:3000` | Base URL for backend API calls. |
| `FRONTEND_URL` | `http://localhost:3000` | Client URL for CORS headers. |
| `MAX_PAGES` | `20` | Maximum number of pages to crawl per website audit. |
| `MAX_DEPTH` | `2` | Maximum BFS link traversal depth from the starting URL. |
| `REQUEST_TIMEOUT` | `10` | Request timeout per page in seconds. |

---

## 📄 License

This project is licensed under the **MIT License** - see [package.json](file:///d:/Web%20TECH/package.json) for details.

Developed for **Adobe University Hackathon 2026 (Round 3)** by **Team The Goal Getter**.
