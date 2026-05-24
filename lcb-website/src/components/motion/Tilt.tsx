"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";

/**
 * Tilt — subtle 3D parallax on hover. JS calculates rotation from cursor
 * position relative to element centre, applies via CSS variables.
 *
 * Restrained by default — designed for premium cards, not gimmicks.
 */
export function Tilt({
  children,
  className,
  /** Max rotation in degrees */
  max = 6,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    if (frame.current !== null) return;

    const el = ref.current;
    frame.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      el.style.setProperty("--rx", `${dx * max}deg`);
      el.style.setProperty("--ry", `${-dy * max}deg`);
      frame.current = null;
    });
  };

  const onLeave = () => {
    if (!ref.current) return;
    ref.current.style.setProperty("--rx", "0deg");
    ref.current.style.setProperty("--ry", "0deg");
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`tilt-card ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
