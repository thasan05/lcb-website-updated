/**
 * OAuth Protected Resource Metadata — /.well-known/oauth-protected-resource
 * RFC 9728 — https://www.rfc-editor.org/rfc/rfc9728
 *
 * LCB's public HTTP API requires no OAuth tokens.
 * Empty authorization_servers signals that public endpoints are open.
 * Admin endpoints use session-cookie auth (not intended for agent access).
 */
import { NextResponse } from "next/server";
import { siteConfig } from "@/content/site";

export const dynamic = "force-static";

export function GET() {
  const base = siteConfig.url;

  const metadata = {
    resource: base,
    resource_name: siteConfig.name,
    resource_documentation: `${base}/.well-known/api-catalog`,
    // No OAuth authorization servers — public endpoints are unauthenticated
    authorization_servers: [],
    scopes_supported: [],
    bearer_methods_supported: [],
    // All public APIs use JSON; Markdown negotiation available on forum articles
    response_types_supported: ["application/json", "text/markdown"],
  };

  return NextResponse.json(metadata, {
    headers: {
      "Content-Type":              "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
