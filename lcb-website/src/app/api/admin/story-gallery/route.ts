import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvUpdate } from "@/lib/kv";
import { revalidateContent } from "@/lib/revalidate";
import { isValidId, isValidUrl, parseBody, errorResponse, firstIssue, URL_RULE } from "@/lib/api-validation";

const KEY            = "data:story-gallery";
const MAX_BODY_BYTES = 32 * 1024; // 32 KB

type GalleryItem = {
  id: string;
  src: string;
  srcs?: string[];
  alt: string;
  caption?: string;
  span?: string;
};

// ── Validation ────────────────────────────────────────────────────────────────

function validateItem(item: unknown): string | null {
  if (typeof item !== "object" || item === null) return "Request body must be an object";
  const m = item as Record<string, unknown>;

  const srcsIssue = ((): string | null => {
    if (m.srcs === undefined) return null;
    if (!Array.isArray(m.srcs)) return "Slideshow photos must be a list";
    if (!(m.srcs as unknown[]).every((s) => isValidUrl(s))) {
      return `Every slideshow photo ${URL_RULE}`;
    }
    return null;
  })();

  return firstIssue([
    [isValidId(m.id), "An id is required"],
    [isValidUrl(m.src), `Photo ${URL_RULE}`],
    [typeof m.alt === "string", "Alt text must be text (it may be empty)"],
    [m.caption === undefined || typeof m.caption === "string", "Caption must be text"],
    [m.span === undefined || typeof m.span === "string", "Span must be text"],
    [srcsIssue === null, srcsIssue ?? ""],
  ]);
}

function isValidItem(item: unknown): item is GalleryItem {
  return validateItem(item) === null;
}

// ── Handlers ──────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    return NextResponse.json(await kvGet<GalleryItem[]>(KEY));
  } catch (err) {
    return errorResponse(err, "Failed to read story gallery");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await parseBody(request, MAX_BODY_BYTES);
    if (!isValidItem(body)) {
      return NextResponse.json({ error: validateItem(body)! }, { status: 400 });
    }
    await kvUpdate<GalleryItem[]>(KEY, (current) =>
      (current ?? []).map((item) => (item.id === body.id ? body : item))
    );
    revalidateContent("story-gallery");
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err, "Failed to update story gallery item");
  }
}
