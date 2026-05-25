import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSessionToken } from "@/lib/token";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

const COOKIE_NAME    = "lcb_admin_session";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "strict" as const, // strict > lax for admin
  path:     "/",
  maxAge:   60 * 60 * 24 * 7, // 7 days
};

// ── POST /api/admin/auth — Login ──────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // 1. Rate limit: 5 attempts per IP per 15 minutes
  const ip     = getClientIp(request);
  const limit  = await rateLimit(`ratelimit:login:${ip}`, 5, 15 * 60);
  if (!limit.allowed) return rateLimitResponse(limit);

  // 2. Parse + validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as Record<string, unknown>).password !== "string"
  ) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { password } = body as { password: string };
  const adminPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!adminPassword || !sessionSecret) {
    console.error("[auth] ADMIN_PASSWORD or SESSION_SECRET not configured");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  // 3. Constant-time password comparison (prevents timing attacks)
  const enc      = new TextEncoder();
  const pwBytes  = enc.encode(password.slice(0, 256)); // cap at 256 chars
  const refBytes = enc.encode(adminPassword);

  // Pad to same length before comparing
  const maxLen = Math.max(pwBytes.length, refBytes.length);
  const a = new Uint8Array(maxLen);
  const b = new Uint8Array(maxLen);
  a.set(pwBytes);
  b.set(refBytes);

  let diff = 0;
  for (let i = 0; i < maxLen; i++) diff |= a[i] ^ b[i];
  // Also diff based on length mismatch
  diff |= pwBytes.length ^ refBytes.length;

  if (diff !== 0) {
    // Add consistent delay to frustrate timing-based enumeration
    await new Promise((r) => setTimeout(r, 200 + Math.random() * 100));
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  // 4. Create signed session token (never stores the password)
  const token    = await createSessionToken(sessionSecret);
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
  return response;
}

// ── DELETE /api/admin/auth — Logout ──────────────────────────────────────────

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
