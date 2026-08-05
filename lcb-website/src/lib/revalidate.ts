import { revalidatePath, revalidateTag } from "next/cache";
import { kvTag } from "./kv-cached";

// Public pages are ISR-cached (see `revalidate` in each page). Admin writes call
// this so edits appear immediately instead of waiting for the cache window.
const PATHS_BY_CONTENT: Record<string, string[]> = {
  articles:        ["/", "/forum"],
  events:          ["/"],
  news:            ["/"],
  press:           ["/"],
  gallery:         ["/"],
  "story-gallery": ["/"],
  team:            ["/"],
  applications:    ["/"],
  magazines:       ["/magazine"],
  lor:             ["/", "/lor/apply"],
};

// Dynamic route templates that must be revalidated as a whole segment.
const DYNAMIC_SEGMENTS: Record<string, string[]> = {
  articles:  ["/forum/[id]"],
  magazines: ["/magazine/[id]"],
};

// KV documents each content type owns. Public pages read these through
// kvGetCached, so the cached copy must be dropped too — otherwise a saved edit
// would sit behind the Data Cache even after the page cache is purged.
const KV_KEYS_BY_CONTENT: Record<string, string[]> = {
  articles:        ["data:articles"],
  events:          ["data:events"],
  news:            ["data:news"],
  press:           ["data:press"],
  gallery:         ["data:gallery-manifest"],
  "story-gallery": ["data:story-gallery"],
  applications:    ["data:applications"],
  magazines:       ["data:magazines"],
  lor:             ["data:lor-config"],
  team: [
    "team:central", "team:campus-leads", "team:lcb-heads",
    "team:professionals", "team:initiatives", "team:star-awards",
  ],
};

export function revalidateContent(content: keyof typeof PATHS_BY_CONTENT | string): void {
  try {
    // `expire: 0` rather than the "max" profile: "max" marks the entry stale and
    // serves stale content while refetching, so an admin would not see their own
    // save on the next load. Expiring immediately gives read-your-own-writes.
    // (updateTag() would be the idiomatic choice but is Server-Action-only, and
    // these writes are Route Handlers.)
    for (const k of KV_KEYS_BY_CONTENT[content] ?? []) revalidateTag(kvTag(k), { expire: 0 });
    for (const p of PATHS_BY_CONTENT[content] ?? []) revalidatePath(p);
    for (const p of DYNAMIC_SEGMENTS[content] ?? []) revalidatePath(p, "page");
  } catch (err) {
    // A failed cache purge must never fail the admin's save — the page still
    // refreshes on its own once the ISR window expires.
    console.error(`revalidateContent(${content}) failed`, err);
  }
}
