# Inconsistency Pattern Catalog

Concrete patterns to hunt in Phase 2, category 2. Each pattern includes a
detection signal and a typical evidence quote format.

## 1. Contract Mismatch

Same concept, different shape across layers.

- **Signal**: function signature, API route, or schema field used with
  different names, types, or nullability in two places.
- **Evidence**: quote both sides, e.g.
  `middleware expects user_id: string` vs `handler reads req.body.userId`.

## 2. Permission / ACL Drift

- **Signal**: auth check in app layer disagrees with data-layer policy.
  Classic case: middleware checks `user_id` but RLS/policy uses `auth.uid()`,
  or an endpoint checks role A while the service checks role B.
- **Evidence**: quote the check and the policy side by side.

## 3. Doc-vs-Code Drift

- **Signal**: README, JSDoc/docstring, or comment states behavior the code
  does not implement (or no longer implements).
- **Evidence**: quote the doc claim and the contradicting line.

## 4. Divergent Sibling Patterns

- **Signal**: two similar modules (handlers, services, components) handle
  the same concern differently — one validates input, the other doesn't;
  one logs errors, the other swallows them.
- **Evidence**: quote both modules' handling of the same concern.

## 5. Naming That Lies

- **Signal**: name promises behavior the code doesn't deliver:
  `getUserById` that queries by email, `safeParse` that throws,
  `isEmpty` that ignores a field.
- **Evidence**: quote name and actual behavior line.

## 6. Error-Handling Inconsistency

- **Signal**: same error type handled differently across call sites;
  some rethrow, some swallow, some retry. Mixed HTTP status mapping for
  the same error condition.
- **Evidence**: quote the divergent handlers.

## 7. Config / Environment Drift

- **Signal**: same setting read from different env var names in different
  files; default values that disagree; `.env.example` out of sync with code.
- **Evidence**: quote each read site with its default.

## 8. Test-vs-Production Path Mismatch

- **Signal**: tests exercise a code path (mock, fixture, flag) that differs
  from the production path in a way that hides bugs.
- **Evidence**: quote the mock/fixture and the production branch.

## 9. Cache vs Source-of-Truth Drift

- **Signal**: a read uses a cached value while a write updates only the
  database (or vice versa); cache keys omit a tenant/user dimension.
- **Evidence**: quote the read key/TTL and the write path that fails to
  invalidate or repopulate it.

## 10. Duplicate Side Effects

- **Signal**: two layers send the same notification, charge, or write for one
  event; a handler calls a helper that already performs the side effect.
- **Evidence**: quote both call sites and the shared helper, then trace one
  input through them.

## 11. Validation Drift Across Entry Points

- **Signal**: the same field is validated in HTTP validation but not in a
  webhook, import, admin endpoint, or background job.
- **Evidence**: quote one enforcing path and one bypass path side by side.

## Detection Heuristics

- Compare every duplicate-looking block: if two blocks do "the same thing",
  diff them mentally line by line.
- For any validation, ask: is it enforced everywhere this input enters?
- For any auth check, ask: does the data layer enforce the same rule?
- For any documented behavior, ask: does at least one test pin it?
- For any cache, ask: what invalidates it, and can a stale value cross a
  tenant boundary?
- For any side effect, ask: can two paths fire it for the same event?
- In diff mode, trace changed values into their consumers before calling a
  mismatch a regression.
