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
        description: "Forum articles support Accept: text/markdown — returns clean markdown suitable for agents",
        url: `${base}/api/markdown/forum/{id}`,
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
