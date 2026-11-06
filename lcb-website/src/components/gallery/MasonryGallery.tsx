"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { GalleryLightbox, type LightboxImage } from "./GalleryLightbox";

interface GalleryCategory {
  id: string;
  label: string;
}

interface GalleryImage {
  id: string;
  src: string;
  category: string;
  alt: string;
  caption?: string;
}

interface MasonryGalleryProps {
  images: GalleryImage[];
  categories: GalleryCategory[];
  /** How many images to show initially. "Show more" loads the next batch. */
  initialBatch?: number;
}

const BATCH_SIZE = 24;

export function MasonryGallery({
  images,
  categories,
  initialBatch = BATCH_SIZE,
}: MasonryGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(initialBatch);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // ── Filtered + paginated set ───────────────────────────────────────────────
  const filtered = useMemo(
    () =>
      activeCategory === "all"
        ? images
        : images.filter((img) => img.category === activeCategory),
    [images, activeCategory]
  );

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Reset pagination on filter change
  function changeCategory(id: string) {
    setActiveCategory(id);
    setVisibleCount(initialBatch);
  }

  // Lightbox images = current filtered set (so prev/next stays within category)
  const lightboxImages: LightboxImage[] = filtered.map((img) => ({
    id: img.id,
    src: img.src,
    alt: img.alt,
    caption: img.caption,
    category: img.category,
  }));

  const allCategories = [{ id: "all", label: "All" }, ...categories];

  return (
    <div>
      {/* ── Category filter tabs ─────────────────────────────────────────── */}
      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {allCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => changeCategory(cat.id)}
                className={[
                  "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus-ring",
                  isActive
                    ? "bg-brand-500 text-white shadow-glow"
                    : "border border-white/[0.08] bg-white/[0.03] text-white/55 hover:border-white/[0.14] hover:text-white",
                ].join(" ")}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Masonry grid ────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="columns-2 gap-4 md:columns-3 lg:columns-4"
        >
          {visible.map((img, i) => (
            <MasonryCard
              key={img.id}
              image={img}
              index={i}
              onClick={() => setLightboxIndex(filtered.indexOf(img))}
            />
          ))}

          {visible.length === 0 && (
            <p className="col-span-full py-20 text-center text-sm text-white/35">
              No photos yet in this category.
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Show more ───────────────────────────────────────────────────── */}
      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => setVisibleCount((n) => n + BATCH_SIZE)}
            className="rounded-full border border-white/[0.10] bg-white/[0.04] px-6 py-2.5 text-sm font-medium text-white/60 transition-all duration-300 hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white"
          >
            Show more · {filtered.length - visibleCount} remaining
          </button>
        </div>
      )}

      {/* ── Lightbox ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <GalleryLightbox
            images={lightboxImages}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Single masonry card ────────────────────────────────────────────────────

interface MasonryCardProps {
  image: GalleryImage;
  index: number;
  onClick: () => void;
}

function MasonryCard({ image, index, onClick }: MasonryCardProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.div
      className="group relative mb-4 break-inside-avoid cursor-pointer overflow-hidden rounded-xl border border-white/[0.06]"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.4), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.015 }}
      onClick={onClick}
      role="button"
      aria-label={`View: ${image.alt}`}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      {/* Skeleton */}
      <div
        className={`absolute inset-0 animate-pulse bg-gradient-to-br from-white/[0.05] to-white/[0.01] transition-opacity duration-700 ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
      />

      <div className="relative overflow-hidden">
        <Image
          src={image.src}
          alt={image.alt}
          width={800}
          height={600}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`w-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.04] ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100" />

        {/* Caption on hover */}
        {image.caption && (
          <div className="absolute inset-x-0 bottom-0 translate-y-1 p-3 opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
            <p className="text-[11px] font-medium leading-tight text-white/90">
              {image.caption}
            </p>
          </div>
        )}

        {/* Ambient glow on hover */}
        <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ boxShadow: "inset 0 0 0 1px rgba(79,156,235,0.20)" }}
        />
      </div>
    </motion.div>
  );
}
