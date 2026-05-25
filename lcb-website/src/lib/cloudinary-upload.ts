/**
 * Upload a file directly to Cloudinary from the browser.
 * Fetches a signed credential from /api/admin/upload-signature first,
 * then POSTs the binary straight to Cloudinary's API — no binary ever
 * passes through the Vercel serverless function (avoids 4.5 MB limit).
 */
export async function uploadToCloudinary(file: File): Promise<string> {
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
