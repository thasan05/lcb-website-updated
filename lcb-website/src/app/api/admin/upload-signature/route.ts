import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";

/**
 * Returns a short-lived Cloudinary signed-upload credential.
 * Pass ?type=raw to get credentials for PDF/raw file uploads.
 * The client uses this to POST directly to Cloudinary, bypassing
 * Vercel's 4.5 MB serverless body limit entirely.
 */
export async function GET(request: NextRequest) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Cloudinary not configured" }, { status: 500 });
  }

  // resource_type is a URL parameter (not a signed param), so signature is identical
  // for both image and raw uploads. We just tell the client which endpoint to use.
  const type         = request.nextUrl.searchParams.get("type");
  const resourceType = type === "raw" ? "raw" : "image";

  const timestamp = Math.round(Date.now() / 1000);
  const folder    = "lcb-website";

  const sigStr    = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(sigStr).digest("hex");

  return NextResponse.json({ timestamp, signature, apiKey, cloudName, folder, resourceType });
}
