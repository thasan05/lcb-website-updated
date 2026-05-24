/**
 * KV abstraction layer.
 * - Production (Upstash env vars set): uses Upstash Redis, seeds from bundled JSON on first access.
 * - Development (no env vars): falls back to local JSON files (read + write).
 */

import fs from "fs";
import path from "path";

// File-system fallback mapping: KV key → relative path from cwd
const FILE_MAP: Record<string, string> = {
  "data:news":             "src/content/data/news.json",
  "data:events":           "src/content/data/events.json",
  "data:applications":     "src/content/data/applications.json",
  "data:story-gallery":    "src/content/data/story-gallery.json",
  "data:gallery-manifest": "src/data/gallery/manifest.json",
  "team:central":          "src/data/team/central-team.json",
  "team:campus-leads":     "src/data/team/campus-leads.json",
  "team:lcb-heads":        "src/data/team/lcb-heads.json",
  "team:professionals":    "src/data/team/professionals.json",
  "team:initiatives":      "src/data/team/initiatives.json",
  "team:star-awards":      "src/data/team/star-awards.json",
};

function fileRead<T>(kvKey: string): T {
  const rel = FILE_MAP[kvKey];
  if (!rel) throw new Error(`No file mapping for KV key: ${kvKey}`);
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), rel), "utf-8")) as T;
}

function fileWrite<T>(kvKey: string, data: T): void {
  const rel = FILE_MAP[kvKey];
  if (!rel) throw new Error(`No file mapping for KV key: ${kvKey}`);
  fs.writeFileSync(
    path.join(process.cwd(), rel),
    JSON.stringify(data, null, 2) + "\n",
    "utf-8"
  );
}

let _redis: import("@upstash/redis").Redis | null | undefined = undefined; // undefined = not yet checked

async function getRedis() {
  if (_redis !== undefined) return _redis;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    _redis = null;
    return null;
  }
  const { Redis } = await import("@upstash/redis");
  _redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  return _redis;
}

export async function kvGet<T>(key: string): Promise<T> {
  const redis = await getRedis();

  if (redis) {
    const val = await redis.get<T>(key);
    if (val !== null && val !== undefined) return val;
    // First access — seed from bundled JSON file
    const seeded = fileRead<T>(key);
    await redis.set(key, JSON.stringify(seeded));
    return seeded;
  }

  // Dev fallback
  return fileRead<T>(key);
}

export async function kvSet<T>(key: string, data: T): Promise<void> {
  const redis = await getRedis();

  if (redis) {
    await redis.set(key, JSON.stringify(data));
    return;
  }

  // Dev fallback
  fileWrite(key, data);
}
