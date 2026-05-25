import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

// Public endpoint — increments today's page-view counter.
// Rate-limited: 5 calls per IP per hour (prevents inflation).
export async function POST(request: NextRequest) {
  try {
    const ip    = getClientIp(request);
    const limit = await rateLimit(`ratelimit:analytics:${ip}`, 5, 60 * 60);
    if (!limit.allowed) return rateLimitResponse(limit);

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const key   = `analytics:views:${today}`;
    const count = await kvGet<number>(key).catch(() => 0);
    await kvSet(key, (count ?? 0) + 1);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
