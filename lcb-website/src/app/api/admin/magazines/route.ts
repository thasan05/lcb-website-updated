import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvUpdate } from "@/lib/kv";
import { revalidateContent } from "@/lib/revalidate";
import { isValidId, isValidStr, parseBody, errorResponse, ConflictError, NotFoundError } from "@/lib/api-validation";
import type { Magazine } from "@/content/magazines";

const KEY            = "data:magazines";
const MAX_BODY_BYTES = 16 * 1024;

// Magazine files/covers come from Cloudinary — https: only, no relative-path
// allowance (unlike the general shared isValidUrl).
function isValidUrl(v: unknown): v is string {
  if (typeof v !== "string") return false;
  try { return new URL(v).protocol === "https:"; } catch { return false; }
}

function isValidMagazine(m: unknown): m is Magazine {
  if (typeof m !== "object" || m === null) return false;
  const r = m as Record<string, unknown>;
  if (!isValidId(r.id))              return false;
  if (!isValidStr(r.title, 300))     return false;
  if (!isValidUrl(r.fileUrl))        return false;
  if (r.coverUrl !== undefined && r.coverUrl !== "" && !isValidUrl(r.coverUrl)) return false;
  if (r.fileSize !== undefined && typeof r.fileSize !== "number") return false;
  if (!isValidStr(r.uploadedAt, 100)) return false;
  if (typeof r.published !== "boolean") return false;
  return true;
}

export async function GET() {
  try {
    const magazines = await kvGet<Magazine[]>(KEY);
    return NextResponse.json(magazines ?? []);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request, MAX_BODY_BYTES);
    if (!isValidMagazine(body)) {
      return NextResponse.json({ error: "Invalid magazine data" }, { status: 400 });
    }
    await kvUpdate<Magazine[]>(KEY, (current) => {
      const magazines = current ?? [];
      if (magazines.some((m) => m.id === body.id)) {
        throw new ConflictError("ID already exists — use a different title");
      }
      return [body, ...magazines];
    });
    revalidateContent("magazines");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e, "Failed to create magazine", 400);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await parseBody(request, MAX_BODY_BYTES);
    if (!isValidMagazine(body)) {
      return NextResponse.json({ error: "Invalid magazine data" }, { status: 400 });
    }
    await kvUpdate<Magazine[]>(KEY, (current) => {
      const magazines = current ?? [];
      if (!magazines.some((m) => m.id === body.id)) throw new NotFoundError("Magazine not found");
      return magazines.map((m) => (m.id === body.id ? body : m));
    });
    revalidateContent("magazines");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e, "Failed to update magazine", 400);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await parseBody(request, MAX_BODY_BYTES);
    const { id } = (typeof body === "object" && body !== null ? body : {}) as { id?: unknown };
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    await kvUpdate<Magazine[]>(KEY, (current) => (current ?? []).filter((m) => m.id !== id));
    revalidateContent("magazines");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e, "Failed to delete magazine", 400);
  }
}
