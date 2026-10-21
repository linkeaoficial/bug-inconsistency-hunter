# Security Patterns (category 5)

Scan for these when the target handles input, auth, data, or the network.
Each pattern shows the vulnerable shape and the safe shape to contrast.

## SQL Injection

```python
# VULNERABLE
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
# SAFE
cursor.execute("SELECT * FROM users WHERE id = %s", [user_id])
```

## XSS

```js
// VULNERABLE
element.innerHTML = userInput;
// SAFE
element.textContent = userInput;
```

## Command Injection

```js
// VULNERABLE
exec(`convert ${userFile} out.png`);
// SAFE
execFile("convert", [userFile, "out.png"]);
```

## Auth & Authorization

- Missing authorization check on an endpoint (authenticated != authorized).
- Client-side-only role checks; server trusts client claims.
- App-layer check disagrees with data-layer policy (RLS, ACL).
- IDOR: object fetched by id without verifying ownership.

## Deserialization & SSRF

- `pickle.loads`, `yaml.load` (non-safe), or `eval` on external data.
- Server-side URL fetch from user input without an allowlist (SSRF).
- Only checking the URL scheme/hostname but following redirects into private
  ranges, or allowing DNS rebinding.
- Path traversal: `../` in file paths built from user input.

## Outbound requests

- No timeout (`AbortSignal.timeout`, client deadline) on an external call.
- No response-size cap; unbounded `res.text()`/`res.json()`.
- User-controlled URL with no HTTPS/private-host validation.
- Retries without a cap or idempotency key.
- Webhook payloads that include secrets, full session IDs, or unnecessary PII.

## Secrets and output

- Secrets in source, logs, error bodies, or webhook payloads.
- Tokens pasted into a review report without redaction.
- Weak PRNG (`Math.random()`) for tokens or passwords.
- MD5/SHA1 for password hashing instead of bcrypt/argon2.
- Missing constant-time comparison for secrets.

## CORS / CSRF

- `Access-Control-Allow-Origin: *` combined with credentials.
- Origin echoed without an allowlist.
- State-changing GET, or state-changing POST without CSRF protection when
  cookies are the auth mechanism.

## Severity Hint

Independently exploitable with real impact → 🔴 Critical. Requires
preconditions but leaks/corrupts data → 🟠 High. Defense-in-depth gap →
🟡 Medium. Always quote the exact vulnerable line.
