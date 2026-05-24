# LCB Website — Photo Upload Guide

## Story Section (5 bento-grid cards)

Drop photos into `/public/gallery/story/` using these exact filenames:

| File | Card | Recommended size |
|------|------|-----------------|
| `featured.jpg` | Big hero card (top, full width) | 1600 × 900 px |
| `voices.jpg` | Tall left card | 900 × 1200 px |
| `gathering.jpg` | Wide center card | 1200 × 680 px |
| `leadership.jpg` | Square bottom-left card | 800 × 800 px |
| `learning.jpg` | Wide bottom-right card | 1200 × 680 px |

After dropping files → save `src/content/gallery.ts` (or just refresh dev server). Done.

### Want multiple photos cycling in a card?
Edit `src/content/gallery.ts`, uncomment the `srcs` array for that slot and add your file paths:

```ts
{
  id: "g1",
  src: "/gallery/story/featured.jpg",        // ← first / fallback
  srcs: [
    "/gallery/story/featured.jpg",
    "/gallery/story/featured-2.jpg",
    "/gallery/story/featured-3.jpg",
  ],
  ...
}
```
Cards cycle through photos automatically every 6 seconds with a crossfade. No performance cost — images preloaded by Next.js, transitions are CSS opacity only.

---

## Gallery Page (masonry grid with filter tabs)

Drop photos into category subfolders:

```
/public/gallery/events/          ← LCB events, panels, summits
/public/gallery/sessions/        ← masterclasses, workshops
/public/gallery/community/       ← group photos, meetups
/public/gallery/behind-scenes/   ← team, prep, candid
/public/gallery/achievements/    ← awards, milestones
```

Then run once:
```bash
npm run gallery
```

This scans the folders and updates `src/data/gallery/manifest.json` automatically.  
Commit `manifest.json` → redeploy → photos live on site.

**File naming tip:** Use descriptive names — they become the alt text automatically.  
`campus-leads-summit-vol2.jpg` → *"Campus Leads Summit Vol2"*

---

## Performance Notes

- **Next.js auto-optimizes** all local images: converts to WebP/AVIF, resizes for each breakpoint, serves smallest possible file
- **Lazy loading** — gallery images load only when scrolled into view
- **Priority loading** — the featured story card (above the fold) loads first, boosting LCP score
- **Keep source files under 5 MB** — Next.js handles compression, but smaller originals = faster build

## Supported formats
`.jpg` `.jpeg` `.png` `.webp` `.avif`
