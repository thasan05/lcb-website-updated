import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";

const KEY = "data:gallery-manifest";

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

export async function GET() {
  try {
    return NextResponse.json(await kvGet<Manifest>(KEY));
  } catch {
    return NextResponse.json({ error: "Failed to read manifest" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const image: GalleryImage = await request.json();
    const manifest = await kvGet<Manifest>(KEY);
    manifest.images.unshift(image);
    await kvSet(KEY, manifest);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to add image" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const manifest = await kvGet<Manifest>(KEY);
    if (body.type === "categories") {
      manifest.categories = body.categories;
    } else {
      manifest.images = manifest.images.map((img) =>
        img.id === body.id ? body : img
      );
    }
    await kvSet(KEY, manifest);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const manifest = await kvGet<Manifest>(KEY);
    manifest.images = manifest.images.filter((img) => img.id !== id);
    await kvSet(KEY, manifest);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
