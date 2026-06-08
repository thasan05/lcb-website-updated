/**
 * Agent Skills Discovery index — /.well-known/agent-skills/index.json
 * https://github.com/cloudflare/agent-skills-discovery-rfc
 */
import { NextResponse } from "next/server";
import { siteConfig } from "@/content/site";

export const dynamic = "force-static";

export function GET() {
  const base = siteConfig.url;

  const index = {
    $schema: "https://agentskills.io/schema/index/v0.2.0.json",
    skills: [
      {
        name: "api-catalog",
        type: "api-catalog",
        description: "RFC 9727 API catalog — lists all public LCB HTTP endpoints",
        url: `${base}/.well-known/api-catalog`,
      },
      {
        name: "content-signals",
        type: "content-signals",
        description: "LCB content usage preferences for AI systems (ai-train=no, search=yes, ai-input=no)",
        url: `${base}/robots.txt`,
      },
      {
        name: "markdown-negotiation",
        type: "markdown-negotiation",
        description: "Accept: text/markdown on / or /forum/[id] returns clean Markdown",
        url: `${base}/api/markdown/home`,
      },
      {
        name: "oauth-protected-resource",
        type: "oauth-protected-resource",
        description: "RFC 9728 resource metadata — public endpoints require no auth",
        url: `${base}/.well-known/oauth-protected-resource`,
      },
      {
        name: "auth-md",
        type: "auth-md",
        description: "Authentication guide for AI agents — public endpoints, rate limits, contact",
        url: `${base}/auth.md`,
      },
    ],
  };

  return NextResponse.json(index, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
