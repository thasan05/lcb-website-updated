import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/token";

const FORUM_HOST = "forum.linkedincommunitybangladesh.com";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? "";

  // ── Forum subdomain → serve /forum page ───────────────────────────────────
  if (host === FORUM_HOST) {
    // Only rewrite the root; let /forum itself and assets pass through
    if (pathname === "/" || pathname === "") {
      const url = request.nextUrl.clone();
      url.pathname = "/forum";
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // ── Public admin routes — never block ──────────────────────────────────────
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/admin/auth")
  ) {
    return NextResponse.next();
  }

  // ── Protected admin routes ─────────────────────────────────────────────────
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const token  = request.cookies.get("lcb_admin_session")?.value;
    const secret = process.env.SESSION_SECRET;

    const valid =
      token && secret ? await verifySessionToken(token, secret) : false;

    if (!valid) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run on all paths so the forum subdomain check fires at root too
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.svg).*)"],
};
