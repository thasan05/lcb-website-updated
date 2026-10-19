/**
 * KV abstraction layer.
 * - Production (Upstash env vars set): uses Upstash Redis, seeds from bundled JSON on first access.
 * - Development (no env vars): falls back to local JSON files (read + write).
 */

import fs from "fs";
import path from "path";

// File-system fallback mapping: KV key → relative path from cwd
const FILE_MAP: Record<string, string> = {
  "data:articles":          "src/content/data/articles.json",
  "data:press":             "src/content/data/press.json",
  "data:news":              "src/content/data/news.json",
  "data:events":            "src/content/data/events.json",
  "data:applications":      "src/content/data/applications.json",
  "data:stats":             "src/content/data/stats.json",
  "data:story-gallery":     "src/content/data/story-gallery.json",
  "data:gallery-manifest":  "src/data/gallery/manifest.json",
  "data:lor-config":        "src/content/data/lor-config.json",
  "data:lor-submissions":   "src/content/data/lor-submissions.json",
  "data:magazines":         "src/content/data/magazines.json",
  "team:central":          "src/data/team/central-team.json",
  "team:campus-leads":     "src/data/team/campus-leads.json",
  "team:lcb-heads":        "src/data/team/lcb-heads.json",
  "team:professionals":    "src/data/team/professionals.json",
  "team:initiatives":      "src/data/team/initiatives.json",
};

// This fs fallback only runs in local dev (no Upstash env vars set) — never in
// production, where kvGet/kvSet always go through Redis. The key → path lookup
// is dynamic, so it's opted out of Next's build-time file tracing (turbopackIgnore)
// to avoid bundling the whole project into the serverless output.
function fileRead<T>(kvKey: string): T {
  const rel = FILE_MAP[kvKey];
  if (!rel) return null as T;
  const fullPath = path.join(/*turbopackIgnore: true*/ process.cwd(), rel);
  if (!fs.existsSync(fullPath)) return null as T;
  return JSON.parse(fs.readFileSync(fullPath, "utf-8")) as T;
}

function fileWrite<T>(kvKey: string, data: T): void {
  const rel = FILE_MAP[kvKey];
  if (!rel) return;
  fs.writeFileSync(
    path.join(/*turbopackIgnore: true*/ process.cwd(), rel),
    JSON.stringify(data, null, 2) + "\n",
    "utf-8"
  );
}

let _redis: import("@upstash/redis").Redis | null | undefined = undefined; // undefined = not yet checked

export async function getRedis() {
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
    // First access — seed from bundled JSON file.
    //
    // `nx` is essential: between the GET above and this write, another request
    // may already have written real data (a kvUpdate commit, or another seed).
    // An unconditional SET here would silently overwrite it — a reader could
    // destroy a committed write. With nx the seed is a no-op once the key
    // exists, so it can only ever populate a genuinely empty key.
    const seeded = fileRead<T>(key);
    await redis.set(key, JSON.stringify(seeded), { nx: true });
    // Re-read rather than returning `seeded`: if the nx write was skipped,
    // someone else's value is authoritative and `seeded` is already stale.
    const after = await redis.get<T>(key);
    return after !== null && after !== undefined ? after : seeded;
  }

  // Dev fallback
  return fileRead<T>(key);
}

export async function kvSet<T>(key: string, data: T): Promise<void> {
  const redis = await getRedis();

  if (redis) {
    // Bump the version so any in-flight kvUpdate CAS on this key fails and
    // retries against the value written here, rather than clobbering it.
    await redis.eval(BLIND_SET_SCRIPT, [key, versionKey(key)], [JSON.stringify(data)]);
    return;
  }

  // Dev fallback
  fileWrite(key, data);
}

// ── Atomic read-modify-write ─────────────────────────────────────────────────
//
// kvGet + mutate + kvSet is a lost-update race: two concurrent writers both read
// the old document, and whichever writes second silently discards the other's
// change. Over Upstash REST every read is a network round trip, so that window is
// wide enough to hit in normal use (two admins saving at once; two people
// submitting the LOR form in the same moment).
//
// Fix: optimistic concurrency against a companion integer version key. We read
// the version, mutate in JS, then commit via a Lua script that only writes if the
// version is still what we read — the whole check-and-write executing atomically
// server-side. A losing writer re-reads and retries, so no update is lost.
//
// Comparing an integer version (not the JSON document) matters: the Upstash client
// auto-deserializes GET responses, so we never see the exact stored string and
// could not reliably compare documents. It also keeps all JSON handling in JS,
// so this does not depend on `cjson` being present in Upstash's Lua sandbox.
//
// Versions are created on first write — existing keys need no migration.

