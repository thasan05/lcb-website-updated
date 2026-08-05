import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvIncr } from "@/lib/kv";
import { rateLimit, rateLimitResponse, getClientIp } from "@/lib/rate-limit";

// Public endpoint — increments today's page-view counter.
// Rate-limited: 5 calls per IP per hour (prevents inflation).
export async function POST(request: NextRequest) {
  try {
    const ip    = getClientIp(request);
    const limit = await rateLimit(`ratelimit:analytics:${ip}`, 5, 60 * 60);
    if (!limit.allowed) return rateLimitResponse(limit);

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    // Atomic — a read-then-write counter drops concurrent page views.
    await kvIncr(`analytics:views:${today}`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
