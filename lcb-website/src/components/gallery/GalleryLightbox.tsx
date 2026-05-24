"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export interface LightboxImage {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  category: string;
}

interface GalleryLightboxProps {
  images: LightboxImage[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function GalleryLightbox({
  images,
  currentIndex,
  onClose,
  onNavigate,
}: GalleryLightboxProps) {
  const current = images[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  const prev = useCallback(() => {
    if (hasPrev) onNavigate(currentIndex - 1);
  }, [hasPrev, currentIndex, onNavigate]);

  const next = useCallback(() => {
    if (hasNext) onNavigate(currentIndex + 1);
  }, [hasNext, currentIndex, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/92 backdrop-blur-xl"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.06] text-white/70 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.10] hover:text-white"
        aria-label="Close lightbox"
      >
        <X className="h-4 w-4" strokeWidth={2} />
      </button>

      {/* Counter */}
      <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full border border-white/[0.10] bg-black/40 px-3 py-1 text-[11px] font-medium tracking-wider text-white/50 backdrop-blur">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Prev arrow */}
      <AnimatePresence>
        {hasPrev && (
          <motion.button
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.06] text-white/70 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.10] hover:text-white"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Next arrow */}
      <AnimatePresence>
        {hasNext && (
          <motion.button
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.06] text-white/70 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.10] hover:text-white"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Image — swipeable */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-16 flex max-h-[80vh] max-w-5xl flex-col items-center"
          onClick={(e) => e.stopPropagation()}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={(_, info) => {
            if (info.offset.x < -80) next();
            if (info.offset.x > 80) prev();
          }}
        >
          <div className="relative max-h-[75vh] overflow-hidden rounded-xl">
            <Image
              src={current.src}
              alt={current.alt}
              width={1400}
              height={900}
              className="max-h-[75vh] w-auto object-contain"
              sizes="(max-width: 768px) 100vw, 80vw"
              priority
            />
          </div>

          {current.caption && (
            <p className="mt-4 text-center text-sm text-white/55">{current.caption}</p>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
