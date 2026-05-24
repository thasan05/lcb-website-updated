"use client";

import { cn } from "@/lib/utils";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import type { ReactNode, MouseEvent } from "react";

type Tag = "div" | "article" | "li";

type Props = {
  children: ReactNode;
  className?: string;
  /** Enable cursor-reactive glow */
  glow?: boolean;
  as?: Tag;
};

export function GlassCard({ children, className, glow = true, as = "div" }: Props) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const onMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (!glow) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const background = useMotionTemplate`radial-gradient(380px circle at ${mouseX}px ${mouseY}px, rgba(10,102,194,0.18), transparent 70%)`;

  const cardClass = cn(
    "group relative overflow-hidden rounded-3xl",
    "bg-gradient-to-b from-white/[0.04] to-white/[0.01]",
    "border border-white/[0.08]",
    "backdrop-blur-xl",
    "transition-colors duration-500",
    "hover:border-white/[0.14]",
    className
  );

  const inner = (
    <>
      {/* Cursor glow */}
      {glow && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background }}
        />
      )}
      {/* Top inner highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="relative">{children}</div>
    </>
  );

  switch (as) {
    case "article":
      return (
        <motion.article onMouseMove={onMouseMove} className={cardClass}>
          {inner}
        </motion.article>
      );
    case "li":
      return (
        <motion.li onMouseMove={onMouseMove} className={cardClass}>
          {inner}
        </motion.li>
      );
    case "div":
    default:
      return (
        <motion.div onMouseMove={onMouseMove} className={cardClass}>
          {inner}
        </motion.div>
      );
  }
}
