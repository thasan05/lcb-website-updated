import { siteConfig } from "@/content/site";

/**
 * Strips HTML tags and decodes common HTML entities into clean readable text.
 */
export function cleanHtml(html?: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Formats a broader, richer description for OpenGraph, Twitter Cards,
 * and direct social sharing without cutting off words mid-sentence.
 */
export function formatBroadDescription(rawTextOrHtml?: string, maxLen = 340): string {
  const clean = cleanHtml(rawTextOrHtml);
  if (!clean) return siteConfig.description;
  if (clean.length <= maxLen) return clean;

  // Find the last sentence end (period, exclamation, question mark) before maxLen
  const lastSentenceEnd = Math.max(
    clean.lastIndexOf(". ", maxLen),
    clean.lastIndexOf("! ", maxLen),
    clean.lastIndexOf("? ", maxLen)
  );

  if (lastSentenceEnd > maxLen * 0.55) {
    return clean.slice(0, lastSentenceEnd + 1).trim();
  }

  // Fallback: cut cleanly at the last space before maxLen
  const lastSpace = clean.lastIndexOf(" ", maxLen - 3);
  if (lastSpace > 0) {
    return `${clean.slice(0, lastSpace).trim()}...`;
  }

  return `${clean.slice(0, maxLen - 3)}...`;
}

/**
 * Resolves the active production or preview domain base URL.
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "")}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return siteConfig.url.replace(/\/$/, "");
}

/**
 * Returns the canonical URL for a specific news item.
 */
export function getNewsCanonicalUrl(id: string): string {
  return `${getBaseUrl()}/news/${id}`;
}

/**
 * Converts a relative or absolute image path to an authoritative absolute URL.
 */
export function toAbsoluteUrl(url?: string, customBase?: string): string {
  const base = customBase || getBaseUrl();
  if (!url) return `${base}/opengraph-image`;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * Prepares rich formatted message text for WhatsApp, Telegram, or direct sharing.
 */
export function formatShareMessage({
  title,
  category,
  dateLabel,
  summary,
  url,
}: {
  title: string;
  category?: string;
  dateLabel?: string;
  summary?: string;
  url: string;
}): string {
  const broadDesc = formatBroadDescription(summary, 280);
  const metaLine = [category ? `🏷️ ${category}` : "", dateLabel ? `🗓️ ${dateLabel}` : ""]
    .filter(Boolean)
    .join(" • ");

  return [
    url,
    "",
    `*${title}*`,
    metaLine,
    "",
    broadDesc,
  ]
    .filter((line, idx, arr) => !(line === "" && arr[idx - 1] === ""))
    .join("\n");
}

export const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  Announcement: {
    bg: "rgba(59, 130, 246, 0.22)",
    border: "rgba(59, 130, 246, 0.55)",
    text: "#93c5fd",
    dot: "#3b82f6",
  },
  Event: {
    bg: "rgba(168, 85, 247, 0.22)",
    border: "rgba(168, 85, 247, 0.55)",
    text: "#d8b4fe",
    dot: "#a855f7",
  },
  Milestone: {
    bg: "rgba(245, 158, 11, 0.22)",
    border: "rgba(245, 158, 11, 0.55)",
    text: "#fde68a",
    dot: "#f59e0b",
  },
  Partnership: {
    bg: "rgba(16, 185, 129, 0.22)",
    border: "rgba(16, 185, 129, 0.55)",
    text: "#6ee7b7",
    dot: "#10b981",
  },
  Spotlight: {
    bg: "rgba(236, 72, 153, 0.22)",
    border: "rgba(236, 72, 153, 0.55)",
    text: "#fbcfe8",
    dot: "#ec4899",
  },
};
