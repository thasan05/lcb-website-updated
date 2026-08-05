import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvUpdate } from "@/lib/kv";
import { revalidateContent } from "@/lib/revalidate";
import { sanitizeHtml } from "@/lib/sanitize";
import { isValidId, isValidStr, isValidOptionalStr, isValidOptionalUrl, parseBody, errorResponse, ConflictError, NotFoundError, firstIssue, URL_RULE } from "@/lib/api-validation";
import type { Article } from "@/content/articles";

const KEY            = "data:articles";
const MAX_BODY_BYTES = 64 * 1024; // 64 KB — content can be long

// ── Validation ────────────────────────────────────────────────────────────────

function validateArticle(a: unknown): string | null {
  if (typeof a !== "object" || a === null) return "Request body must be an object";
  const m = a as Record<string, unknown>;

  const tagsIssue = ((): string | null => {
    if (m.tags === undefined) return null;
    if (!Array.isArray(m.tags)) return "Tags must be a list";
    if ((m.tags as unknown[]).some((t) => typeof t !== "string" || (t as string).length > 100)) {
      return "Each tag must be text of at most 100 characters";
    }
    return null;
  })();

  return firstIssue([
    [isValidId(m.id), "An id is required"],
    [isValidStr(m.title, 300), "Title is required (max 300 characters)"],
    [isValidStr(m.excerpt, 1000), "Excerpt is required (max 1000 characters)"],
    [isValidStr(m.content, 50000), "Content is required (max 50,000 characters)"],
    [isValidStr(m.authorName, 200), "Author name is required (max 200 characters)"],
    [isValidStr(m.authorDesignation, 300), "Author designation is required (max 300 characters)"],
    [isValidOptionalStr(m.authorCompany, 300), "Author company must be text (max 300 characters)"],
    [isValidOptionalUrl(m.authorPhoto), `Author photo ${URL_RULE} — leave it empty if unused`],
    [isValidStr(m.date, 50), "Date is required"],
    [isValidStr(m.dateLabel, 100), "Date label is required (max 100 characters)"],
    [isValidOptionalUrl(m.coverImage), `Cover image ${URL_RULE} — leave it empty if unused`],
    [tagsIssue === null, tagsIssue ?? ""],
    [typeof m.published === "boolean", "published must be true or false"],
    [m.featured === undefined || typeof m.featured === "boolean", "featured must be true or false"],
  ]);
}

function isValidArticle(a: unknown): a is Article {
  return validateArticle(a) === null;
}

// ── Handlers ─────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const articles = await kvGet<Article[]>(KEY);
    return NextResponse.json(articles ?? []);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request, MAX_BODY_BYTES);
    if (!isValidArticle(body)) {
      return NextResponse.json({ error: validateArticle(body)! }, { status: 400 });
    }
    body.content = sanitizeHtml(body.content);
    await kvUpdate<Article[]>(KEY, (current) => {
      const articles = current ?? [];
      if (articles.some((a) => a.id === body.id)) {
        throw new ConflictError("Article ID already exists");
      }
      return [body, ...articles];
    });
    revalidateContent("articles");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e, "Failed to create article", 400);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await parseBody(request, MAX_BODY_BYTES);

    // Bulk action
    if (typeof body === "object" && body !== null && "action" in body && Array.isArray((body as { ids?: unknown }).ids)) {
      const { action, ids } = body as { action: unknown; ids: unknown[] };
      if (action !== "publish" && action !== "unpublish" && action !== "delete") {
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
      }
      const idSet = new Set<string>(ids as string[]);
      await kvUpdate<Article[]>(KEY, (current) => {
        const articles = current ?? [];
        if (action === "publish")   return articles.map((a) => (idSet.has(a.id) ? { ...a, published: true } : a));
        if (action === "unpublish") return articles.map((a) => (idSet.has(a.id) ? { ...a, published: false } : a));
        return articles.filter((a) => !idSet.has(a.id));
      });
      revalidateContent("articles");
      return NextResponse.json({ ok: true });
    }

    // Single update
    if (!isValidArticle(body)) {
      return NextResponse.json({ error: validateArticle(body)! }, { status: 400 });
    }
    body.content = sanitizeHtml(body.content);
    await kvUpdate<Article[]>(KEY, (current) => {
      const articles = current ?? [];
      if (!articles.some((a) => a.id === body.id)) throw new NotFoundError("Article not found");
      return articles.map((a) => (a.id === body.id ? body : a));
    });
    revalidateContent("articles");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e, "Failed to update article", 400);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await parseBody(request, MAX_BODY_BYTES);
    const { id } = (typeof body === "object" && body !== null ? body : {}) as { id?: unknown };
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    await kvUpdate<Article[]>(KEY, (current) => (current ?? []).filter((a) => a.id !== id));
    revalidateContent("articles");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e, "Failed to delete article", 400);
  }
}
