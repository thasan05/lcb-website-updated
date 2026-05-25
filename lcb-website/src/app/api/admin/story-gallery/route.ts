import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";

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

function isValidId(v: unknown): v is string {
  return typeof v === "string" && v.length > 0 && v.length < 200;
}

function isValidUrl(v: unknown): v is string {
  if (typeof v !== "string") return false;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || v.startsWith("/");
  } catch { return false; }
}

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
    if (!(m.srcs as unknown[]).every(isValidUrl))   return false;
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
    return NextResponse.json(await kvGet<GalleryItem[]>(KEY));
  } catch {
    return NextResponse.json({ error: "Read failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await parseBody(request);
    if (!isValidItem(body)) {
      return NextResponse.json({ error: "Invalid item data" }, { status: 400 });
    }
    const items = (await kvGet<GalleryItem[]>(KEY)).map((item) =>
      item.id === body.id ? body : item
    );
    await kvSet(KEY, items);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Write failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
