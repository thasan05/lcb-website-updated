#!/usr/bin/env node
/**
 * One-time retroactive sanitization of stored content.
 *
 * Content written before the June 2026 security audit was saved without
 * sanitizeHtml(). Admin routes sanitize on write now, and SafeHtml sanitizes on
 * render, so visitors are already protected — this cleans the data at rest.
 *
 * Usage:
 *   node scripts/sanitize-stored-content.mjs           # dry run — reports only
 *   node scripts/sanitize-stored-content.mjs --apply   # writes changes back
 *
 * Reads UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN from the environment
 * (or .env.local). Without them it falls back to the local JSON files, matching
 * src/lib/kv.ts behaviour.
 *
 * Safety: only ever rewrites the HTML fields listed in TARGETS. Never deletes
 * keys, never removes records, never touches any other field. Idempotent —
 * running it twice changes nothing the second time.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const APPLY = process.argv.includes("--apply");

// KV key → { file: local fallback path, fields: HTML fields to sanitize }
const TARGETS = [
  { key: "data:articles", file: "src/content/data/articles.json", fields: ["content"] },
  { key: "data:events",   file: "src/content/data/events.json",   fields: ["description"] },
  { key: "data:news",     file: "src/content/data/news.json",     fields: ["summary"] },
];

// ── Mirror of src/lib/sanitize.ts ────────────────────────────────────────────
// Kept in sync manually: this script is plain ESM and cannot import the TS module.

const DANGEROUS_TAGS =
  /<\s*\/?\s*(script|iframe|object|embed|form|input|button|textarea|select|style|link|meta|base|applet|svg|math|template|slot|canvas|video|audio|picture|source|track|portal|fencedframe)\b[^>]*>/gi;
const EVENT_ATTRS = /\s+on[a-z]{1,30}\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi;
const DANGEROUS_PROTOCOLS =
  /(?:href|src|action|formaction|xlink:href)\s*=\s*(?:"(?:javascript|vbscript|data):[^"]*"|'(?:javascript|vbscript|data):[^']*'|(?:javascript|vbscript|data):[^\s>]*)/gi;
const HTML_COMMENTS = /<!--[\s\S]*?-->/g;

function sanitizeHtml(html) {
  return html
    .replace(HTML_COMMENTS, "")
    .replace(DANGEROUS_TAGS, "")
    .replace(EVENT_ATTRS, "")
    .replace(DANGEROUS_PROTOCOLS, "");
}

// ── Env loading ──────────────────────────────────────────────────────────────

function loadEnvLocal() {
  const p = path.join(ROOT, ".env.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf-8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

// ── Storage adapters ─────────────────────────────────────────────────────────

async function makeStore() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({ url, token });
    return {
      label: "Upstash Redis",
      async read(t) {
        const v = await redis.get(t.key);
        if (v === null || v === undefined) return null;
        return typeof v === "string" ? JSON.parse(v) : v;
      },
      async write(t, data) {
        await redis.set(t.key, JSON.stringify(data));
      },
    };
  }

  return {
    label: "local JSON files",
    async read(t) {
      const p = path.join(ROOT, t.file);
      if (!fs.existsSync(p)) return null;
      return JSON.parse(fs.readFileSync(p, "utf-8"));
    },
    async write(t, data) {
      fs.writeFileSync(path.join(ROOT, t.file), JSON.stringify(data, null, 2) + "\n", "utf-8");
    },
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────

function preview(s, n = 120) {
  const flat = s.replace(/\s+/g, " ").trim();
  return flat.length > n ? flat.slice(0, n) + "…" : flat;
}

async function main() {
  loadEnvLocal();
  const store = await makeStore();

  console.log(`\nSource: ${store.label}`);
  console.log(APPLY ? "Mode:   APPLY (changes will be written)\n" : "Mode:   DRY RUN (no changes written)\n");

  let totalChanged = 0;

  for (const target of TARGETS) {
    let records;
    try {
      records = await store.read(target);
    } catch (err) {
      console.log(`${target.key}: READ FAILED — ${err.message} (skipped)\n`);
      continue;
    }

    if (!Array.isArray(records)) {
      console.log(`${target.key}: no data (skipped)\n`);
      continue;
    }

    const changes = [];
    const updated = records.map((rec) => {
      if (!rec || typeof rec !== "object") return rec;
      const next = { ...rec };
      for (const field of target.fields) {
        if (typeof next[field] !== "string") continue;
        const clean = sanitizeHtml(next[field]);
        if (clean !== next[field]) {
          changes.push({ id: next.id ?? "(no id)", field, before: next[field], after: clean });
          next[field] = clean;
        }
      }
      return next;
    });

    if (changes.length === 0) {
      console.log(`${target.key}: ${records.length} record(s), already clean ✓\n`);
      continue;
    }

    totalChanged += changes.length;
    console.log(`${target.key}: ${changes.length} field(s) need sanitizing (of ${records.length} records)`);
    for (const c of changes) {
      console.log(`  · ${c.id} → ${c.field}`);
      console.log(`      before: ${preview(c.before)}`);
      console.log(`      after:  ${preview(c.after)}`);
    }

    if (APPLY) {
      await store.write(target, updated);
      console.log(`  ✓ written back\n`);
    } else {
      console.log(`  (dry run — not written)\n`);
    }
  }

  if (totalChanged === 0) {
    console.log("All stored content is already sanitized. Nothing to do.\n");
  } else if (APPLY) {
    console.log(`Done. ${totalChanged} field(s) sanitized.\n`);
  } else {
    console.log(`${totalChanged} field(s) would be changed. Re-run with --apply to write.\n`);
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
