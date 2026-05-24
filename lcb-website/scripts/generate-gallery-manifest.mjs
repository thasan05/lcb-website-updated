#!/usr/bin/env node
/**
 * LCB Gallery Manifest Generator
 *
 * Usage:  npm run gallery
 *
 * What it does:
 *   1. Scans /public/gallery/{category}/ for image files
 *   2. Creates any missing category directories
 *   3. Merges local file list with any remote (http/https) images
 *      already in the manifest — so Unsplash/CDN images are preserved
 *   4. Writes /src/data/gallery/manifest.json
 *
 * After running, commit manifest.json so the changes go live on deploy.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const GALLERY_DIR = path.join(ROOT, "public", "gallery");
const MANIFEST_PATH = path.join(ROOT, "src", "data", "gallery", "manifest.json");

const CATEGORIES = [
  { id: "events",        label: "Events"            },
  { id: "sessions",      label: "Sessions"          },
  { id: "community",     label: "Community"         },
  { id: "behind-scenes", label: "Behind the Scenes" },
  { id: "achievements",  label: "Achievements"      },
];

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"]);

/** Convert filename to a readable alt string */
function filenameToAlt(filename) {
  return filename
    .replace(/\.[^.]+$/, "")           // remove extension
    .replace(/[-_]/g, " ")             // dashes → spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()); // Title Case
}

function main() {
  // ── Read existing manifest (preserve remote images + captions) ────────────
  let existingRemoteImages = [];
  if (fs.existsSync(MANIFEST_PATH)) {
    const existing = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
    existingRemoteImages = (existing.images ?? []).filter(
      (img) => typeof img.src === "string" && img.src.startsWith("http")
    );
    console.log(`  Preserved ${existingRemoteImages.length} remote images from existing manifest.`);
  }

  // ── Scan local image files ────────────────────────────────────────────────
  const localImages = [];
  let localCounter = 1;

  for (const cat of CATEGORIES) {
    const catDir = path.join(GALLERY_DIR, cat.id);

    if (!fs.existsSync(catDir)) {
      fs.mkdirSync(catDir, { recursive: true });
      console.log(`  Created:  public/gallery/${cat.id}/`);
      continue;
    }

    const files = fs
      .readdirSync(catDir)
      .filter((f) => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()))
      .sort();

    for (const file of files) {
      localImages.push({
        id: `local-${cat.id}-${localCounter++}`,
        src: `/gallery/${cat.id}/${file}`,
        category: cat.id,
        alt: filenameToAlt(file),
        caption: "",
      });
    }

    console.log(`  ${cat.id.padEnd(16)} — ${files.length} image(s)`);
  }

  // ── Write merged manifest ─────────────────────────────────────────────────
  const manifest = {
    version: 1,
    categories: CATEGORIES,
    // Remote images first (hand-curated), local images after
    images: [...existingRemoteImages, ...localImages],
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  const total = manifest.images.length;
  console.log(`\n✅  Manifest written → src/data/gallery/manifest.json`);
  console.log(`   ${total} total image(s)  (${existingRemoteImages.length} remote + ${localImages.length} local)\n`);
}

main();
