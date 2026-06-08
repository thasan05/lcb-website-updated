/**
 * RFC 9727 API Catalog — /.well-known/api-catalog
 * Returns application/linkset+json listing LCB's public HTTP API surface.
 * https://www.rfc-editor.org/rfc/rfc9727
 */
import { NextResponse } from "next/server";
import { siteConfig } from "@/content/site";

export const dynamic = "force-static";

export function GET() {
  const base  = siteConfig.url;
  const forum = "https://forum.linkedincommunitybangladesh.com";

  const catalog = {
    linkset: [
      {
        // Visitor count (public read)
        anchor: `${base}/api/visitors`,
        "service-doc": [{ href: `${base}`, type: "text/html" }],
        describedby: [
          { href: `${base}/.well-known/api-catalog`, type: "application/linkset+json" },
        ],
      },
      {
        // LOR (Letter of Recommendation) submission
        anchor: `${base}/api/lor/submit`,
        "service-doc": [{ href: `${base}/#lor`, type: "text/html" }],
      },
      {
        // Forum — published articles
        anchor: `${forum}/`,
        "service-doc": [{ href: `${forum}/`, type: "text/html" }],
        "alternate": [{ href: `${base}/api/markdown/forum/{id}`, type: "text/markdown" }],
      },
    ],
  };

  return NextResponse.json(catalog, {
    headers: {
      "Content-Type": "application/linkset+json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
