import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvUpdate } from "@/lib/kv";
import { revalidateContent } from "@/lib/revalidate";
import { sanitizeHtml } from "@/lib/sanitize";
import { isValidId, isValidStr, isValidOptionalStr, isValidOptionalUrl, parseBody, errorResponse, ConflictError, NotFoundError } from "@/lib/api-validation";
import type { Article } from "@/content/articles";

const KEY            = "data:articles";
const MAX_BODY_BYTES = 64 * 1024; // 64 KB — content can be long

// ── Validation ────────────────────────────────────────────────────────────────

function isValidArticle(a: unknown): a is Article {
  if (typeof a !== "object" || a === null) return false;
  const m = a as Record<string, unknown>;
  if (!isValidId(m.id))                           return false;
  if (!isValidStr(m.title, 300))                  return false;
  if (!isValidStr(m.excerpt, 1000))               return false;
  if (!isValidStr(m.content, 50000))              return false;
  if (!isValidStr(m.authorName, 200))             return false;
  if (!isValidStr(m.authorDesignation, 300))      return false;
  if (!isValidOptionalStr(m.authorCompany, 300))  return false;
  if (!isValidOptionalUrl(m.authorPhoto))         return false;
  if (!isValidStr(m.date, 50))                    return false;
  if (!isValidStr(m.dateLabel, 100))              return false;
  if (!isValidOptionalUrl(m.coverImage))          return false;
  if (m.tags !== undefined) {
    if (!Array.isArray(m.tags)) return false;
    if ((m.tags as unknown[]).some((t) => typeof t !== "string" || (t as string).length > 100)) return false;
  }
  if (typeof m.published !== "boolean") return false;
  if (m.featured !== undefined && typeof m.featured !== "boolean") return false;
  return true;
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
      return NextResponse.json({ error: "Invalid article data" }, { status: 400 });
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
      return NextResponse.json({ error: "Invalid article data" }, { status: 400 });
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
