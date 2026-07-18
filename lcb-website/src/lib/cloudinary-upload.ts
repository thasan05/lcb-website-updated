/**
 * Cloudinary's free plan rejects images over 10 MB. DSLR photos routinely
 * exceed that, so anything big is downscaled to 2560px and re-encoded as
 * JPEG in the browser before upload. Web display never needs more.
 */
const CLOUDINARY_LIMIT = 9.5 * 1024 * 1024; // safety margin under the 10 MB cap
const COMPRESS_THRESHOLD = 4 * 1024 * 1024;
const MAX_EDGE = 2560;

async function compressImage(file: File): Promise<File> {
  if (file.type === "image/gif") return file; // canvas would kill animation
  if (file.size <= COMPRESS_THRESHOLD) return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  for (const quality of [0.85, 0.75, 0.65]) {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (blob && blob.size <= CLOUDINARY_LIMIT) {
      return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", {
        type: "image/jpeg",
      });
    }
  }
  return file; // couldn't get under the cap — let Cloudinary report it
}

/**
 * Upload a file directly to Cloudinary from the browser.
 * Fetches a signed credential from /api/admin/upload-signature first,
 * then POSTs the binary straight to Cloudinary's API — no binary ever
 * passes through the Vercel serverless function (avoids 4.5 MB limit).
 * Oversized images are compressed client-side first (see above).
 */
export async function uploadToCloudinary(rawFile: File): Promise<string> {
  const file = await compressImage(rawFile);
  const sigRes = await fetch("/api/admin/upload-signature");
  if (!sigRes.ok) throw new Error("Could not get upload signature");
  const { timestamp, signature, apiKey, cloudName, folder } =
    (await sigRes.json()) as {
      timestamp: number;
      signature: string;
      apiKey: string;
      cloudName: string;
      folder: string;
    };

  const fd = new FormData();
  fd.append("file", file);
  fd.append("timestamp", String(timestamp));
  fd.append("signature", signature);
  fd.append("api_key", apiKey);
  fd.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: fd }
  );
  const data = await res.json();
  if (!data.secure_url) {
    throw new Error(data.error?.message ?? "Cloudinary upload failed");
  }
  return data.secure_url as string;
}
