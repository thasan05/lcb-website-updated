import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";
import { revalidateContent } from "@/lib/revalidate";
import { isValidStr, isValidOptionalStr, parseBody, errorResponse } from "@/lib/api-validation";
import type { StatsConfig } from "@/content/stats";

const KEY            = "data:stats";
const MAX_BODY_BYTES = 8 * 1024;

// The homepage renders exactly four stat blocks in a 2x2 / 1x4 grid, so the
// count is fixed rather than free-form — the layout has no sensible rendering
// for three or five.
const REQUIRED_ITEMS = 4;

function fieldError(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 });
}

/**
 * Validates and returns null, or returns a 400 naming the offending field —
 * admins get told exactly what was rejected rather than a generic failure.
 */
function validate(v: unknown): NextResponse | null {
  if (typeof v !== "object" || v === null) return fieldError("Invalid body");
  const c = v as Record<string, unknown>;

  if (!isValidStr(c.updatedLabel, 60)) {
    return fieldError('"Updated" label is required (max 60 characters).');
  }
  if (!Array.isArray(c.items) || c.items.length !== REQUIRED_ITEMS) {
    return fieldError(`Exactly ${REQUIRED_ITEMS} stats are required.`);
  }

  for (let i = 0; i < c.items.length; i++) {
    const raw = c.items[i];
    const n = i + 1;
    if (typeof raw !== "object" || raw === null) return fieldError(`Stat ${n} is malformed.`);
    const s = raw as Record<string, unknown>;

    if (!isValidStr(s.value, 12))       return fieldError(`Stat ${n}: value is required (max 12 characters).`);
    if (!isValidOptionalStr(s.suffix, 8)) return fieldError(`Stat ${n}: suffix must be 8 characters or fewer.`);
    if (!isValidStr(s.label, 60))       return fieldError(`Stat ${n}: label is required (max 60 characters).`);
    if (!isValidStr(s.description, 240)) return fieldError(`Stat ${n}: description is required (max 240 characters).`);
  }
  return null;
}

export async function GET() {
  try {
    return NextResponse.json(await kvGet<StatsConfig>(KEY));
  } catch (err) {
    return errorResponse(err, "Failed to read stats");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await parseBody(request, MAX_BODY_BYTES);
    const invalid = validate(body);
    if (invalid) return invalid;

    // A full-document overwrite of a fixed-shape config, submitted from a single
    // form — last write wins is the intended semantic here, as with the
    // applications and LOR config endpoints. No read-modify-write to race.
    await kvSet(KEY, body as StatsConfig);
    revalidateContent("stats");
    return NextResponse.json({ success: true });
  } catch (err) {
    return errorResponse(err, "Failed to update stats");
  }
}
