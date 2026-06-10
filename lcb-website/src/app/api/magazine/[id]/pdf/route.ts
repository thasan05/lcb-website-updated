import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet } from "@/lib/kv";
import type { Magazine } from "@/content/magazines";

export const dynamic = "force-dynamic";

/**
 * Streams a magazine PDF from Cloudinary with Content-Disposition: inline
 * so browsers render it inside an <iframe> instead of downloading it.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const magazines = await kvGet<Magazine[]>("data:magazines");
    const mag = magazines?.find((m) => m.id === id && m.published);
    if (!mag) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const upstream = await fetch(mag.fileUrl);
    if (!upstream.ok) {
      return NextResponse.json({ error: "PDF unavailable" }, { status: 502 });
    }

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
