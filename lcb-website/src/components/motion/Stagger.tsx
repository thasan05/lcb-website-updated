"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
  once?: boolean;
  amount?: number;
};

export function Stagger({
  children,
  className,
  stagger = 0.08,
  delayChildren = 0,
  once = true,
  amount = 0.2,
}: Props) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      variants={staggerContainer(stagger, delayChildren)}
    >
      {children}
    </motion.div>
  );
}
