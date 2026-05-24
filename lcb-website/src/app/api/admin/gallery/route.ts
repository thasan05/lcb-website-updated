import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

const MANIFEST_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "gallery",
  "manifest.json"
);

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

function readManifest(): Manifest {
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
}

function writeManifest(data: Manifest) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

// GET — full manifest
export async function GET() {
  try {
    return NextResponse.json(readManifest());
  } catch {
    return NextResponse.json({ error: "Failed to read manifest" }, { status: 500 });
  }
}

// POST — add image
export async function POST(request: NextRequest) {
  try {
    const image: GalleryImage = await request.json();
    const manifest = readManifest();
    manifest.images.unshift(image);
    writeManifest(manifest);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to add image" }, { status: 500 });
  }
}

// PUT — update single image OR update categories
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const manifest = readManifest();

    if (body.type === "categories") {
      manifest.categories = body.categories;
    } else {
      // update single image
      manifest.images = manifest.images.map((img) =>
        img.id === body.id ? body : img
      );
    }

    writeManifest(manifest);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// DELETE — remove image by id
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const manifest = readManifest();
    manifest.images = manifest.images.filter((img) => img.id !== id);
    writeManifest(manifest);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
