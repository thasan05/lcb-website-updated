"use client";

import { useEffect, useRef } from "react";

/**
 * Spotlight — a cursor-following warm radial glow.
 * Mounts inside its parent (typically the hero) and updates --mx / --my
 * CSS variables on mousemove. The actual gradient is rendered by .cursor-spotlight.
 *
 * Performant: a single rAF-throttled mousemove handler, no React state.
 */
export function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      if (frame.current !== null) return;
      frame.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty("--mx", `${x}%`);
        el.style.setProperty("--my", `${y}%`);
        frame.current = null;
      });
    };

    const onLeave = () => {
      el.style.setProperty("--mx", "50%");
      el.style.setProperty("--my", "50%");
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  return <div ref={ref} className="cursor-spotlight" />;
}
