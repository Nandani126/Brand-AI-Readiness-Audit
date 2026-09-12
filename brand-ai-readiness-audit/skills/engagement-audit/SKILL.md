---
name: engagement-audit
description: Audits on-site user engagement factors including value proposition clarity, navigation menus, call-to-actions, and essential policy pages.
---

# Engagement Audit Skill

This skill checks the page structures and elements that determine whether a human visitor arriving from a search engine/AI recommendation will find value and continue browsing rather than bouncing.

## 🔍 Audit Checklist

The auditing agent must evaluate the following metrics:

### 1. Value Proposition (H1 Header)
- **Check**: Scan the page for `<h1>` elements.
- **Rule**: A page must have exactly one logical `<h1>` element that clearly states the website's value proposition or main topic (between 10 and 70 characters).
- **Finding Flag**: If zero `<h1>` headers exist, report a `HIGH` severity finding (`F-EN-01`). If multiple `<h1>` headers are found, report a `MEDIUM` severity finding.

### 2. Accessible Navigation Menus
- **Check**: Search for `<nav>` tags, menu headers, or lists of internal index links.
- **Rule**: A website must have an easily identifiable, structured navigation panel so users can traverse primary pages.
- **Finding Flag**: If no logical navigation tags or links exist, report a `HIGH` severity finding.

### 3. Clear Call-To-Action (CTA) Paths
- **Check**: Evaluate elements like buttons (`<button>`, `.btn`, `.button`) or links containing action terms (e.g. "Get Started", "Register", "Contact Us", "Download").
- **Rule**: Pages must guide users to their next steps with clear visual markers and action verb labels.
- **Finding Flag**: If zero prominent Call-To-Action components exist on the page, report a `HIGH` severity finding.

### 4. Essential Trust & Policy Pages
- **Check**: Search link text and anchors for terms matching "Privacy", "Terms", "Contact", "Support", or "Help".
- **Rule**: Clear disclosures and accessible channels establish user trust and ensure legal compliance.
- **Finding Flag**: If privacy, terms, or contact links are absent, report a `MEDIUM` severity finding.

### 5. Content Hierarchy & Reading Time
- **Check**: Count headings (`<h2>`, `<h3>`), word counts, and calculate reading time.
- **Rule**: A readable page maintains a logical hierarchy (no skipping from H1 to H3) and provides enough content length without cluttering.
- **Finding Flag**: If heading tags skip levels or total word count is under 150 words (excluding menus), report a `LOW` severity finding.

---

## 🛠️ Automated Checker Script

This skill includes an automated helper script [engagement.js](file:///d:/Web%20TECH/brand-ai-readiness-audit/skills/engagement-audit/scripts/engagement.js) that crawls header elements, button tags, policy links, and counts metrics.
