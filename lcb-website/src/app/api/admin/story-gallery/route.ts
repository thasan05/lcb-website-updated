import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";

const KEY = "data:story-gallery";

type GalleryItem = {
  id: string;
  src: string;
  srcs?: string[];
  alt: string;
  caption?: string;
  span?: string;
};

export async function GET() {
  try {
    return NextResponse.json(await kvGet<GalleryItem[]>(KEY));
  } catch {
    return NextResponse.json({ error: "Read failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updated: GalleryItem = await request.json();
    const items = (await kvGet<GalleryItem[]>(KEY)).map((item) =>
      item.id === updated.id ? updated : item
    );
    await kvSet(KEY, items);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Write failed" }, { status: 500 });
  }
}
