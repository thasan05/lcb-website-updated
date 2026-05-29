import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";
import type { LorConfig, LorSubmission } from "@/content/lor";

const CONFIG_KEY = "data:lor-config";
const SUBS_KEY   = "data:lor-submissions";
const MAX_BYTES  = 64 * 1024;

async function parseBody(req: NextRequest) {
  const cl = Number(req.headers.get("content-length") ?? 0);
  if (cl > MAX_BYTES) throw new Error("Body too large");
  const text = await req.text();
  if (text.length > MAX_BYTES) throw new Error("Body too large");
  return JSON.parse(text);
}

export async function GET() {
  try {
    const [config, submissions] = await Promise.all([
      kvGet<LorConfig>(CONFIG_KEY),
      kvGet<LorSubmission[]>(SUBS_KEY).catch(() => [] as LorSubmission[]),
    ]);
    return NextResponse.json({ config, submissions: submissions ?? [] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await parseBody(req);

    if (body.type === "config") {
      const config = body.data as LorConfig;
      if (typeof config.open !== "boolean")
        return NextResponse.json({ error: "Invalid config: open must be boolean" }, { status: 400 });
      if (!Array.isArray(config.rules))
        return NextResponse.json({ error: "Invalid config: rules must be array" }, { status: 400 });
      if (!Array.isArray(config.questions))
        return NextResponse.json({ error: "Invalid config: questions must be array" }, { status: 400 });
      await kvSet(CONFIG_KEY, config);
      return NextResponse.json({ ok: true });
    }

    if (body.type === "submission-status") {
      const { id, status, notes } = body as { id: string; status: string; notes?: string };
      if (!id || !["pending", "approved", "rejected"].includes(status))
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
      const subs = (await kvGet<LorSubmission[]>(SUBS_KEY).catch(() => [])) ?? [];
      const idx = subs.findIndex((s) => s.id === id);
      if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
      subs[idx] = {
        ...subs[idx],
        status: status as LorSubmission["status"],
        ...(notes !== undefined ? { notes } : {}),
      };
      await kvSet(SUBS_KEY, subs);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await parseBody(req);
    if (!id || typeof id !== "string")
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const subs = (await kvGet<LorSubmission[]>(SUBS_KEY).catch(() => [])) ?? [];
    await kvSet(SUBS_KEY, subs.filter((s) => s.id !== id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
