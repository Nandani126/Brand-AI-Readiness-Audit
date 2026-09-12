---
name: audit-orchestrator
description: Coordinates the brand AI-readiness audit pipeline, aggregates findings, and compiles the final report.
---

# Audit Orchestrator Skill

This skill serves as the central control node for the **Brand AI Readiness Audit**. It is responsible for calling the individual audit sub-skills, collecting their evidence, calculating the AI Readiness Score, and structuring the final report.

## 📋 Execution Protocol

When an audit is initiated for a target website, the Orchestrator agent performs the following steps:

1. **Invoke Crawl & Render Audit**:
   Call the `crawl-render-audit` skill to analyze technical access, structured markup (JSON-LD), and JavaScript dependence.
2. **Invoke Freshness & Corroboration Audit**:
   Call the `freshness-corroboration` skill to verify copyright dates, update signals, and citation authority.
3. **Invoke Engagement Audit**:
   Call the `engagement-audit` skill to assess the landing page UX, CTAs, navigation, and trust links.
4. **Consolidate and Deduplicate Findings**:
   Combine the findings from each sub-skill. Map each finding to the strict schema structure:
   - `id`: Finding identifier (e.g., `F-001`, `F-002`)
   - `title`: Short descriptive title of the issue
   - `severity`: `CRITICAL` | `HIGH` | `MEDIUM` | `LOW`
   - `evidence`: Clear, numbers-backed details about what was checked and what failed
   - `suggested_action`: Direct, actionable code or configuration remedy
   - `priority`: `IMMEDIATE` | `HIGH` | `MEDIUM` | `LOW`
5. **Calculate AI Readiness Score**:
   Apply the weighted scoring matrix below out of 100 points.
6. **Compile Final Report**:
   Generate a markdown report matching the required specification format.

---

## 📈 Scoring Matrix (100 Points Total)

| Component | Weight | Checked Metric | Points |
| :--- | :--- | :--- | :--- |
| **AI Discoverability** | **50 Points** | Robots.txt allows main AI agents (e.g. GPTBot, ClaudeBot) | 15 |
| | | Valid JSON-LD Structured Data (Organization/Product/Article) | 15 |
| | | Text content accessible in raw HTML (No JS render gap) | 10 |
| | | Presence of `/llms.txt` or `/.well-known/llms.txt` | 5 |
| | | Clear images description (Alt text coverage > 80%) | 5 |
| **On-Site Engagement** | **50 Points** | Clear header value proposition (H1 length and structure) | 15 |
| | | Accessible navigation menu structure | 10 |
| | | Clear Call-To-Action (CTA) elements | 10 |
| | | Trust policy pages present (Privacy, Terms, Contact) | 10 |
| | | Structured headings hierarchy and reading flow | 5 |

---

## 📄 Output Schema Specification

The final generated report must follow this layout:

```text
Website: [Target URL]
Audit Timestamp: [ISO String]

AI READINESS SCORE: [Score]/100

SUMMARY
──────────────
Critical: [Count]
High:     [Count]
Medium:   [Count]
Low:      [Count]

TOP PROBLEMS
──────────────

🔴 [Finding ID]
Title: [Title]
Severity: [Severity]
Evidence:
[Evidence Text]
Fix:
[Suggested Action]
Priority: [Priority]

[Repeat for other findings in descending order of severity]
```
