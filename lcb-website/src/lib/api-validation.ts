import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { KvContentionError } from "@/lib/kv";

// Shared primitives for admin API route validation + request parsing.
// Domain-specific shape validators (isValidArticle, isValidEvent, etc.) stay
// in their own route files — only the generic building blocks live here.

export function isValidId(v: unknown, max = 200): v is string {
  return typeof v === "string" && v.length > 0 && v.length < max;
}

export function isValidStr(v: unknown, max = 2000): v is string {
  return typeof v === "string" && v.length > 0 && v.length <= max;
}

export function isValidOptionalStr(v: unknown, max = 2000): boolean {
  return v === undefined || (typeof v === "string" && v.length <= max);
}

// Must be https:, or a site-relative path starting with a single "/". `new URL()`
// throws on relative input before a scheme check can run, so the relative case has
// to be checked first rather than inside the try block. "//host" is rejected —
// browsers resolve protocol-relative URLs to an offsite origin.
export function isValidUrl(v: unknown): v is string {
  if (typeof v !== "string") return false;
  if (v.startsWith("//")) return false;
  if (v.startsWith("/")) return true;
  try { return new URL(v).protocol === "https:"; } catch { return false; }
}

export function isValidOptionalUrl(v: unknown): boolean {
  return v === undefined || v === "" || isValidUrl(v);
}

export async function parseBody(request: NextRequest, maxBytes: number): Promise<unknown> {
  const cl = Number(request.headers.get("content-length") ?? 0);
  if (cl > maxBytes) throw new Error("Request body too large");
  const text = await request.text();
  if (text.length > maxBytes) throw new Error("Request body too large");
  return JSON.parse(text) as unknown;
}

// Messages safe to show an admin verbatim (deliberately thrown, no internal
// detail). Anything else — Redis/Cloudinary failures, unexpected exceptions —
// is logged server-side only and replaced with a generic message.
const SAFE_ERROR_MESSAGES = new Set(["Request body too large"]);

// Thrown from inside a kvUpdate mutator to reject the write and map to an HTTP
// status. Checking inside the mutator (rather than before it) means the check
// runs against the same data the write commits against, so a concurrent write
// can't slip a duplicate id past it.
export class ConflictError extends Error {
  constructor(message = "Already exists") {
    super(message);
    this.name = "ConflictError";
  }
}

export class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

// For validation that depends on the stored data (and so must run inside the
// mutator, against the value the write actually commits against).
export class ValidationError extends Error {
  constructor(message = "Invalid data") {
    super(message);
    this.name = "ValidationError";
  }
}

export function errorResponse(err: unknown, fallback: string, status = 500) {
  if (err instanceof ConflictError) {
    return NextResponse.json({ error: err.message }, { status: 409 });
  }
  if (err instanceof NotFoundError) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
  if (err instanceof ValidationError) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
  if (err instanceof KvContentionError) {
    console.error(fallback, err);
    return NextResponse.json(
      { error: "Busy — another change landed first. Please retry." },
      { status: 503 }
    );
  }
  console.error(fallback, err);
  const msg = err instanceof Error && SAFE_ERROR_MESSAGES.has(err.message) ? err.message : fallback;
  return NextResponse.json({ error: msg }, { status });
}
