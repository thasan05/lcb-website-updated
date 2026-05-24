import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "src", "content", "data", "story-gallery.json");

type GalleryItem = {
  id: string;
  src: string;
  srcs?: string[];
  alt: string;
  caption?: string;
  span?: string;
};

function read(): GalleryItem[] {
  return JSON.parse(fs.readFileSync(FILE, "utf-8"));
}

function write(data: GalleryItem[]) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

export async function GET() {
  try {
    return NextResponse.json(read());
  } catch {
    return NextResponse.json({ error: "Read failed" }, { status: 500 });
  }
}

// PUT — update a single slot by id
export async function PUT(request: NextRequest) {
  try {
    const updated: GalleryItem = await request.json();
    const items = read().map((item) => (item.id === updated.id ? updated : item));
    write(items);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Write failed" }, { status: 500 });
  }
}
