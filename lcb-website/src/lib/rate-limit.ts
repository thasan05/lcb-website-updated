/**
 * Fixed-window rate limiter backed by Upstash Redis.
 * Falls back to "always allow" in dev (no Redis configured).
 */

import type { NextRequest } from "next/server";

/**
 * Extract the real client IP.
 * Prefers CF-Connecting-IP (set by Cloudflare, not spoofable by clients)
 * over x-forwarded-for (which can be injected if Cloudflare is bypassed).
 */
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number; // unix seconds
}

async function getRedis() {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) return null;
  const { Redis } = await import("@upstash/redis");
  return new Redis({
    url:   process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

/**
 * @param identifier  Unique key, e.g. `ratelimit:login:1.2.3.4`
 * @param max         Max requests allowed in the window
 * @param windowSec   Window size in seconds
 */
export async function rateLimit(
  identifier: string,
  max: number,
  windowSec: number
): Promise<RateLimitResult> {
  const redis = await getRedis();

  // Dev / no Redis → always allow (don't block local testing)
  if (!redis) {
    return { allowed: true, limit: max, remaining: max, resetAt: 0 };
  }

  const nowSec      = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(nowSec / windowSec) * windowSec;
  const key         = `${identifier}:${windowStart}`;

  // Atomic increment + set expiry in one pipeline
  const pipe  = redis.pipeline();
  pipe.incr(key);
  pipe.expire(key, windowSec + 5); // +5s buffer
  const [count] = await pipe.exec<[number, number]>();

  const n = count ?? 1;
  return {
    allowed:   n <= max,
    limit:     max,
    remaining: Math.max(0, max - n),
    resetAt:   windowStart + windowSec,
  };
}

/** Convenience: returns a 429 Response with Retry-After header when rate-limited. */
export function rateLimitResponse(result: RateLimitResult): Response {
  const retryAfter = Math.max(0, result.resetAt - Math.floor(Date.now() / 1000));
  return new Response(
    JSON.stringify({ error: "Too many requests. Please try again later." }),
    {
      status:  429,
      headers: {
        "Content-Type":  "application/json",
        "Retry-After":   String(retryAfter),
        "X-RateLimit-Limit":     String(result.limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset":     String(result.resetAt),
      },
    }
  );
}
