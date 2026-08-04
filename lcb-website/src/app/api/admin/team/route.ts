import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";
import { revalidateContent } from "@/lib/revalidate";
import { isValidId, parseBody, errorResponse } from "@/lib/api-validation";

const MAX_BODY_BYTES = 32 * 1024; // 32 KB

const CATEGORY_KEYS: Record<string, string> = {
  central:        "team:central",
  "campus-leads": "team:campus-leads",
  heads:          "team:lcb-heads",
  professionals:  "team:professionals",
  initiatives:    "team:initiatives",
  "star-awards":  "team:star-awards",
};

// ── Validation ────────────────────────────────────────────────────────────────

function isValidCategoryId(id: unknown): id is string {
  return typeof id === "string" && id in CATEGORY_KEYS;
}

function isValidMember(m: unknown): m is Record<string, unknown> {
  if (typeof m !== "object" || m === null) return false;
  const obj = m as Record<string, unknown>;
  // Every member must have a non-empty string id
  if (!isValidId(obj.id)) return false;
  // name (or equivalent) must be a non-empty string ≤ 300 chars
  if (obj.name !== undefined && (typeof obj.name !== "string" || obj.name.length > 300)) return false;
  // Reject deeply nested objects / excessively long strings (DoS guard)
  const json = JSON.stringify(m);
  if (json.length > 8000) return false;
  return true;
}

function kvKeyFor(categoryId: string): string {
  const key = CATEGORY_KEYS[categoryId];
  if (!key) throw new Error(`Unknown category: ${categoryId}`);
  return key;
}

// ── Handlers ──────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category");

    if (categoryId) {
      if (!isValidCategoryId(categoryId)) {
        return NextResponse.json({ error: "Unknown category" }, { status: 400 });
      }
      return NextResponse.json(await kvGet(kvKeyFor(categoryId)));
    }

    const all: Record<string, unknown> = {};
    for (const [id, key] of Object.entries(CATEGORY_KEYS)) {
      all[id] = await kvGet(key);
    }
    return NextResponse.json(all);
  } catch (e) {
    return errorResponse(e, "Failed to read team data");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request, MAX_BODY_BYTES);
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const { categoryId, member } = body as { categoryId?: unknown; member?: unknown };
    if (!isValidCategoryId(categoryId)) {
      return NextResponse.json({ error: "Invalid categoryId" }, { status: 400 });
    }
    if (!isValidMember(member)) {
      return NextResponse.json({ error: "Invalid member data" }, { status: 400 });
    }
    const key = kvKeyFor(categoryId);
    const members = await kvGet<unknown[]>(key);
    members.unshift(member);
    await kvSet(key, members);
    revalidateContent("team");
    return NextResponse.json({ success: true });
  } catch (e) {
    return errorResponse(e, "Failed to add member");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await parseBody(request, MAX_BODY_BYTES);
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const { categoryId, member } = body as { categoryId?: unknown; member?: unknown };
    if (!isValidCategoryId(categoryId)) {
      return NextResponse.json({ error: "Invalid categoryId" }, { status: 400 });
    }
    if (!isValidMember(member)) {
      return NextResponse.json({ error: "Invalid member data" }, { status: 400 });
    }
    const key = kvKeyFor(categoryId);
    const memberId = (member as Record<string, unknown>).id as string;
    const members = (await kvGet<Array<{ id: string }>>(key)).map((m) =>
      m.id === memberId ? member : m
    );
    await kvSet(key, members);
    revalidateContent("team");
    return NextResponse.json({ success: true });
  } catch (e) {
    return errorResponse(e, "Failed to update member");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await parseBody(request, MAX_BODY_BYTES);
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const { categoryId, memberId } = body as { categoryId?: unknown; memberId?: unknown };
    if (!isValidCategoryId(categoryId)) {
      return NextResponse.json({ error: "Invalid categoryId" }, { status: 400 });
    }
    if (!isValidId(memberId)) {
      return NextResponse.json({ error: "Invalid memberId" }, { status: 400 });
    }
    const key = kvKeyFor(categoryId);
    const members = (await kvGet<Array<{ id: string }>>(key)).filter(
      (m) => m.id !== memberId
    );
    await kvSet(key, members);
    revalidateContent("team");
    return NextResponse.json({ success: true });
  } catch (e) {
    return errorResponse(e, "Failed to delete member");
  }
}
