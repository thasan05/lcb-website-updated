import { unstable_cache } from "next/cache";
import { kvGet } from "./kv";

/**
 * Cached read for public pages.
 *
 * Public pages read the same handful of KV documents on every render. Over
 * Upstash REST each read is its own HTTP round trip, so the homepage alone was
 * issuing 14 of them per visitor and paying that latency in TTFB. This wraps the
 * read in Next's Data Cache: one round trip per key per revalidation window,
 * shared across all visitors, regardless of whether the page itself ends up
 * statically or dynamically rendered.
 *
 * Freshness is not sacrificed — each entry is tagged, and admin writes call
 * `revalidateContent()` which invalidates the matching tag, so an edit is
 * visible on the next request rather than after the window expires.
 *
 * Do NOT use this in admin API routes: writes need the current value, and
 * `kvUpdate` reads through to Redis directly for exactly that reason.
 */
export const kvTag = (key: string) => `kv:${key}`;

const REVALIDATE_SECONDS = 300;

export function kvGetCached<T>(key: string): Promise<T> {
  // The cache key is derived from keyParts; the tag drives targeted invalidation.
  return unstable_cache(() => kvGet<T>(key), ["kv", key], {
    tags: [kvTag(key)],
    revalidate: REVALIDATE_SECONDS,
  })();
}

/** Same as kvGetCached but resolves to `fallback` instead of throwing. */
export async function kvGetCachedOr<T>(key: string, fallback: T): Promise<T> {
  try {
    const value = await kvGetCached<T>(key);
    return value ?? fallback;
  } catch {
    return fallback;
  }
}
