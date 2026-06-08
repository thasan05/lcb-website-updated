"use client";

/**
 * WebMCP — exposes LCB site tools to AI agents via the browser
 * https://webmachinelearning.github.io/webmcp/
 * https://developer.chrome.com/blog/webmcp-epp
 *
 * Gracefully no-ops in browsers that don't support navigator.modelContext.
 */

import { useEffect } from "react";

type ToolInput = Record<string, unknown>;

interface MCPTool {
  name:        string;
  description: string;
  inputSchema: object;
  execute:     (input: ToolInput) => Promise<unknown>;
}

declare global {
  interface Navigator {
    modelContext?: {
      provideContext: (ctx: { tools: MCPTool[] }) => void;
    };
  }
}

export function WebMCP() {
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    if (typeof navigator.modelContext?.provideContext !== "function") return;

    navigator.modelContext.provideContext({
      tools: [
        {
          name: "get_forum_article",
          description:
            "Fetch a published LCB Forum article as Markdown by its ID. " +
            "Returns the full article text, author info, tags, and a source link.",
          inputSchema: {
            type: "object",
            properties: {
              id: { type: "string", description: "Article slug/ID (e.g. 'my-article-slug')" },
            },
            required: ["id"],
          },
          execute: async ({ id }: ToolInput) => {
            const res = await fetch(`/api/markdown/forum/${id as string}`);
            if (!res.ok) return { error: `Article '${id}' not found`, status: res.status };
            return { markdown: await res.text(), contentType: "text/markdown" };
          },
        },
        {
          name: "get_visitor_count",
          description: "Return the total LCB site visitor count.",
          inputSchema: { type: "object", properties: {} },
          execute: async () => {
            const res = await fetch("/api/visitors");
            return res.json();
          },
        },
        {
          name: "get_api_catalog",
          description:
            "Return the LCB RFC 9727 API catalog (application/linkset+json) " +
            "listing all public HTTP endpoints.",
          inputSchema: { type: "object", properties: {} },
          execute: async () => {
            const res = await fetch("/.well-known/api-catalog");
            return res.json();
          },
        },
        {
          name: "get_agent_skills",
          description: "Return the LCB agent skills discovery index.",
          inputSchema: { type: "object", properties: {} },
          execute: async () => {
            const res = await fetch("/.well-known/agent-skills/index.json");
            return res.json();
          },
        },
      ],
    });
  }, []);

  return null;
}
