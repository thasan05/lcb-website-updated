import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvUpdate } from "@/lib/kv";
import { revalidateContent } from "@/lib/revalidate";
import { isValidId, isValidStr, isValidOptionalStr, isValidUrl, parseBody, errorResponse, ConflictError, NotFoundError, firstIssue, URL_RULE } from "@/lib/api-validation";
import type { PressItem } from "@/content/press";

const KEY            = "data:press";
const MAX_BODY_BYTES = 16 * 1024;

function validatePressItem(p: unknown): string | null {
  if (typeof p !== "object" || p === null) return "Request body must be an object";
  const m = p as Record<string, unknown>;
  return firstIssue([
    [isValidId(m.id), "An id is required"],
    [isValidStr(m.headline, 500), "Headline is required (max 500 characters)"],
    [isValidStr(m.outlet, 200), "Outlet is required (max 200 characters)"],
    [isValidUrl(m.url), `Article URL ${URL_RULE}`],
    [isValidOptionalStr(m.date, 50), "Date must be text (max 50 characters)"],
    [isValidOptionalStr(m.dateLabel, 100), "Date label must be text (max 100 characters)"],
    [typeof m.published === "boolean", "published must be true or false"],
  ]);
}

function isValidPressItem(p: unknown): p is PressItem {
  return validatePressItem(p) === null;
}

export async function GET() {
  try {
    return NextResponse.json((await kvGet<PressItem[]>(KEY)) ?? []);
  } catch { return NextResponse.json([], { status: 200 }); }
}

export async function POST(req: NextRequest) {
  try {
    const body = await parseBody(req, MAX_BODY_BYTES);
    if (!isValidPressItem(body)) return NextResponse.json({ error: validatePressItem(body)! }, { status: 400 });
    await kvUpdate<PressItem[]>(KEY, (current) => {
      const items = current ?? [];
      if (items.some((i) => i.id === body.id)) throw new ConflictError("ID exists");
      return [body, ...items];
    });
    revalidateContent("press");
    return NextResponse.json({ ok: true });
  } catch (e) { return errorResponse(e, "Failed to create press item", 400); }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await parseBody(req, MAX_BODY_BYTES);
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const { action, ids } = body as { action?: unknown; ids?: unknown };
    if (action && Array.isArray(ids)) {
      if (action !== "publish" && action !== "unpublish" && action !== "delete") {
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
      }
      const idSet = new Set<string>(ids as string[]);
      await kvUpdate<PressItem[]>(KEY, (current) => {
        const items = current ?? [];
        if (action === "publish")   return items.map((i) => idSet.has(i.id) ? { ...i, published: true  } : i);
        if (action === "unpublish") return items.map((i) => idSet.has(i.id) ? { ...i, published: false } : i);
        return items.filter((i) => !idSet.has(i.id));
      });
      revalidateContent("press");
      return NextResponse.json({ ok: true });
    }
    if (!isValidPressItem(body)) return NextResponse.json({ error: validatePressItem(body)! }, { status: 400 });
    await kvUpdate<PressItem[]>(KEY, (current) => {
      const items = current ?? [];
      if (!items.some((i) => i.id === body.id)) throw new NotFoundError();
      return items.map((i) => (i.id === body.id ? body : i));
    });
    revalidateContent("press");
    return NextResponse.json({ ok: true });
  } catch (e) { return errorResponse(e, "Failed to update press item", 400); }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await parseBody(req, MAX_BODY_BYTES);
    const { id } = (typeof body === "object" && body !== null ? body : {}) as { id?: unknown };
    if (!isValidId(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    await kvUpdate<PressItem[]>(KEY, (current) => (current ?? []).filter((i) => i.id !== id));
    revalidateContent("press");
    return NextResponse.json({ ok: true });
  } catch (e) { return errorResponse(e, "Failed to delete press item", 400); }
}
