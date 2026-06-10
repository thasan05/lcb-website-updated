import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { kvGet } from "@/lib/kv";
import type { Magazine } from "@/content/magazines";

export const dynamic = "force-dynamic";

/**
 * Parse version and public_id from a Cloudinary raw delivery URL.
 * e.g. https://res.cloudinary.com/{cloud}/raw/upload/v1234567/lcb-website/file.pdf
 */
function parseCloudinaryUrl(url: string): { publicId: string; version: number } | null {
  const m = url.match(/\/raw\/upload\/v(\d+)\/(.+)$/);
  if (!m) return null;
  return { version: parseInt(m[1], 10), publicId: m[2] };
}

/**
 * Streams the magazine PDF with Content-Disposition: inline so Chrome
 * renders it inside an <iframe> instead of triggering a download.
 *
 * Cloudinary "Strict Delivery" blocks unsigned raw URLs (HTTP 401).
 * We generate a signed delivery URL server-side before fetching.
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

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey    = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    let fetchUrl = mag.fileUrl;

    // Generate signed URL to satisfy Cloudinary Strict Delivery
    if (cloudName && apiKey && apiSecret) {
      const parts = parseCloudinaryUrl(mag.fileUrl);
      if (parts) {
        cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
        fetchUrl = cloudinary.url(parts.publicId, {
          resource_type: "raw",
          sign_url: true,
          version: parts.version,
          secure: true,
        });
      }
    }

    const upstream = await fetch(fetchUrl);
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
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
