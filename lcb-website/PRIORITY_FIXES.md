# Priority Fixes — LCB Website Security

Ranked by exploitability × impact. All items marked ✅ are implemented.

---

## Tier 1 — Critical / Immediate (fix before going live)

| # | Issue | Risk | Status |
|---|-------|------|--------|
| 1 | Admin auth bypass via magazine subdomain | Unauthenticated full admin API access | ✅ Fixed |
| 2 | Stored XSS via `SafeHtml` (no sanitization) | JS execution for all public visitors | ✅ Fixed |
| 3 | `javascript:` URL injection via RichTextEditor | Stored XSS on click in forum articles | ✅ Fixed |
| 4 | HTML injection in LOR notification email | Phishing / tracking against admin | ✅ Fixed |
| 5 | React RC version in production | Unsupported, no security patches | ✅ Fixed |
| 6 | Next.js 15.x with 15+ known CVEs (middleware bypass, cache poisoning, SSRF) | Multiple attack surfaces | ✅ Fixed |

---

## Tier 2 — High / Fix This Sprint

| # | Issue | Risk | Status |
|---|-------|------|--------|
| 7 | LOR submit had no rate limiting | KV/storage exhaustion, email quota drain | ✅ Fixed |
| 8 | Visitor counter had no rate limiting | Stat inflation | ✅ Fixed |
| 9 | Rate limiter used spoofable `x-forwarded-for` | Brute-force bypass on login | ✅ Fixed |
| 10 | `SESSION_SECRET` undocumented / missing | Admin login broken if not set; forgeable sessions if weak | ✅ Fixed |
| 11 | postcss devdep below patched version | Build-time moderate XSS | ✅ Fixed |

---

## Tier 3 — Medium / Next Release

| # | Issue | Risk | Status |
|---|-------|------|--------|
| 12 | No CAPTCHA on LOR form | Distributed bot spam | ⚠️ Accepted |
| 13 | Session tokens non-revocable | Password change doesn't log out sessions | ⚠️ Accepted |
| 14 | Cloudinary signature not domain-validated | Admin session leak → Cloudinary abuse | ⚠️ Documented |
| 15 | Existing stored content not retroactively sanitized | Pre-audit articles may have XSS payloads | ⚠️ Needs migration |

---

## Tier 4 — Low / Backlog

| # | Issue | Risk | Status |
|---|-------|------|--------|
| 16 | `html2canvas` unmaintained | Future CVEs, no patches | ⚠️ Backlog |
| 17 | No 2FA for admin login | Single password credential | ⚠️ Backlog |
| 18 | Bundled postcss in Next.js 16.x | Build-time moderate, upstream fix needed | ⚠️ Accepted |
| 19 | MIME type validation client-controlled on upload | In-prod path goes to Cloudinary (safe) | ⚠️ Accepted |

---

## Action Required From You

1. **Set strong `ADMIN_PASSWORD`** on Vercel: `openssl rand -base64 24` — replace the current dev default
2. **Set `SESSION_SECRET`** on Vercel: `openssl rand -base64 32` — required for admin login to work
3. **Run one-time content sanitization** against existing KV data (see item 15 above)
4. **Consider Cloudflare Turnstile** on the LOR form (free, 5 min integration)
