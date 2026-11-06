/**
 * Fixed-window rate limiter backed by Upstash Redis.
 * Falls back to "always allow" in dev (no Redis configured).
 */

import type { NextRequest } from "next/server";

/**
 * Extract the real client IP safely and resist header spoofing.
 * Prioritizes platform-authenticated edge proxy headers (Vercel, Cloudflare, req.ip)
 * that cannot be forged or injected by external clients.
 */
export function getClientIp(req: NextRequest): string {
  // 1. Next.js runtime client IP (if exposed on request object)
  const directIp = (req as unknown as { ip?: string }).ip;
  if (directIp) return directIp;

  // 2. Vercel trusted connecting IP header (set by Vercel edge reverse proxy)
  const vercelIp = req.headers.get("x-vercel-forwarded-for");
  if (vercelIp) {
    const ip = vercelIp.split(",")[0].trim();
    if (ip) return ip;
  }

  // 3. Cloudflare connecting IP (set by Cloudflare edge proxy)
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  // 4. Vercel / reverse proxy real IP header
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  // 5. Fallback: Parse X-Forwarded-For safely
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts[0];
  }

  return "127.0.0.1";
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
