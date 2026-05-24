"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type OverlayStrength = "none" | "light" | "medium" | "heavy";

interface EventImageProps {
  src: string;
  alt: string;
  /**
   * CSS aspect-ratio value (e.g. "21/9", "16/10", "4/3").
   * Passed as inline style so any ratio works — no Tailwind class guessing.
   */
  aspect?: string;
  /**
   * CSS object-position. Default "center 40%" works for most conference/
   * event photos where subjects occupy the middle of the frame.
   */
  objectPosition?: string;
  priority?: boolean;
  sizes?: string;
  /**
   * Cinematic dark gradient overlay on top of the image.
   * "medium" = same as original Events.tsx. "heavy" = more dramatic.
   */
  overlay?: OverlayStrength;
  /** Additional classes on the outer aspect-ratio wrapper */
  className?: string;
  /** Additional classes on the <Image> element */
  imageClassName?: string;
}

const overlayClasses: Record<OverlayStrength, string> = {
  none: "",
  light: "bg-gradient-to-t from-ink-100/70 via-ink-100/20 to-transparent",
  medium: "bg-gradient-to-t from-ink-100 via-ink-100/40 to-transparent",
  heavy: "bg-gradient-to-t from-ink-100 via-ink-100/60 to-ink-100/10",
};

/**
 * Normalised event/landscape image.
 * Accepts any aspect ratio — keeps cards visually consistent even when
 * uploaded photos are all different sizes and crops.
 */
export function EventImage({
  src,
  alt,
  aspect = "16/10",
  objectPosition = "center 40%",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  overlay = "medium",
  className,
  imageClassName,
}: EventImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ aspectRatio: aspect }}
    >
      {/* Skeleton shimmer */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-white/[0.05] to-white/[0.01] animate-pulse transition-opacity duration-700",
          loaded && "opacity-0 pointer-events-none"
        )}
      />

      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        sizes={sizes}
        className={cn(
          "object-cover",
          // Cinematic slow zoom on hover
          "transition-transform duration-[1500ms] ease-out group-hover:scale-105",
          // Fade in on load
          "transition-opacity duration-700",
          loaded ? "opacity-100" : "opacity-0",
          imageClassName
        )}
        style={{ objectPosition }}
        onLoad={() => setLoaded(true)}
      />

      {/* Gradient overlay — always on top of image */}
      {overlay !== "none" && (
        <div
          aria-hidden
          className={cn("pointer-events-none absolute inset-0", overlayClasses[overlay])}
        />
      )}
    </div>
  );
}
