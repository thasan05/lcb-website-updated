import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const KEY = "stats:pageviews";

async function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  const { Redis } = await import("@upstash/redis");
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// GET — read current count (no increment)
export async function GET() {
  try {
    const redis = await getRedis();
    if (!redis) return NextResponse.json({ count: null });
    const count = (await redis.get<number>(KEY)) ?? 0;
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: null });
  }
}

// POST — atomic increment, returns new count. Rate-limited to prevent stat inflation.
export async function POST(req: NextRequest) {
  try {
    // 20 increments per IP per hour — covers normal browsing, blocks bulk scripting
    const ip    = getClientIp(req);
    const limit = await rateLimit(`ratelimit:pageview:${ip}`, 20, 60 * 60);
    if (!limit.allowed) return NextResponse.json({ count: null });

    const redis = await getRedis();
    if (!redis) return NextResponse.json({ count: null });
    const count = await redis.incr(KEY);
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: null });
  }
}
