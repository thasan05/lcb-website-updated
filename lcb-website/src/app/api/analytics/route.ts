import { NextResponse } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";

// Public endpoint — increments today's page-view counter.
// Called client-side once per browser session.
export async function POST() {
  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const key   = `analytics:views:${today}`;
    const count = await kvGet<number>(key).catch(() => 0);
    await kvSet(key, (count ?? 0) + 1);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
