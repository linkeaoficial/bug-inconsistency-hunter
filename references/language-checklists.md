# Language & Stack Checklists

Load the section(s) matching the target's stack. Each item is a concrete
bug class to actively look for — not a generic suggestion.

## JavaScript / TypeScript

- `==` vs `===`, truthiness traps (`0`, `""`, `[]`).
- `await` missing inside loops/conditionals → floating promise.
- `.map`/`.forEach` with `async` callback: `forEach` never awaits.
- Array mutation while iterating; shared object references.
- `JSON.parse` without try/catch on external input.
- Optional chaining masking `undefined` that reaches business logic.
- `Promise.all` vs `Promise.allSettled` when partial failure matters.
- Off-by-one in `slice`/`substring`/`splice`.
- React: stale closure in `useEffect`, missing/incorrect deps, missing
  cleanup, state updates on unmounted components, `key` on list items.

## Python

- Mutable default arguments (`def f(x=[])`).
- Late binding closures in loops.
- `except:` / `except Exception:` swallowing errors silently.
- `is` compared with literals instead of `==`.
- Integer division vs float division assumptions.
- Shadowing builtins (`list`, `id`, `type`).
- Async: blocking calls inside `async def`; unawaited coroutines.

## SQL / Database

- N+1 query patterns (query inside a loop).
- Missing transaction around multi-step writes; partial writes on failure.
- String interpolation in queries (injection) vs parameterized queries.
- `NULL` comparisons (`= NULL` instead of `IS NULL`).
- Missing `LIMIT` on unbounded scans.
- Migrations that are not idempotent or not reversible.
- RLS / policy vs application-layer authz mismatch.

## Cloudflare Workers / serverless

- `ctx.waitUntil()` with a promise that can reject after the response is sent;
  the user succeeds but the write/alert silently fails.
- `fetch` without `AbortSignal.timeout` or an equivalent deadline.
- KV is eventually consistent: a read-after-write may return the old value;
  check invalidation keys and fallback behavior.
- D1: multi-statement writes that are not in a batch/transaction; partial
  writes after a failure.
- Read-modify-write races on counters and quotas (no atomic increment).
- CPU/wall-clock limits and subrequest limits exceeded by unbounded loops.
- Secrets read from the wrong binding or echoed into responses/logs.

## Go

- Ignored `error` return values.
- Goroutine leaks (no context cancellation).
- Loop variable capture in goroutines (pre-1.22).
- Data races on shared maps/slices without a mutex.
- `defer` inside loops holding resources until function exit.
- nil map writes.

## Java / Kotlin

- `==` on boxed types/strings (use `.equals`).
- Resource leaks: streams/connections not in try-with-resources.
- `equals`/`hashCode` contract violations.
- Concurrent modification of collections.
- Checked exceptions swallowed.

## Rust

- `unwrap()`/`expect()` on values that can fail in production paths.
- Integer overflow in release mode (`wrapping` vs `checked`).
- `clone()` overuse hiding ownership/lifetime bugs.
- `unsafe` blocks without justification.

## General (any stack)

- Error paths that lose the original cause.
- Time zones / date parsing without explicit timezone.
- Currency math in floats instead of integer minor units.
- Retries or duplicated events without idempotency keys (double charge,
  double alert, double lead).
- Cache keys missing a tenant/user scope (cross-account data leak).
- Validation enforced at one entry point but skipped at another path into the
  same data.
- Pagination boundaries (last page, empty page).
- Unicode / encoding handling in user input.
- Feature flag defaults that differ from production.
- Read-modify-write on shared state without an atomic operation.
