import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";

const KEY = "data:gallery-manifest";
const MAX_BODY_BYTES = 64 * 1024; // 64 KB — manifests should never be larger

type GalleryCategory = { id: string; label: string };
type GalleryImage = {
  id: string;
  src: string;
  category: string;
  alt: string;
  caption?: string;
};
type Manifest = {
  version: number;
  categories: GalleryCategory[];
  images: GalleryImage[];
};

// ── Validation helpers ────────────────────────────────────────────────────────

function isValidId(id: unknown): id is string {
  return typeof id === "string" && id.length > 0 && id.length < 200;
}

function isValidUrl(src: unknown): src is string {
  if (typeof src !== "string") return false;
  try {
    const u = new URL(src);
    return u.protocol === "https:" || src.startsWith("/");
  } catch { return false; }
}

function isValidImage(img: unknown): img is GalleryImage {
  if (typeof img !== "object" || img === null) return false;
  const m = img as Record<string, unknown>;
  return (
    isValidId(m.id) &&
    isValidUrl(m.src) &&
    typeof m.category === "string" &&
    typeof m.alt === "string" &&
    (m.caption === undefined || typeof m.caption === "string")
  );
}

async function parseBody(request: NextRequest) {
  const cl = Number(request.headers.get("content-length") ?? 0);
  if (cl > MAX_BODY_BYTES) {
    throw new Error("Request body too large");
  }
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) throw new Error("Request body too large");
  return JSON.parse(text) as unknown;
}

// ── Handlers ──────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    return NextResponse.json(await kvGet<Manifest>(KEY));
  } catch {
    return NextResponse.json({ error: "Failed to read manifest" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request);
    if (!isValidImage(body)) {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    }
    const manifest = await kvGet<Manifest>(KEY);
    manifest.images.unshift(body);
    await kvSet(KEY, manifest);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to add image";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body    = await parseBody(request);
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const payload = body as Record<string, unknown>;
    const manifest = await kvGet<Manifest>(KEY);

    if (payload.type === "categories") {
      // Validate categories array
      if (!Array.isArray(payload.categories)) {
        return NextResponse.json({ error: "Invalid categories" }, { status: 400 });
      }
      const cats = payload.categories as unknown[];
      if (!cats.every((c) => typeof c === "object" && c !== null &&
        typeof (c as Record<string, unknown>).id === "string" &&
        typeof (c as Record<string, unknown>).label === "string")) {
        return NextResponse.json({ error: "Invalid category shape" }, { status: 400 });
      }
      manifest.categories = cats as GalleryCategory[];

    } else if (payload.type === "reorder") {
      // Validate: must be an array of valid images, IDs must match existing manifest
      if (!Array.isArray(payload.images)) {
        return NextResponse.json({ error: "Invalid images array" }, { status: 400 });
      }
      const incoming = payload.images as unknown[];
      const existingIds = new Set(manifest.images.map((i) => i.id));

      if (!incoming.every((img) => isValidImage(img) && existingIds.has((img as GalleryImage).id))) {
        return NextResponse.json({ error: "Reorder contains unknown image IDs" }, { status: 400 });
      }
      if (incoming.length !== manifest.images.length) {
        return NextResponse.json({ error: "Reorder length mismatch" }, { status: 400 });
      }
      manifest.images = incoming as GalleryImage[];

    } else {
      // Single image update
      if (!isValidImage(payload)) {
        return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
      }
      manifest.images = manifest.images.map((img) =>
        img.id === payload.id ? payload : img
      );
    }

    await kvSet(KEY, manifest);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to update";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await parseBody(request);
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const { id, ids } = body as { id?: unknown; ids?: unknown };
    const toDelete: string[] =
      Array.isArray(ids) ? ids.filter(isValidId) :
      isValidId(id)      ? [id]                  : [];

    if (!toDelete.length) {
      return NextResponse.json({ error: "No valid id(s) provided" }, { status: 400 });
    }

    const manifest = await kvGet<Manifest>(KEY);
    const deleteSet = new Set(toDelete);
    manifest.images = manifest.images.filter((img) => !deleteSet.has(img.id));
    await kvSet(KEY, manifest);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to delete";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
