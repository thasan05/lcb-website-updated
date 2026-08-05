import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";
import { revalidateContent } from "@/lib/revalidate";
import { isValidUrl, parseBody, errorResponse } from "@/lib/api-validation";
import type { ApplicationsConfig } from "@/lib/admin";

const KEY            = "data:applications";
const MAX_BODY_BYTES  = 4 * 1024;

// Empty string is a valid "no form configured yet" state alongside a real URL.
function isValidFormUrl(v: unknown): v is string {
  return v === "" || isValidUrl(v);
}

function isValidSection(v: unknown): v is { open: boolean; formUrl: string } {
  if (typeof v !== "object" || v === null) return false;
  const s = v as Record<string, unknown>;
  return typeof s.open === "boolean" && isValidFormUrl(s.formUrl);
}

function isValidConfig(v: unknown): v is ApplicationsConfig {
  if (typeof v !== "object" || v === null) return false;
  const c = v as Record<string, unknown>;
  return isValidSection(c.campusLeads) && isValidSection(c.centralTeam);
}

export async function GET() {
  try {
    return NextResponse.json(await kvGet<ApplicationsConfig>(KEY));
  } catch (e) {
    return errorResponse(e, "Failed to read applications config");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request, MAX_BODY_BYTES);
    if (!isValidConfig(body)) {
      return NextResponse.json({ error: "Invalid applications config" }, { status: 400 });
    }
    await kvSet(KEY, body);
    revalidateContent("applications");
    return NextResponse.json({ success: true });
  } catch (e) {
    return errorResponse(e, "Failed to update applications config");
  }
}
