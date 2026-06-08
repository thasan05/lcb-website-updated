/**
 * Auth.md — /auth.md
 * https://github.com/workos/auth.md
 *
 * Documents authentication requirements for AI agents interacting
 * with the LCB platform.
 */
import { NextResponse } from "next/server";
import { siteConfig } from "@/content/site";

export const dynamic = "force-static";

export function GET() {
  const base = siteConfig.url;

  const body = `# Authentication Guide for AI Agents

**Site:** ${base}
**Organization:** ${siteConfig.name}
**Contact:** ${siteConfig.contact.email}

---

## Public Endpoints — No Authentication Required

All read-only discovery and content endpoints are publicly accessible:

| Endpoint | Method | Returns |
|----------|--------|---------|
| \`/api/visitors\` | GET | \`{ count: number }\` — visitor count |
| \`/api/markdown/forum/{id}\` | GET | Forum article as \`text/markdown\` |
| \`/.well-known/api-catalog\` | GET | RFC 9727 API catalog |
| \`/.well-known/agent-skills/index.json\` | GET | Agent skills index |
| \`/.well-known/oauth-protected-resource\` | GET | Resource metadata (RFC 9728) |

### Content Negotiation

Forum articles support \`Accept: text/markdown\` — agents may send this header
on any \`GET https://forum.linkedincommunitybangladesh.com/{article-id}\` request
and receive clean Markdown in return.

## Write Endpoints — No Auth, Rate-Limited

| Endpoint | Method | Body |
|----------|--------|------|
| \`/api/lor/submit\` | POST | \`{ "answers": { [questionId]: string } }\` |

Rate limit: 10 requests / IP / hour.
Returns \`403\` when LOR applications are closed.

## Admin Endpoints — Not for Agent Access

Endpoints under \`/api/admin/*\` require an \`lcb_admin_session\` cookie issued
by the site's internal authentication system. These endpoints are not intended
for agent access and are not documented here.

---

## Agent Registration

No registration is required to use public endpoints.
For custom integration inquiries, contact: **${siteConfig.contact.email}**
`;

  return new NextResponse(body, {
    headers: {
      "Content-Type":              "text/markdown; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
