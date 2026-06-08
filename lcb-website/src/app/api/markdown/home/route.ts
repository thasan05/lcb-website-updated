/**
 * Markdown for Agents — homepage summary
 * Served when any client requests / with Accept: text/markdown
 * (middleware rewrites to here).
 */
import { NextResponse } from "next/server";
import { siteConfig } from "@/content/site";
import { kvGet } from "@/lib/kv";
import type { Article } from "@/content/articles";

export const dynamic = "force-dynamic";

export async function GET() {
  let recent: Article[] = [];
  try {
    const all = await kvGet<Article[]>("data:articles");
    recent = (all ?? []).filter((a) => a.published).slice(0, 5);
  } catch {}

  const base  = siteConfig.url;
  const forum = "https://forum.linkedincommunitybangladesh.com";

  const lines: string[] = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.tagline}`,
    "",
    siteConfig.description,
    "",
    "## About",
    "",
    "Bangladesh's premier LinkedIn-based professional community — empowering students, creators, developers, founders, and future leaders nationwide.",
    "",
    "**Members:** 24,000+  ",
    "**Campus Leads:** 40+  ",
    "**Career Sessions:** 192+  ",
    "**Location:** Dhaka, Bangladesh  ",
    `**Contact:** ${siteConfig.contact.email}  `,
    "",
    "## Key Links",
    "",
    `- **Website:** ${base}`,
    `- **Forum:** ${forum}`,
    `- **LinkedIn:** ${siteConfig.socials.linkedin}`,
    `- **Facebook:** ${siteConfig.socials.facebookPage}`,
    `- **Instagram:** ${siteConfig.socials.instagram}`,
    "",
    "## Public APIs",
    "",
    `| Endpoint | Method | Description |`,
    `|----------|--------|-------------|`,
    `| \`/api/visitors\` | GET | Current site visitor count |`,
    `| \`/api/lor/submit\` | POST | Submit a Letter of Recommendation application |`,
    `| \`/api/markdown/forum/{id}\` | GET | Forum article as Markdown |`,
    "",
    "## Agent Discovery",
    "",
    `- **API Catalog (RFC 9727):** \`GET ${base}/.well-known/api-catalog\``,
    `- **Agent Skills Index:** \`GET ${base}/.well-known/agent-skills/index.json\``,
    `- **Auth / Access:** \`GET ${base}/auth.md\``,
    `- **Content Signals:** \`GET ${base}/robots.txt\``,
    "",
  ];

  if (recent.length > 0) {
    lines.push("## Recent Forum Articles", "");
    for (const a of recent) {
      lines.push(
        `### [${a.title}](${forum}/${a.id})`,
        "",
        `*${a.authorName}${a.authorDesignation ? ` — ${a.authorDesignation}` : ""}  ·  ${a.dateLabel}*`,
        "",
        a.excerpt,
        "",
        `[Read as Markdown](${base}/api/markdown/forum/${a.id})`,
        "",
      );
    }
  }

  const body = lines.join("\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type":     "text/markdown; charset=utf-8",
      "X-Markdown-Tokens": String(body.length),
      "Cache-Control":    "public, max-age=300",
    },
  });
}
