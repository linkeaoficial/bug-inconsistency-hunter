# Severity and Confidence Rubric

Assign exactly one severity and one confidence per finding. Severity is
**impact if the code ships**, not how clever or how likely the bug is. When
torn between two levels, pick the lower one; inflation destroys trust.

## Severity

| Severity | Definition | Examples |
|----------|------------|----------|
| 🔴 **Critical** | Data loss, security breach, or production outage if shipped | SQL injection reachable by an attacker, auth bypass, deleting user data on an error path, secret exposed in a public response |
| 🟠 **High** | Breaks core functionality or produces materially wrong results | Wrong payment total, checkout race, unawaited write that loses data, authorization check missing on an object endpoint |
| 🟡 **Medium** | Degrades reliability or maintainability; latent bug | N+1 query, missing timeout on a bounded external call, error swallowed with an empty catch, duplicated logic that already drifted |
| 🟢 **Low** | Cosmetic or low-risk issue | Misleading name/comment, dead code, minor inconsistency with no behavioral effect |

## Confidence

| Confidence | Meaning | Required evidence |
|------------|---------|-------------------|
| **High** | Reproduced logically end-to-end, or a test/trace proves it | Exact line + verified caller chain |
| **Medium** | Invariant violation is clear in code, but not reproduced | Exact line; caller chain partially verified |
| **Low** | Suspicious pattern; needs runtime evidence or context | Exact line + explicit statement of what is missing |

A Low-confidence Critical is not reportable until the caller chain is
verified. Either raise it to Medium/High with evidence or drop it.

## Escalation rules

- Missing tests are **Fragility / Medium** by default. Escalate to High only
  when the untested path handles money, auth, personal data, or data loss.
- A finding that needs a failing test to confirm is Medium confidence, and the
  next step is "write the failing test at X". Do not present it as proven.
- Do not raise severity because a category sounds dangerous. A theoretical SSRF
  with no user-controlled URL is not Critical.
- Pre-existing issues are scored normally but listed separately in diff mode;
  they are not evidence against the change under review.
- If the evidence snippet contains a secret, redact the value and note that it
  must be rotated.
