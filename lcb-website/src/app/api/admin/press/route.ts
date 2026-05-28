import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";
import type { PressItem } from "@/content/press";

const KEY            = "data:press";
const MAX_BODY_BYTES = 16 * 1024;

function isValidId(v: unknown): v is string {
  return typeof v === "string" && v.length > 0 && v.length < 200;
}
function isValidStr(v: unknown, max = 1000): v is string {
  return typeof v === "string" && v.length > 0 && v.length <= max;
}
function isValidUrl(v: unknown): v is string {
  if (typeof v !== "string") return false;
  try { new URL(v); return true; } catch { return false; }
}
function isValidOptionalStr(v: unknown, max = 200): boolean {
  return v === undefined || (typeof v === "string" && v.length <= max);
}

function isValidPressItem(p: unknown): p is PressItem {
  if (typeof p !== "object" || p === null) return false;
  const m = p as Record<string, unknown>;
  if (!isValidId(m.id))                      return false;
  if (!isValidStr(m.headline, 500))          return false;
  if (!isValidStr(m.outlet, 200))            return false;
  if (!isValidUrl(m.url))                    return false;
  if (!isValidOptionalStr(m.date, 50))       return false;
  if (!isValidOptionalStr(m.dateLabel, 100)) return false;
  if (typeof m.published !== "boolean")      return false;
  return true;
}

async function parseBody(req: NextRequest) {
  const cl = Number(req.headers.get("content-length") ?? 0);
  if (cl > MAX_BODY_BYTES) throw new Error("Body too large");
  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) throw new Error("Body too large");
  return JSON.parse(text);
}

export async function GET() {
  try {
    return NextResponse.json((await kvGet<PressItem[]>(KEY)) ?? []);
  } catch { return NextResponse.json([], { status: 200 }); }
}

export async function POST(req: NextRequest) {
  try {
    const body = await parseBody(req);
    const items = (await kvGet<PressItem[]>(KEY)) ?? [];
    if (!isValidPressItem(body)) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    if (items.some((i) => i.id === body.id)) return NextResponse.json({ error: "ID exists" }, { status: 409 });
    items.unshift(body);
    await kvSet(KEY, items);
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 400 }); }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await parseBody(req);
    if (body.action && Array.isArray(body.ids)) {
      const items = (await kvGet<PressItem[]>(KEY)) ?? [];
      const idSet = new Set<string>(body.ids as string[]);
      let updated: PressItem[];
      if (body.action === "publish")   updated = items.map((i) => idSet.has(i.id) ? { ...i, published: true  } : i);
      else if (body.action === "unpublish") updated = items.map((i) => idSet.has(i.id) ? { ...i, published: false } : i);
      else if (body.action === "delete")    updated = items.filter((i) => !idSet.has(i.id));
      else return NextResponse.json({ error: "Unknown action" }, { status: 400 });
      await kvSet(KEY, updated);
      return NextResponse.json({ ok: true });
    }
    if (!isValidPressItem(body)) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    const items = (await kvGet<PressItem[]>(KEY)) ?? [];
    const idx = items.findIndex((i) => i.id === body.id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    items[idx] = body;
    await kvSet(KEY, items);
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 400 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await parseBody(req);
    if (!isValidId(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    const items = (await kvGet<PressItem[]>(KEY)) ?? [];
    await kvSet(KEY, items.filter((i) => i.id !== id));
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: String(e) }, { status: 400 }); }
}
