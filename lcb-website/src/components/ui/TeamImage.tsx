"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface TeamImageProps {
  src: string;
  alt: string;
  /**
   * CSS object-position value.
   * Default "center 20%" keeps faces in frame for portrait crops.
   * Pass "center top" for tight headshots, "center 35%" for half-body shots.
   */
  objectPosition?: string;
  priority?: boolean;
  sizes?: string;
  /** Grayscale → color on hover. Default true for team aesthetic. */
  grayscale?: boolean;
  /** Additional classes on the <Image> element itself */
  imageClassName?: string;
  /** Additional classes on the outer aspect-ratio wrapper */
  className?: string;
}

/**
 * Normalised team portrait image.
 * Always renders a 4/5 aspect-ratio container — cards stay uniform
 * regardless of the original photo dimensions.
 * Face focal point is preserved via object-position.
 */
export function TeamImage({
  src,
  alt,
  objectPosition = "center 20%",
  priority = false,
  sizes = "280px",
  grayscale = true,
  imageClassName,
  className,
}: TeamImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative aspect-[4/5] overflow-hidden", className)}>
      {/* Skeleton — visible until image loads */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-white/[0.06] to-white/[0.02] animate-pulse transition-opacity duration-700",
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
          // Zoom on hover — parent must have className="group"
          "transition-all duration-[1000ms] ease-out group-hover:scale-[1.06]",
          // Grayscale treatment
          grayscale && "grayscale group-hover:grayscale-0",
          // Fade in on load to prevent jarring pop
          "transition-opacity duration-700",
          loaded ? "opacity-100" : "opacity-0",
          imageClassName
        )}
        style={{ objectPosition }}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
