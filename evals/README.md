# Evals

These cases measure whether the skill changes review quality, not merely
whether it produces a long report.

## What is automated

`node evals/validate.mjs` checks the eval suite itself:

- `SKILL.md` and `evals.json` versions match;
- every case has a unique id, an input, and assertions;
- the suite still covers clean-file, prompt-injection, diff, security, and
  non-English cases;
- the metrics are valid.

It does **not** run an LLM. No judging harness is bundled, so nobody can
accidentally claim an unexecuted eval passed.

## Quality run (with vs without skill)

For each case:

1. Start a fresh session in a throwaway copy of the target repo.
2. Run the case input **without** the skill; save the output.
3. Start another fresh session and run the same input **with** the skill.
4. Score each assertion `1` (met) or `0` (missed). Do three runs per arm and
   keep the median.
5. Also record: evidence quoted for every finding, files modified (must be
   zero), and whether the report claimed checks it did not run.

A case passes when every assertion scores `1` in at least two of three runs.
The skill is useful only if `with-skill` beats `without-skill` on the suite,
without increasing false positives on `clean-file`.

## Targets

| Metric | Target |
|--------|--------|
| Trigger recall | ≥ 0.8 |
| False-trigger rate | ≤ 0.1 |
| Output delta vs baseline | ≥ 0.2 |
| Step adherence | ≥ 0.9 |
| Evidence quote rate | 1.0 |
| Read-only violations | 0 |

## Adding a case

Use this shape:

```json
{
  "id": "unique-kebab-id",
  "mode": "quick | full | diff",
  "input": "the user request",
  "fixture": "optional file or diff content",
  "assertions": ["observable requirement", "another requirement"]
}
```

Assertions must be observable in the output (a quote, a label, a severity, a
tool call, or the absence of an edit). Avoid "is smart" or "is thorough".

Bump `version` in both `SKILL.md` and `evals.json` when behavior changes, then
run the validator.
