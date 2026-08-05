import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvUpdate } from "@/lib/kv";
import { revalidateContent } from "@/lib/revalidate";
import { sanitizeHtml } from "@/lib/sanitize";
import { isValidId, isValidStr, isValidUrl, parseBody, errorResponse, firstIssue, URL_RULE } from "@/lib/api-validation";
import type { Event } from "@/content/events";

const KEY            = "data:events";
const MAX_BODY_BYTES = 32 * 1024; // 32 KB — no event should ever be larger

// ── Validation ────────────────────────────────────────────────────────────────

const VALID_FORMATS  = new Set(["Online", "On-Campus", "Hybrid"]);
const VALID_STATUSES = new Set(["upcoming", "past", "live"]);

function validateEvent(e: unknown): string | null {
  if (typeof e !== "object" || e === null) return "Request body must be an object";
  const m = e as Record<string, unknown>;

  const speakerIssue = ((): string | null => {
    if (m.speaker === undefined) return null;
    if (typeof m.speaker !== "object" || m.speaker === null) return "Speaker must be an object";
    const s = m.speaker as Record<string, unknown>;
    if (typeof s.name !== "string") return "Speaker name is required";
    if (typeof s.role !== "string") return "Speaker role is required";
    return null;
  })();

  return firstIssue([
    [isValidId(m.id), "An id is required"],
    [isValidStr(m.title, 300), "Title is required (max 300 characters)"],
    [isValidStr(m.description, 5000), "Description is required (max 5000 characters)"],
    [isValidStr(m.date, 50), "Date is required"],
    [isValidStr(m.dateLabel, 100), "Date label is required (max 100 characters)"],
    [isValidStr(m.location, 300), "Location is required (max 300 characters)"],
    [VALID_FORMATS.has(m.format as string), `Format must be one of: ${[...VALID_FORMATS].join(", ")}`],
    [VALID_STATUSES.has(m.status as string), `Status must be one of: ${[...VALID_STATUSES].join(", ")}`],
    [isValidUrl(m.image), `Image ${URL_RULE}`],
    [m.href === undefined || isValidUrl(m.href), `Registration link ${URL_RULE} — leave it empty if unused`],
    [m.partner === undefined || typeof m.partner === "string", "Partner must be text"],
    [m.published === undefined || typeof m.published === "boolean", "published must be true or false"],
    [speakerIssue === null, speakerIssue ?? ""],
  ]);
}

function isValidEvent(e: unknown): e is Event {
  return validateEvent(e) === null;
}

// ── Handlers ──────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    return NextResponse.json(await kvGet<Event[]>(KEY));
  } catch (err) {
    return errorResponse(err, "Failed to read events");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request, MAX_BODY_BYTES);
    if (!isValidEvent(body)) {
      return NextResponse.json({ error: validateEvent(body)! }, { status: 400 });
    }
    body.description = sanitizeHtml(body.description);
    await kvUpdate<Event[]>(KEY, (current) => [body, ...(current ?? [])]);
    revalidateContent("events");
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err, "Failed to create event");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await parseBody(request, MAX_BODY_BYTES);
    if (!isValidEvent(body)) {
      return NextResponse.json({ error: validateEvent(body)! }, { status: 400 });
    }
    body.description = sanitizeHtml(body.description);
    await kvUpdate<Event[]>(KEY, (current) =>
      (current ?? []).map((e) => (e.id === body.id ? body : e))
    );
    revalidateContent("events");
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err, "Failed to update event");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await parseBody(request, MAX_BODY_BYTES);
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const { id } = body as { id?: unknown };
    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    await kvUpdate<Event[]>(KEY, (current) => (current ?? []).filter((e) => e.id !== id));
    revalidateContent("events");
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err, "Failed to delete event");
  }
}
