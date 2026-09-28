# GVR Consulting — Security Baseline

This repository hosts the public static frontend for gvrconsulting.com.mx.

## Frontend controls

- User and AI-generated text must always be rendered with `textContent`, never `innerHTML`.
- No API keys, tokens, passwords, private prompts or credentials may be committed to this repository.
- Cross-origin requests must omit credentials unless a future authenticated design explicitly requires them.
- Keep client-side input limits, request timeouts and response validation enabled.

## Required controls for `gvr-asistente.villangr2508.workers.dev`

The Worker is a separate security boundary. Client-side controls are not security controls because callers can bypass the website and invoke the endpoint directly.

The Worker should enforce all of the following server-side:

1. Allow `POST` and `OPTIONS` only on `/chat`; reject other methods/routes.
2. CORS allowlist: `https://gvrconsulting.com.mx` and any explicitly required canonical host only. Do not use `Access-Control-Allow-Origin: *`.
3. Validate `Content-Type: application/json`.
4. Reject request bodies larger than a small fixed limit (for example 12 KB).
5. Accept only a bounded `messages` array (maximum 10 messages).
6. Accept only expected roles (`user`, `assistant`) and string content.
7. Enforce a maximum message length server-side (800 characters recommended for this UI).
8. Add rate limiting per IP/session and a global spend/budget guard for the AI provider.
9. Keep provider API keys in Cloudflare Worker secrets/environment bindings. Never return them to the browser or log them.
10. Set upstream AI timeouts and maximum output-token limits.
11. Return generic errors to clients; do not expose stack traces, provider payloads, secrets or internal prompts.
12. Do not trust user instructions that request secrets, system prompts, credentials or internal configuration.
13. Avoid logging full conversations unless there is a documented need, retention period and privacy notice.

## Recommended HTTP response headers

Configure these at the CDN/hosting layer when possible:

- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy` with an allowlist matching this site's actual resources. At minimum account for `self`, Google Fonts, and `https://gvr-asistente.villangr2508.workers.dev` in `connect-src`.
- Prefer CSP `frame-ancestors 'none'` to prevent framing/clickjacking.

Test CSP in report-only mode before enforcing it so production functionality is not accidentally blocked.

## Incident response

If a credential is ever committed, deleting it from the current branch is not sufficient. Rotate/revoke the credential immediately and then address Git history as appropriate.

## Reporting

Security concerns should be reported privately to GVR Consulting rather than opened as public issues when they could expose an exploitable weakness.
