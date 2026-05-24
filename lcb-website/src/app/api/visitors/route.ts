import { NextResponse } from "next/server";

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

// POST — atomic increment, returns new count
export async function POST() {
  try {
    const redis = await getRedis();
    if (!redis) return NextResponse.json({ count: null });
    const count = await redis.incr(KEY);
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: null });
  }
}