const versionKey = (key: string) => `${key}:v`;

// Commit only if the version is unchanged. An absent version is matched by "".
const CAS_SCRIPT = `
local cur = redis.call('GET', KEYS[2])
if cur == ARGV[1] or (cur == false and ARGV[1] == '') then
  redis.call('SET', KEYS[1], ARGV[2])
  redis.call('INCR', KEYS[2])
  return 1
end
return 0
`;

// Unconditional write that still bumps the version, so concurrent CAS attempts
// notice the change and retry instead of overwriting it.
const BLIND_SET_SCRIPT = `
redis.call('SET', KEYS[1], ARGV[1])
redis.call('INCR', KEYS[2])
return 1
`;

// 10-way simultaneous contention is fully absorbed by 8 attempts in simulation
// (see the backoff below); 10 leaves headroom without unbounded retrying.
const MAX_ATTEMPTS = 10;

export class KvContentionError extends Error {
  constructor(key: string, attempts: number) {
    super(`kvUpdate: "${key}" contended after ${attempts} attempts`);
    this.name = "KvContentionError";
  }
}

// Serializes concurrent updates to the same key in the dev file fallback, where
// there is no Redis to arbitrate. One process only, so a promise chain is enough.
const fileLocks = new Map<string, Promise<unknown>>();

function fileUpdate<T>(key: string, mutate: (current: T) => T): Promise<T> {
  const run = (fileLocks.get(key) ?? Promise.resolve()).then(() => {
    const next = mutate(fileRead<T>(key));
    fileWrite(key, next);
    return next;
  });
  // Swallow rejection on the chain itself so one failure can't poison the queue.
  fileLocks.set(key, run.catch(() => undefined));
  return run;
}

/**
 * Atomically increment a counter and return the new value.
 *
 * Counters must not go through kvGet/kvSet — read-then-write loses increments
 * under concurrency, which is exactly what a counter is used for. INCR does the
 * whole operation server-side.
 *
 * Returns null in dev with no Redis: these keys are metrics with no file mapping,
 * and losing them locally is harmless.
 */
export async function kvIncr(key: string): Promise<number | null> {
  const redis = await getRedis();
  if (!redis) return null;
  return redis.incr(key);
}

/**
 * Atomically read, mutate and write a KV document.
 *
 * `mutate` receives the current value and returns the new one. It may be called
 * more than once (each retry re-reads fresh data), so it must be pure — derive
 * the result from its argument and don't rely on values captured beforehand.
 *
 * Throws {@link KvContentionError} if the write keeps losing; callers should let
 * that surface as a 5xx so the client can retry, rather than reporting success.
 */
export async function kvUpdate<T>(key: string, mutate: (current: T) => T): Promise<T> {
  const redis = await getRedis();
  if (!redis) return fileUpdate(key, mutate);

  const vkey = versionKey(key);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    // Version first, then the document: if a write lands between the two reads
    // we see a newer document against an older version, so the CAS fails and we
    // retry. The reverse order could pair a stale document with a current
    // version and commit a lost update.
    const version = await redis.get<unknown>(vkey);
    const expected = version === null || version === undefined ? "" : String(version);

    // Deliberately not kvGet: that seeds an absent key by writing to it, and a
    // write outside the CAS protocol can clobber a commit. Fall back to the
    // bundled value in memory and let the CAS below perform the first write.
    const stored = await redis.get<T>(key);
    const current = stored !== null && stored !== undefined ? stored : fileRead<T>(key);

    const next = mutate(current);

    const committed = await redis.eval(CAS_SCRIPT, [key, vkey], [expected, JSON.stringify(next)]);
    if (committed === 1) return next;

    // Lost the race — back off, then re-read and reapply. No sleep after the
    // final attempt; we're about to throw.
    if (attempt < MAX_ATTEMPTS) {
      const backoff = Math.min(20 * 2 ** (attempt - 1), 250);
      await new Promise((r) => setTimeout(r, backoff / 2 + Math.random() * backoff));
    }
  }

  throw new KvContentionError(key, MAX_ATTEMPTS);
}
