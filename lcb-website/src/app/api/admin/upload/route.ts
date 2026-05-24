import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, and GIF allowed" },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // ── Cloudinary (production) ─────────────────────────────────────────────
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      const { v2: cloudinary } = await import("cloudinary");
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key:    process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      const dataURI = `data:${file.type};base64,${buffer.toString("base64")}`;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "lcb-website",
        resource_type: "image",
      });
      return NextResponse.json({ url: result.secure_url });
    }

    // ── Local fallback (dev only) ───────────────────────────────────────────
    const fs   = await import("fs");
    const path = await import("path");
    const ext      = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const safeName = `upload-${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "gallery", "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(path.join(uploadDir, safeName), buffer);
    return NextResponse.json({ url: `/gallery/uploads/${safeName}` });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
