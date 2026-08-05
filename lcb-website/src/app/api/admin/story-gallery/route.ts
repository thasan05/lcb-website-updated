import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvUpdate } from "@/lib/kv";
import { revalidateContent } from "@/lib/revalidate";
import { isValidId, isValidUrl, parseBody, errorResponse } from "@/lib/api-validation";

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

function isValidItem(item: unknown): item is GalleryItem {
  if (typeof item !== "object" || item === null) return false;
  const m = item as Record<string, unknown>;
  if (!isValidId(m.id))                             return false;
  if (!isValidUrl(m.src))                           return false;
  if (typeof m.alt !== "string")                    return false;
  if (m.caption !== undefined && typeof m.caption !== "string") return false;
  if (m.span    !== undefined && typeof m.span    !== "string") return false;
  if (m.srcs !== undefined) {
    if (!Array.isArray(m.srcs)) return false;
    if (!(m.srcs as unknown[]).every((s) => isValidUrl(s))) return false;
  }
  return true;
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
      return NextResponse.json({ error: "Invalid item data" }, { status: 400 });
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
