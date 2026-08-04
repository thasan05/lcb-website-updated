import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";
import { revalidateContent } from "@/lib/revalidate";
import { sanitizeHtml } from "@/lib/sanitize";
import { isValidId, isValidStr, isValidUrl, parseBody, errorResponse } from "@/lib/api-validation";
import type { NewsItem } from "@/content/news";

const KEY            = "data:news";
const MAX_BODY_BYTES = 32 * 1024; // 32 KB

// ── Validation ────────────────────────────────────────────────────────────────

const VALID_CATEGORIES = new Set([
  "Announcement", "Event", "Milestone", "Partnership", "Spotlight",
]);

// Unlike isValidOptionalUrl in api-validation, this route never accepted an
// empty-string href — preserved as-is to avoid loosening existing validation.
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

// ── Handlers ──────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    return NextResponse.json(await kvGet<NewsItem[]>(KEY));
  } catch (err) {
    return errorResponse(err, "Failed to read news");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request, MAX_BODY_BYTES);
    if (!isValidNewsItem(body)) {
      return NextResponse.json({ error: "Invalid news item" }, { status: 400 });
    }
    body.summary = sanitizeHtml(body.summary);
    const news = await kvGet<NewsItem[]>(KEY);
    if (body.featured) news.forEach((n) => { n.featured = false; });
    news.unshift(body);
    await kvSet(KEY, news);
    revalidateContent("news");
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err, "Failed to create news item");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await parseBody(request, MAX_BODY_BYTES);
    if (!isValidNewsItem(body)) {
      return NextResponse.json({ error: "Invalid news item" }, { status: 400 });
    }
    body.summary = sanitizeHtml(body.summary);
    let news = await kvGet<NewsItem[]>(KEY);
    if (body.featured) {
      news = news.map((n) => ({ ...n, featured: n.id === body.id }));
    }
    news = news.map((n) => (n.id === body.id ? body : n));
    await kvSet(KEY, news);
    revalidateContent("news");
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err, "Failed to update news item");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await parseBody(request, MAX_BODY_BYTES);
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const { id } = body as { id?: unknown };
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const news = (await kvGet<NewsItem[]>(KEY)).filter((n) => n.id !== id);
    await kvSet(KEY, news);
    revalidateContent("news");
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err, "Failed to delete news item");
  }
}
