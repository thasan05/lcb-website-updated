"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { ReactNode, MouseEvent } from "react";
import { useRef } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Magnet strength multiplier; lower = subtler */
  strength?: number;
};

export function Magnetic({ children, className, strength = 0.25 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const sx = useSpring(mx, { stiffness: 200, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 200, damping: 18, mass: 0.6 });

  const x = useTransform(sx, (v) => v * strength);
  const y = useTransform(sy, (v) => v * strength);

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    mx.set(e.clientX - cx);
    my.set(e.clientY - cy);
  };

  const handleLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x, y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
