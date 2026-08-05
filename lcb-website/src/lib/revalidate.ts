import { revalidatePath } from "next/cache";

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

export function revalidateContent(content: keyof typeof PATHS_BY_CONTENT | string): void {
  try {
    for (const p of PATHS_BY_CONTENT[content] ?? []) revalidatePath(p);
    for (const p of DYNAMIC_SEGMENTS[content] ?? []) revalidatePath(p, "page");
  } catch (err) {
    // A failed cache purge must never fail the admin's save — the page still
    // refreshes on its own once the ISR window expires.
    console.error(`revalidateContent(${content}) failed`, err);
  }
}
