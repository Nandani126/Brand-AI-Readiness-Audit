---
name: freshness-corroboration
description: Analyzes content currency, copyright dates, modification signals, citation density, and entity clarity.
---

# Freshness & Corroboration Skill

This skill analyzes trustworthiness indicators and source authority (E-E-A-T) which AI models use to determine whether facts are current and backed by peer sources.

## 🔍 Audit Checklist

The auditing agent must evaluate the following indicators:

### 1. Stale Copyright / Year Markers
- **Check**: Inspect page footer and text contents for year indicators (e.g. copyright notices).
- **Rule**: Copyright tags should represent the current year (2026). Old copyright years (2024 or earlier) imply the site has been neglected.
- **Finding Flag**: If copyright text shows an outdated year, report a `MEDIUM` severity finding.

### 2. Publication & Modification Metadata
- **Check**: Look for schema fields like `dateModified`, `datePublished`, or HTML header date tags.
- **Rule**: Dynamic websites containing facts or articles should publish when content was last updated to confirm currency.
- **Finding Flag**: If article content lacks any updated timestamps, report a `LOW` severity finding.

### 3. Citations & External Links (Corroboration)
- **Check**: Parse external link destinations (`href` attributes not pointing to the current domain).
- **Rule**: AI engines trust assertions that cite sources, link to references, or point to external authorities (such as industry databases, government websites, university portals, or reputable news publications).
- **Finding Flag**: If a text-heavy site makes statements but has zero links to external high-authority domains, report a `MEDIUM` severity finding.

### 4. Entity Ambiguity
- **Check**: Compare the primary metadata `<title>` brand identifier with body mentions and Organization schema tags.
- **Rule**: The company or entity name must be consistently identified so AI engines do not confuse it with generic terms or competitors.
- **Finding Flag**: If the brand name cannot be matched to the page title or differs across the footer/header, report a `MEDIUM` severity finding.

---

## 🛠️ Automated Checker Script

This skill includes an automated helper script [freshness.js](file:///d:/Web%20TECH/brand-ai-readiness-audit/skills/freshness-corroboration/scripts/freshness.js) that performs search regex audits on dates, links, and entity consistency.
