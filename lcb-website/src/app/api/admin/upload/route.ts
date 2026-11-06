import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png":  "png",
  "image/webp": "webp",
  "image/gif":  "gif",
};
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function isValidImageMagicBytes(buffer: Buffer, type: string): boolean {
  if (buffer.length < 12) return false;
  // JPEG: FF D8 FF
  if (type === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  // PNG: 89 50 4E 47
  if (type === "image/png") {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }
  // GIF: GIF8
  if (type === "image/gif") {
    return (
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38
    );
  }
  // WebP: RIFF....WEBP
  if (type === "image/webp") {
    const riff = buffer.toString("ascii", 0, 4);
    const webp = buffer.toString("ascii", 8, 12);
    return riff === "RIFF" && webp === "WEBP";
  }
  return false;
}

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

    // Magic bytes verification — prevents polyglots and MIME-type spoofing
    if (!isValidImageMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        { error: "Invalid image content: signature does not match declared type" },
        { status: 400 }
      );
    }

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
    const crypto = await import("crypto");
    // Strict extension mapping from validated MIME type — never user-supplied filename
    const ext      = EXT_MAP[file.type] ?? "jpg";
    const safeName = `upload-${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "gallery", "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(path.join(uploadDir, safeName), buffer);
    return NextResponse.json({ url: `/gallery/uploads/${safeName}` });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
