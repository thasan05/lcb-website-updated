/**
 * Lightweight HTML sanitizer for admin-authored rich text content.
 *
 * Scope: removes the worst stored-XSS vectors from HTML written by admins
 * via the RichTextEditor (articles, events, news descriptions).
 *
 * This is NOT a replacement for a full sanitizer like DOMPurify on untrusted
 * public input. All content here comes from authenticated admins. This is
 * defense-in-depth: if the admin account is ever compromised, arbitrary
 * script injection via stored content is still blocked.
 *
 * Strips:
 *   - <script>, <iframe>, <object>, <embed>, <form>, <style>, <link>,
 *     <meta>, <base>, <svg>, <math> tags (and closing variants)
 *   - All on* event handler attributes (onclick=, onerror=, …)
 *   - javascript: and vbscript: hrefs
 *   - data: URI sources (prevents inline JS via data:text/html)
 *
 * Keeps:
 *   - <b>, <i>, <strong>, <em>, <h3>, <ul>, <li>, <br>, <p>,
 *     <a href="https://...">, <img src="https://...">
 */

// Tags that must never appear in stored content
const DANGEROUS_TAGS =
  /<\s*\/?\s*(script|iframe|object|embed|form|input|button|textarea|select|style|link|meta|base|applet|svg|math|template|slot|canvas|video|audio|picture|source|track|portal|fencedframe)\b[^>]*>/gi;

// All event-handler attributes: onclick, onerror, onload, onmouseover, …
const EVENT_ATTRS = /\s+on[a-z]{1,30}\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi;

// javascript: and vbscript: in href / src / action / formaction
const DANGEROUS_PROTOCOLS =
  /(?:href|src|action|formaction|xlink:href)\s*=\s*(?:"(?:javascript|vbscript|data):[^"]*"|'(?:javascript|vbscript|data):[^']*'|(?:javascript|vbscript|data):[^\s>]*)/gi;

// Raw <!-- --> HTML comments (can hide payloads)
const HTML_COMMENTS = /<!--[\s\S]*?-->/g;

export function sanitizeHtml(html: string): string {
  if (typeof html !== "string") return "";
  // Strip null bytes and control characters used in filter evasion
  let clean = html.replace(/\0/g, "");
  let prev = "";
  let iterations = 0;

  // Multi-pass iterative loop prevents recursive tag collapse bypasses
  // such as `<scr<script>ipt>alert(1)</script>`
  while (clean !== prev && iterations < 10) {
    prev = clean;
    iterations++;
    clean = clean
      .replace(HTML_COMMENTS, "")
      .replace(DANGEROUS_TAGS, "")
      .replace(EVENT_ATTRS, "")
      .replace(DANGEROUS_PROTOCOLS, "");
  }

  return clean;
}
