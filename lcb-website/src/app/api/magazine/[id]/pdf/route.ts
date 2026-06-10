import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { kvGet } from "@/lib/kv";
import type { Magazine } from "@/content/magazines";

export const dynamic = "force-dynamic";

/**
 * Extract public_id (without extension) and format from a Cloudinary raw URL.
 * e.g. https://res.cloudinary.com/{cloud}/raw/upload/v1234/lcb-website/file.pdf
 *   → { publicIdNoExt: "lcb-website/file", format: "pdf" }
 */
function parsePublicId(url: string): { publicIdNoExt: string; format: string } | null {
  const m = url.match(/\/raw\/upload\/(?:v\d+\/)?(.+)$/);
  if (!m) return null;
  const full = m[1]; // "lcb-website/hl12irqja0krgusyw8pr.pdf"
  const extMatch = full.match(/^(.+?)\.([^./]+)$/);
  if (!extMatch) return { publicIdNoExt: full, format: "" };
  return { publicIdNoExt: extMatch[1], format: extMatch[2] };
}

/**
 * Streams the magazine PDF inline.
 *
 * Cloudinary Strict Delivery blocks unsigned CDN URLs (401).
 * We use private_download_url() which authenticates via API key + HMAC
 * in the query string — this goes through the Cloudinary API endpoint,
 * not the CDN, so Strict Delivery settings are irrelevant.
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

    if (cloudName && apiKey && apiSecret) {
      const parts = parsePublicId(mag.fileUrl);
      if (parts) {
        cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
        // private_download_url generates an authenticated API endpoint URL
        // (api.cloudinary.com/v1_1/.../raw/download?api_key=...&signature=...)
        // which bypasses Strict Delivery because it uses API credentials.
        fetchUrl = cloudinary.utils.private_download_url(
          parts.publicIdNoExt,
          parts.format,
          {
            resource_type: "raw",
            expires_at: Math.floor(Date.now() / 1000) + 7200,
            attachment: false,
          }
        );
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
