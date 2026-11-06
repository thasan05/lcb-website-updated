import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet } from "@/lib/kv";
import type { Magazine } from "@/content/magazines";

export const dynamic = "force-dynamic";

/**
 * Fetches the magazine PDF from Cloudinary and re-serves it with
 * Content-Disposition: inline so Chrome renders it in an <iframe>
 * rather than triggering a download.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const magazines = await kvGet<Magazine[]>("data:magazines");
    const mag = magazines?.find((m) => m.id === id && m.published);
    if (!mag) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Validate target URL against SSRF attacks
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(mag.fileUrl);
    } catch {
      return NextResponse.json({ error: "Invalid PDF URL" }, { status: 400 });
    }

    if (parsedUrl.protocol !== "https:") {
      return NextResponse.json({ error: "Insecure protocol" }, { status: 400 });
    }

    // Disallow loopback, private RFC-1918, link-local, and cloud metadata addresses
    const host = parsedUrl.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host === "169.254.169.254" ||
      host.startsWith("10.") ||
      host.startsWith("192.168.") ||
      host.startsWith("172.16.") ||
      host.endsWith(".internal") ||
      host.endsWith(".local")
    ) {
      return NextResponse.json({ error: "Forbidden upstream host" }, { status: 403 });
    }

    const upstream = await fetch(parsedUrl.toString());
    if (!upstream.ok) {
      return NextResponse.json(
        { error: "PDF unavailable", status: upstream.status },
        { status: 502 }
      );
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
