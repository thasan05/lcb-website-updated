import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";
import type { NewsItem } from "@/content/news";

const KEY            = "data:news";
const MAX_BODY_BYTES = 32 * 1024; // 32 KB

// ── Validation ────────────────────────────────────────────────────────────────

const VALID_CATEGORIES = new Set([
  "Announcement", "Event", "Milestone", "Partnership", "Spotlight",
]);

function isValidId(v: unknown): v is string {
  return typeof v === "string" && v.length > 0 && v.length < 200;
}

function isValidStr(v: unknown, max = 2000): v is string {
  return typeof v === "string" && v.length > 0 && v.length <= max;
}

function isValidUrl(v: unknown): v is string {
  if (typeof v !== "string") return false;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || v.startsWith("/");
  } catch { return false; }
}

function isValidOptionalUrl(v: unknown): boolean {
  return v === undefined || isValidUrl(v);
}

function isValidNewsItem(n: unknown): n is NewsItem {
  if (typeof n !== "object" || n === null) return false;
  const m = n as Record<string, unknown>;
  if (!isValidId(m.id))                             return false;
  if (!isValidStr(m.title, 300))                    return false;
  if (!isValidStr(m.summary, 3000))                 return false;
  if (!isValidStr(m.date, 50))                      return false;
  if (!isValidStr(m.dateLabel, 100))                return false;
  if (!VALID_CATEGORIES.has(m.category as string))  return false;
  if (!isValidUrl(m.image))                         return false;
  if (!isValidOptionalUrl(m.href))                  return false;
  if (m.featured   !== undefined && typeof m.featured   !== "boolean") return false;
  if (m.published  !== undefined && typeof m.published  !== "boolean") return false;
  if (m.social !== undefined) {
    if (typeof m.social !== "object" || m.social === null) return false;
    const s = m.social as Record<string, unknown>;
    for (const k of ["linkedin", "facebook", "instagram"]) {
      if (s[k] !== undefined && !isValidOptionalUrl(s[k])) return false;
    }
  }
  return true;
}

async function parseBody(request: NextRequest) {
  const cl = Number(request.headers.get("content-length") ?? 0);
  if (cl > MAX_BODY_BYTES) throw new Error("Request body too large");
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) throw new Error("Request body too large");
  return JSON.parse(text) as unknown;
}

// ── Handlers ──────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    return NextResponse.json(await kvGet<NewsItem[]>(KEY));
  } catch {
    return NextResponse.json({ error: "Failed to read news" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request);
    if (!isValidNewsItem(body)) {
      return NextResponse.json({ error: "Invalid news item" }, { status: 400 });
    }
    const news = await kvGet<NewsItem[]>(KEY);
    if (body.featured) news.forEach((n) => { n.featured = false; });
    news.unshift(body);
    await kvSet(KEY, news);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create news item";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await parseBody(request);
    if (!isValidNewsItem(body)) {
      return NextResponse.json({ error: "Invalid news item" }, { status: 400 });
    }
    let news = await kvGet<NewsItem[]>(KEY);
    if (body.featured) {
      news = news.map((n) => ({ ...n, featured: n.id === body.id }));
    }
    news = news.map((n) => (n.id === body.id ? body : n));
    await kvSet(KEY, news);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to update news item";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await parseBody(request);
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const { id } = body as { id?: unknown };
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const news = (await kvGet<NewsItem[]>(KEY)).filter((n) => n.id !== id);
    await kvSet(KEY, news);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to delete news item";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
