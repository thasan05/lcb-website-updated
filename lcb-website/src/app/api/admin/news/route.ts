import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvUpdate } from "@/lib/kv";
import { revalidateContent } from "@/lib/revalidate";
import { sanitizeHtml } from "@/lib/sanitize";
import { isValidId, isValidStr, isValidUrl, parseBody, errorResponse, firstIssue, URL_RULE } from "@/lib/api-validation";
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

// Returns a message naming the offending field, or null when the item is valid.
// Accept/reject logic is identical to the boolean guard it replaced.
function validateNewsItem(n: unknown): string | null {
  if (typeof n !== "object" || n === null) return "Request body must be an object";
  const m = n as Record<string, unknown>;

  const socialIssue = ((): string | null => {
    if (m.social === undefined) return null;
    if (typeof m.social !== "object" || m.social === null) return "Social links must be an object";
    const s = m.social as Record<string, unknown>;
    const LABELS: Record<string, string> = {
      linkedin: "LinkedIn", facebook: "Facebook", instagram: "Instagram",
    };
    for (const k of ["linkedin", "facebook", "instagram"]) {
      if (s[k] !== undefined && !isValidOptionalUrl(s[k])) {
        return `${LABELS[k]} post URL ${URL_RULE} — leave it empty if unused`;
      }
    }
    return null;
  })();

  return firstIssue([
    [isValidId(m.id), "An id is required"],
    [isValidStr(m.title, 300), "Title is required (max 300 characters)"],
    [isValidStr(m.summary, 3000), "Summary is required (max 3000 characters)"],
    [isValidStr(m.date, 50), "Date is required"],
    [isValidStr(m.dateLabel, 100), "Date label is required (max 100 characters)"],
    [VALID_CATEGORIES.has(m.category as string), `Category must be one of: ${[...VALID_CATEGORIES].join(", ")}`],
    [isValidUrl(m.image), `Image ${URL_RULE}`],
    [isValidOptionalUrl(m.href), `External link ${URL_RULE} — leave it empty if unused`],
    [m.featured === undefined || typeof m.featured === "boolean", "featured must be true or false"],
    [m.published === undefined || typeof m.published === "boolean", "published must be true or false"],
    [socialIssue === null, socialIssue ?? ""],
  ]);
}

function isValidNewsItem(n: unknown): n is NewsItem {
  return validateNewsItem(n) === null;
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
      return NextResponse.json({ error: validateNewsItem(body)! }, { status: 400 });
    }
    body.summary = sanitizeHtml(body.summary);
    await kvUpdate<NewsItem[]>(KEY, (current) => {
      // Only one item may be featured, so adding a featured item clears the rest.
      const news = body.featured
        ? (current ?? []).map((n) => ({ ...n, featured: false }))
        : (current ?? []);
      return [body, ...news];
    });
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
      return NextResponse.json({ error: validateNewsItem(body)! }, { status: 400 });
    }
    body.summary = sanitizeHtml(body.summary);
    await kvUpdate<NewsItem[]>(KEY, (current) => {
      let news = current ?? [];
      if (body.featured) {
        news = news.map((n) => ({ ...n, featured: n.id === body.id }));
      }
      return news.map((n) => (n.id === body.id ? body : n));
    });
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
    await kvUpdate<NewsItem[]>(KEY, (current) => (current ?? []).filter((n) => n.id !== id));
    revalidateContent("news");
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err, "Failed to delete news item");
  }
}
