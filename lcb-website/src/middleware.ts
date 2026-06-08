import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/token";

const FORUM_HOST = "forum.linkedincommunitybangladesh.com";
const SHOUT_HOST = "shout.linkedincommunitybangladesh.com";
const CARD_HOST  = "card.linkedincommunitybangladesh.com";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? "";

  // ── Forum subdomain → serve /forum page ───────────────────────────────────
  if (host === FORUM_HOST) {
    const accept = request.headers.get("accept") ?? "";
    const url    = request.nextUrl.clone();

    // Markdown-for-Agents: agents requesting text/markdown get the markdown API
    if (accept.includes("text/markdown") && pathname !== "/" && pathname !== "") {
      const articleId = pathname.replace(/^\//, "");
      url.pathname = `/api/markdown/forum/${articleId}`;
      return NextResponse.rewrite(url);
    }

    url.pathname = pathname === "/" || pathname === "" ? "/forum" : `/forum${pathname}`;
    return NextResponse.rewrite(url);
  }

  // ── Shout subdomain → serve /shout page ───────────────────────────────────
  if (host === SHOUT_HOST) {
    const url = request.nextUrl.clone();
    url.pathname = "/shout";
    return NextResponse.rewrite(url);
  }

  // ── Card subdomain → serve /card page ─────────────────────────────────────
  if (host === CARD_HOST) {
    const url = request.nextUrl.clone();
    url.pathname = "/card";
    return NextResponse.rewrite(url);
  }

  // ── Markdown-for-Agents on main domain /forum/[id] ────────────────────────
  const accept = request.headers.get("accept") ?? "";
  if (accept.includes("text/markdown")) {
    const m = pathname.match(/^\/forum\/([^/]+)$/);
    if (m) {
      const url = request.nextUrl.clone();
      url.pathname = `/api/markdown/forum/${m[1]}`;
      return NextResponse.rewrite(url);
    }
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
