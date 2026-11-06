"use client";

import { cn } from "@/lib/utils";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import type { ReactNode, MouseEvent } from "react";

type Tag = "div" | "article" | "li";

type Props = {
  children: ReactNode;
  className?: string;
  /** Enable cursor-reactive glow & Apple specular border sheen */
  glow?: boolean;
  as?: Tag;
  id?: string;
};

export function GlassCard({ children, className, glow = true, as = "div", id }: Props) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const onMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (!glow) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const background = useMotionTemplate`radial-gradient(420px circle at ${mouseX}px ${mouseY}px, rgba(10,102,194,0.14), transparent 75%)`;
  const borderSheen = useMotionTemplate`radial-gradient(280px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.4), transparent 70%)`;

  const cardClass = cn(
    "group relative overflow-hidden rounded-[28px]",
    "bg-gradient-to-b from-white/[0.045] to-white/[0.012]",
    "border border-white/[0.08]",
    "backdrop-blur-2xl",
    "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
    "hover:border-white/[0.18] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7),0_0_40px_rgba(10,102,194,0.12)]",
    "hover:scale-[1.008]",
    className
  );

  const inner = (
    <>
      {/* Specular border reflection — Apple hardware feel */}
      {glow && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-[29px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: borderSheen,
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            padding: "1px",
          }}
        />
      )}

      {/* Surface ambient reflection */}
      {glow && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background }}
        />
      )}

      {/* Top bevel highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Card Content */}
      <div className="relative z-10">{children}</div>
    </>
  );

  const Component = as === "article" ? motion.article : as === "li" ? motion.li : motion.div;

  return (
    <Component id={id} onMouseMove={onMouseMove} className={cardClass}>
      {inner}
    </Component>
  );
}
