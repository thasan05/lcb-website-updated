import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvSet, kvUpdate } from "@/lib/kv";
import { revalidateContent } from "@/lib/revalidate";
import { isValidId, parseBody, errorResponse, firstIssue } from "@/lib/api-validation";
import { teamCategories } from "@/data/team";

const MAX_BODY_BYTES = 32 * 1024; // 32 KB

const CURRENT_ROSTER_VERSION = "2026-10-19-sync-v2";

const CATEGORY_KEYS: Record<string, string> = {
  central:        "team:central",
  "campus-leads": "team:campus-leads",
  heads:          "team:lcb-heads",
  professionals:  "team:professionals",
  initiatives:    "team:initiatives",
};

// ── Validation ────────────────────────────────────────────────────────────────

function isValidCategoryId(id: unknown): id is string {
  return typeof id === "string" && id in CATEGORY_KEYS;
}

function validateMember(m: unknown): string | null {
  if (typeof m !== "object" || m === null) return "Member must be an object";
  const obj = m as Record<string, unknown>;
  return firstIssue([
    // Every member must have a non-empty string id
    [isValidId(obj.id), "An id is required"],
    // name (or equivalent) must be a non-empty string ≤ 300 chars
    [
      obj.name === undefined || (typeof obj.name === "string" && obj.name.length <= 300),
      "Name must be text of at most 300 characters",
    ],
    // Reject deeply nested objects / excessively long strings (DoS guard)
    [JSON.stringify(m).length <= 8000, "Member record is too large (max 8 KB)"],
  ]);
}

function isValidMember(m: unknown): m is Record<string, unknown> {
  return validateMember(m) === null;
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

    // Ensure Redis is synchronized with the latest bundled roster
    const storedVersion = await kvGet<string | null>("meta:team-roster-version").catch(() => null);
    if (storedVersion !== CURRENT_ROSTER_VERSION) {
      for (const cat of teamCategories) {
        const key = CATEGORY_KEYS[cat.id];
        if (key) await kvSet(key, cat.members);
      }
      await kvSet("meta:team-roster-version", CURRENT_ROSTER_VERSION);
      revalidateContent("team");
    }

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

    // Support forced sync action
    if ((body as { action?: string }).action === "sync-roster") {
      for (const cat of teamCategories) {
        const key = CATEGORY_KEYS[cat.id];
        if (key) await kvSet(key, cat.members);
      }
      await kvSet("meta:team-roster-version", CURRENT_ROSTER_VERSION);
      revalidateContent("team");
      return NextResponse.json({ success: true, synced: true });
    }

    const { categoryId, member } = body as { categoryId?: unknown; member?: unknown };
    if (!isValidCategoryId(categoryId)) {
      return NextResponse.json({ error: "Invalid categoryId" }, { status: 400 });
    }
    if (!isValidMember(member)) {
      return NextResponse.json({ error: validateMember(member)! }, { status: 400 });
    }
    const key = kvKeyFor(categoryId);
    await kvUpdate<unknown[]>(key, (current) => [member, ...(current ?? [])]);
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
      return NextResponse.json({ error: validateMember(member)! }, { status: 400 });
    }
    const key = kvKeyFor(categoryId);
    const memberId = (member as Record<string, unknown>).id as string;
    await kvUpdate<Array<{ id: string }>>(key, (current) =>
      (current ?? []).map((m) => (m.id === memberId ? (member as { id: string }) : m))
    );
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
    await kvUpdate<Array<{ id: string }>>(key, (current) =>
      (current ?? []).filter((m) => m.id !== memberId)
    );
    revalidateContent("team");
    return NextResponse.json({ success: true });
  } catch (e) {
    return errorResponse(e, "Failed to delete member");
  }
}
