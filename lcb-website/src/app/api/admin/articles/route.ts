import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";
import { sanitizeHtml } from "@/lib/sanitize";
import type { Article } from "@/content/articles";

const KEY            = "data:articles";
const MAX_BODY_BYTES = 64 * 1024; // 64 KB — content can be long

// ── Validation ────────────────────────────────────────────────────────────────

function isValidId(v: unknown): v is string {
  return typeof v === "string" && v.length > 0 && v.length < 200;
}

function isValidStr(v: unknown, max = 2000): v is string {
  return typeof v === "string" && v.length > 0 && v.length <= max;
}

function isValidOptionalStr(v: unknown, max = 2000): boolean {
  return v === undefined || (typeof v === "string" && v.length <= max);
}

function isValidUrl(v: unknown): v is string {
  if (typeof v !== "string") return false;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || v.startsWith("/");
  } catch { return false; }
}

function isValidOptionalUrl(v: unknown): boolean {
  return v === undefined || v === "" || isValidUrl(v);
}

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

async function parseBody(request: NextRequest) {
  const cl = Number(request.headers.get("content-length") ?? 0);
  if (cl > MAX_BODY_BYTES) throw new Error("Request body too large");
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) throw new Error("Request body too large");
  return JSON.parse(text);
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
    const body = await parseBody(request);
    const articles = (await kvGet<Article[]>(KEY)) ?? [];
    if (!isValidArticle(body)) {
      return NextResponse.json({ error: "Invalid article data" }, { status: 400 });
    }
    if (articles.some((a) => a.id === body.id)) {
      return NextResponse.json({ error: "Article ID already exists" }, { status: 409 });
    }
    body.content = sanitizeHtml(body.content);
    articles.unshift(body);
    await kvSet(KEY, articles);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await parseBody(request);

    // Bulk action
    if (body.action && Array.isArray(body.ids)) {
      const articles = (await kvGet<Article[]>(KEY)) ?? [];
      const idSet = new Set<string>(body.ids as string[]);
      let updated: Article[];
      if (body.action === "publish") {
        updated = articles.map((a) => (idSet.has(a.id) ? { ...a, published: true } : a));
      } else if (body.action === "unpublish") {
        updated = articles.map((a) => (idSet.has(a.id) ? { ...a, published: false } : a));
      } else if (body.action === "delete") {
        updated = articles.filter((a) => !idSet.has(a.id));
      } else {
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
      }
      await kvSet(KEY, updated);
      return NextResponse.json({ ok: true });
    }

    // Single update
    if (!isValidArticle(body)) {
      return NextResponse.json({ error: "Invalid article data" }, { status: 400 });
    }
    body.content = sanitizeHtml(body.content);
    const articles = (await kvGet<Article[]>(KEY)) ?? [];
    const idx = articles.findIndex((a) => a.id === body.id);
    if (idx === -1) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    articles[idx] = body;
    await kvSet(KEY, articles);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await parseBody(request);
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    const articles = (await kvGet<Article[]>(KEY)) ?? [];
    await kvSet(KEY, articles.filter((a) => a.id !== id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
