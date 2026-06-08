import { NextResponse } from "next/server";
import { siteConfig } from "@/content/site";

export const dynamic = "force-static";

export function GET() {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin/",
    "",
    `Sitemap: ${siteConfig.url}/sitemap.xml`,
    "",
    "# Content Signals — https://contentsignals.org/",
    "Content-Signal: ai-train=no, search=yes, ai-input=no",
  ].join("\n");

  return new NextResponse(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
