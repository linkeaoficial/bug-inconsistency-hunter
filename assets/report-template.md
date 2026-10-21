# Bug Report: {{project}} — {{scope}} ({{branch}})

```
🐛 Bugs: {{A}} | ⚠️ Inconsistencies: {{B}} | 🔁 Regressions: {{C}} | 🧱 Fragility: {{D}} | 🔒 Security: {{E}} | 📊 Total: {{A+B+C+D+E}}
```

## Scope & Baseline

- **Mode**: Full | Diff | Quick
- **Base**: {{base ref — diff only; "n/a" otherwise}}
- **Stack**: {{language / framework / runtime}}
- **Verification**: {{command → pass/fail; or "not run — reason"}}

## Summary

{{One paragraph: the most important finding, its blast radius, and the single
highest-leverage next action. If there are no findings, say so plainly.}}

## Findings

| # | Location | Category | Severity | Introduced | Evidence | Confidence | Next Step |
|---|----------|----------|----------|------------|----------|------------|-----------|
| 1 | file.ext:12 | Correctness | 🔴 Critical | Yes | ```code``` | High | write failing test |
| 2 | | | | | | | |

Rules:
- Ordered by severity, then confidence.
- One row = one finding. Do not bundle.
- Evidence is a real quoted snippet or command output; never a description of
  code you did not quote.
- `Introduced` is Yes / No / Unknown in diff mode, `n/a` in full mode.
- If there are no findings, write `No findings.` instead of an empty table.

## Pre-existing (diff mode only)

Issues found in untouched code. Not counted in the totals and not blamed on
this change. Omit this section in full mode.

| Location | Category | Severity | Evidence | Why out of scope |
|----------|----------|----------|----------|------------------|
| file.ext:40 | Fragility | 🟡 Medium | ```code``` | unchanged line |

## Done Well

{{One specific pattern this codebase gets right. Real, not flattery.}}

## Verified Clean

{{Short list of areas checked with no findings. Shows the scan was systematic.}}

## Coverage & Limits

{{Files/areas reviewed, what was not reviewed, and why (timebox, missing
runtime, no base ref, etc.). Never claim an exhaustive review.}}

## Recommendations

1. **Urgent**: {{only if a Critical/High exists; file:line}}
2. **Priority**: {{optional; the next action that materially reduces risk}}
3. **Preventive**: {{optional; one measure that stops this class from recurring}}

## Impact & Prediction

- **Blast radius**: {{who/what breaks if this ships; omit if no findings}}
- **Next likely bug** (prediction, not a finding): {{file + reasoning}}

## Verdict

{{🚫 Block | ⚠️ Request changes | ✅ Approve}} — {{one-sentence justification}}

---

Scan complete in {{duration}}. Found A correctness bugs, B inconsistencies,
C regressions, D fragility issues, and E security issues across N files.
