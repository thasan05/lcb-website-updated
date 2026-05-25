import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Returns a short-lived Cloudinary signed-upload credential.
 * The client uses this to POST directly to Cloudinary, bypassing
 * Vercel's 4.5 MB serverless body limit entirely.
 */
export async function GET() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Cloudinary not configured" }, { status: 500 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder    = "lcb-website";

  // Signature = SHA-1 of sorted params string + secret
  // Parameters must be sorted alphabetically: folder=…&timestamp=…
  const sigStr    = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(sigStr).digest("hex");

  return NextResponse.json({ timestamp, signature, apiKey, cloudName, folder });
}
