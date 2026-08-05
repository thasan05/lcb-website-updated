# Security Hardening Checklist — LCB Website

Use before each production deployment. Check = implemented and verified.

---

## Authentication & Session

- [x] Admin password compared with constant-time algorithm (no timing oracle)
- [x] Session tokens are HMAC-SHA-256 signed with `SESSION_SECRET`
- [x] Session cookie: `httpOnly`, `secure` (prod), `sameSite: strict`
- [x] Login rate-limited: 5 attempts / IP / 15 min (backed by Upstash)
- [x] `SESSION_SECRET` env var documented and required
- [ ] `SESSION_SECRET` rotated after any suspected compromise
- [ ] `ADMIN_PASSWORD` is a strong random value (≥20 chars), not the dev default
- [ ] 2FA (TOTP) added for admin login *(future)*
- [ ] Session token blacklist in Redis for immediate revocation *(future)*

---

## Authorization & Middleware

- [x] All `/api/admin/*` routes protected by session cookie in middleware
- [x] All `/admin/*` pages redirect to login if unauthenticated
- [x] Magazine subdomain API passthrough limited to `/api/magazine/` only
- [x] Forum subdomain API passthrough limited to `/api/markdown/`
- [ ] Verify after every middleware change: unauthenticated curl to each `/api/admin/*` returns 401

**Smoke test (run after every middleware change):**
```bash
curl -s https://magazine.linkedincommunitybangladesh.com/api/admin/magazines
# Must return: {"error":"Unauthorized"}

curl -s https://linkedincommunitybangladesh.com/api/admin/magazines
# Must return: {"error":"Unauthorized"}
```

---

## Input Validation

- [x] All admin API routes validate each field (type, length, format)
- [x] URL fields validated: must be `https:` or relative `/` — shared helpers in `src/lib/api-validation.ts`, do not hand-roll per route
- [x] Body size limits on all routes (16–64 KB depending on content type)
- [x] Article/event/news HTML content sanitized on write (`sanitizeHtml()`)
- [x] `SafeHtml` component sanitizes before `dangerouslySetInnerHTML`
- [x] RichTextEditor `insertLink` blocks `javascript:`, `vbscript:`, `data:` protocols
- [x] LOR answers validated: object of strings, missing required fields rejected
- [ ] LOR answer field values individually length-capped *(recommended: 2000 chars each)*

---

## Rate Limiting

- [x] Admin login: 5 / IP / 15 min
- [x] LOR submission: 3 / IP / hour
- [x] Page view analytics: 5 / IP / hour
- [x] Visitor counter: 20 / IP / hour
- [x] All rate limiters use `CF-Connecting-IP` (Cloudflare-managed, not spoofable)
- [x] Rate limiter fails open in dev (no Redis) — **does not block local testing**
- [ ] CAPTCHA added to LOR form *(recommended: Cloudflare Turnstile)*
- [ ] Cloudflare WAF rule rate-limiting `/admin/login` at CDN layer *(free tier)*

---

## XSS Prevention

- [x] No `dangerouslySetInnerHTML` without sanitization
- [x] Admin-authored HTML sanitized at both write-time (API) and render-time (`SafeHtml`)
- [x] User-submitted LOR answers HTML-escaped before email interpolation
- [x] `escapeHtml()` covers `&`, `<`, `>`, `"`, `'`
- [x] `sanitizeHtml()` removes: `<script>`, `<iframe>`, `<object>`, `on*` attrs, dangerous protocols
- [x] One-time sanitization job available: `npm run sanitize-content` (dry run) / `-- --apply` (write). Run against production once.
- [ ] Review after any new `dangerouslySetInnerHTML` introduction

---

## Security Headers

- [x] `X-Content-Type-Options: nosniff`
- [x] `X-Frame-Options: DENY` (global), `SAMEORIGIN` (PDF proxy route)
- [x] `Referrer-Policy: strict-origin-when-cross-origin`
- [x] `Strict-Transport-Security` with 2-year max-age, includeSubDomains, preload
- [x] `Permissions-Policy` disabling camera, mic, geolocation
- [x] `Content-Security-Policy` with `frame-ancestors 'none'` (global)
- [x] CSP `script-src` includes `'unsafe-inline'` and `'unsafe-eval'` — **accepted for App Router hydration**
- [ ] Replace `unsafe-inline`/`unsafe-eval` with nonce-based CSP *(significant refactor)*

---

## Dependency Security

- [x] `next@^16.3.0` (patches 9 high-severity CVEs present in 16.2.9)
- [x] `react@^19.2.7` (stable release, no longer RC)
- [x] `postcss@^8.5.15` devdep (above patched threshold)
- [x] No `NEXT_PUBLIC_` env vars exposing secrets to client bundles
- [x] `npm audit` clean as of 2026-08-05 (0 vulnerabilities)
- [ ] `npm audit` run before each deployment (target: 0 high/critical)
- [x] `html2canvas` removed — it was an unused dependency
- [ ] Dependencies pinned to exact versions to prevent supply-chain drift *(recommended)*

---

## Secrets Management

- [x] `.env.local` excluded from git via `.gitignore`
- [x] No secrets in source code (grep: `apiKey =`, `password =` finds no hardcoded values)
- [x] Cloudinary API secret only used server-side (never in client bundles)
- [x] Upstash Redis token only used server-side
- [ ] `ADMIN_PASSWORD` changed from dev default `lcb-admin-2026`
- [ ] `SESSION_SECRET` set to a random 32+ char value on Vercel
- [ ] Secrets rotated if any team member leaves

---

## Infrastructure

- [x] Vercel deployment (no exposed SSH, no server to patch)
- [x] Cloudflare in proxy mode (hides origin IP, adds DDoS protection)
- [x] HTTPS enforced via HSTS
- [x] Cloudinary folder scoped to `lcb-website/` (reduces blast radius of leaked keys)
- [ ] Cloudflare "Under Attack" mode available if DDoS occurs
- [ ] Vercel Preview deployments restricted to team members (prevent enumeration of staging)

---

## Audit Cadence

| Trigger | Action |
|---------|--------|
| New admin API route added | Re-run middleware smoke test |
| New public form added | Add rate limiting, consider CAPTCHA |
| New `dangerouslySetInnerHTML` | Add sanitization, document why it's needed |
| Dependency update | `npm audit`, check breaking changes |
| Admin team change | Rotate `ADMIN_PASSWORD` and `SESSION_SECRET` |
| Suspected compromise | Rotate `SESSION_SECRET` (invalidates all sessions) |
| Quarterly | Review this checklist for drift |
