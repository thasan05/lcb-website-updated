/**
 * Markdown for Agents — /api/markdown/forum/[id]
 * Returns a forum article as text/markdown when:
 *   - fetched directly at this URL, OR
 *   - the browser/agent hits /forum/[id] with Accept: text/markdown
 *     (middleware rewrites to here)
 *
 * https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet } from "@/lib/kv";
import { siteConfig } from "@/content/site";
import type { Article } from "@/content/articles";

export const dynamic = "force-dynamic";

/** Best-effort HTML → Markdown (no dependencies). */
function htmlToMarkdown(html: string): string {
  return html
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi,      "# $1\n\n")
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi,      "## $1\n\n")
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi,      "### $1\n\n")
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi,      "#### $1\n\n")
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**")
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi,        "**$1**")
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi,      "_$1_")
    .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi,        "_$1_")
    .replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi,      "- $1\n")
    .replace(/<ul[^>]*>|<\/ul>|<ol[^>]*>|<\/ol>/gi, "")
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, "> $1\n\n")
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi,        "$1\n\n")
    .replace(/<br\s*\/?>/gi,                     "\n")
    .replace(/<[^>]+>/g,                         "")
    .replace(/&amp;/g,  "&")
    .replace(/&lt;/g,   "<")
    .replace(/&gt;/g,   ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const articles = await kvGet<Article[]>("data:articles");
    const article  = articles?.find((a) => a.id === id && a.published);

    if (!article) {
      return new NextResponse("# 404 Not Found\n\nArticle not found.", {
        status: 404,
        headers: { "Content-Type": "text/markdown; charset=utf-8" },
      });
    }

    const forumUrl = `https://forum.linkedincommunitybangladesh.com/${article.id}`;
    const author = [
      article.authorName,
      article.authorDesignation,
      article.authorCompany,
    ].filter(Boolean).join(" — ");

    const lines = [
      `# ${article.title}`,
      "",
      `> ${article.excerpt}`,
      "",
      `**Author:** ${author}  `,
      `**Published:** ${article.dateLabel}  `,
      ...(article.tags?.length ? [`**Tags:** ${article.tags.join(", ")}  `] : []),
      ...(article.coverImage   ? [`**Cover:** ${article.coverImage}  `]    : []),
      "",
      "---",
      "",
      htmlToMarkdown(article.content),
      "",
      "---",
      "",
      `*Source: [${article.title}](${forumUrl})*  `,
      `*© ${new Date().getFullYear()} ${siteConfig.shortName}. All rights reserved.*`,
    ].join("\n");

    return new NextResponse(lines, {
      headers: {
        "Content-Type":     "text/markdown; charset=utf-8",
        "X-Markdown-Tokens": String(lines.length),
        "Cache-Control":    "public, max-age=300",
      },
    });
  } catch {
    return new NextResponse("# Error\n\nFailed to fetch article.", {
      status: 500,
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
  }
}
