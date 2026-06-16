import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";
import { sanitizeHtml } from "@/lib/sanitize";
import type { Event } from "@/content/events";

const KEY            = "data:events";
const MAX_BODY_BYTES = 32 * 1024; // 32 KB — no event should ever be larger

// ── Validation ────────────────────────────────────────────────────────────────

const VALID_FORMATS  = new Set(["Online", "On-Campus", "Hybrid"]);
const VALID_STATUSES = new Set(["upcoming", "past", "live"]);

function isValidId(v: unknown): v is string {
  return typeof v === "string" && v.length > 0 && v.length < 200;
}

function isValidStr(v: unknown, max = 2000): v is string {
  return typeof v === "string" && v.length > 0 && v.length <= max;
}

function isValidUrl(v: unknown): v is string {
  if (typeof v !== "string") return false;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || v.startsWith("/");
  } catch { return false; }
}

function isValidEvent(e: unknown): e is Event {
  if (typeof e !== "object" || e === null) return false;
  const m = e as Record<string, unknown>;
  if (!isValidId(m.id))                        return false;
  if (!isValidStr(m.title, 300))               return false;
  if (!isValidStr(m.description, 5000))        return false;
  if (!isValidStr(m.date, 50))                 return false;
  if (!isValidStr(m.dateLabel, 100))           return false;
  if (!isValidStr(m.location, 300))            return false;
  if (!VALID_FORMATS.has(m.format as string))  return false;
  if (!VALID_STATUSES.has(m.status as string)) return false;
  if (!isValidUrl(m.image))                    return false;
  // Optional fields
  if (m.href    !== undefined && !isValidUrl(m.href))            return false;
  if (m.partner !== undefined && typeof m.partner !== "string")  return false;
  if (m.published !== undefined && typeof m.published !== "boolean") return false;
  if (m.speaker !== undefined) {
    if (typeof m.speaker !== "object" || m.speaker === null)  return false;
    const s = m.speaker as Record<string, unknown>;
    if (typeof s.name !== "string" || typeof s.role !== "string") return false;
  }
  return true;
}

async function parseBody(request: NextRequest) {
  const cl = Number(request.headers.get("content-length") ?? 0);
  if (cl > MAX_BODY_BYTES) throw new Error("Request body too large");
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) throw new Error("Request body too large");
  return JSON.parse(text) as unknown;
}

// ── Handlers ──────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    return NextResponse.json(await kvGet<Event[]>(KEY));
  } catch {
    return NextResponse.json({ error: "Failed to read events" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request);
    if (!isValidEvent(body)) {
      return NextResponse.json({ error: "Invalid event data" }, { status: 400 });
    }
    body.description = sanitizeHtml(body.description);
    const events = await kvGet<Event[]>(KEY);
    events.unshift(body);
    await kvSet(KEY, events);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create event";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await parseBody(request);
    if (!isValidEvent(body)) {
      return NextResponse.json({ error: "Invalid event data" }, { status: 400 });
    }
    body.description = sanitizeHtml(body.description);
    const events = (await kvGet<Event[]>(KEY)).map((e) =>
      e.id === body.id ? body : e
    );
    await kvSet(KEY, events);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to update event";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await parseBody(request);
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const { id } = body as { id?: unknown };
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const events = (await kvGet<Event[]>(KEY)).filter((e) => e.id !== id);
    await kvSet(KEY, events);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to delete event";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
