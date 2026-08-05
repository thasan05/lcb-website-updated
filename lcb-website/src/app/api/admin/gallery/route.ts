import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvUpdate } from "@/lib/kv";
import { revalidateContent } from "@/lib/revalidate";
import { isValidId, isValidUrl, parseBody, errorResponse, ValidationError } from "@/lib/api-validation";

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

// ── Handlers ──────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    return NextResponse.json(await kvGet<Manifest>(KEY));
  } catch (err) {
    return errorResponse(err, "Failed to read manifest");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request, MAX_BODY_BYTES);
    if (!isValidImage(body)) {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    }
    await kvUpdate<Manifest>(KEY, (manifest) => ({
      ...manifest,
      images: [body, ...manifest.images],
    }));
    revalidateContent("gallery");
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err, "Failed to add image");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body    = await parseBody(request, MAX_BODY_BYTES);
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const payload = body as Record<string, unknown>;

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
      await kvUpdate<Manifest>(KEY, (m) => ({ ...m, categories: cats as GalleryCategory[] }));

    } else if (payload.type === "reorder") {
      if (!Array.isArray(payload.images)) {
        return NextResponse.json({ error: "Invalid images array" }, { status: 400 });
      }
      const incoming = payload.images as unknown[];
      if (!incoming.every((img) => isValidImage(img))) {
        return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
      }
      // The id-set and length checks compare against stored data, so they run
      // inside the mutator — against the same value the write commits against.
      await kvUpdate<Manifest>(KEY, (m) => {
        const existingIds = new Set(m.images.map((i) => i.id));
        if (!incoming.every((img) => existingIds.has((img as GalleryImage).id))) {
          throw new ValidationError("Reorder contains unknown image IDs");
        }
        if (incoming.length !== m.images.length) {
          throw new ValidationError("Reorder length mismatch");
        }
        return { ...m, images: incoming as GalleryImage[] };
      });

    } else {
      // Single image update
      if (!isValidImage(payload)) {
        return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
      }
      await kvUpdate<Manifest>(KEY, (m) => ({
        ...m,
        images: m.images.map((img) => (img.id === payload.id ? payload : img)),
      }));
    }

    revalidateContent("gallery");
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err, "Failed to update gallery manifest");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await parseBody(request, MAX_BODY_BYTES);
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const { id, ids } = body as { id?: unknown; ids?: unknown };
    const toDelete: string[] =
      Array.isArray(ids) ? ids.filter((v): v is string => isValidId(v)) :
      isValidId(id)      ? [id]                  : [];

    if (!toDelete.length) {
      return NextResponse.json({ error: "No valid id(s) provided" }, { status: 400 });
    }

    const deleteSet = new Set(toDelete);
    await kvUpdate<Manifest>(KEY, (manifest) => ({
      ...manifest,
      images: manifest.images.filter((img) => !deleteSet.has(img.id)),
    }));
    revalidateContent("gallery");
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err, "Failed to delete image(s)");
  }
}
