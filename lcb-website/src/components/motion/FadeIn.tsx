"use client";

import { motion, type Variants } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import type { ReactNode } from "react";

type Tag = "div" | "section" | "article" | "li" | "span";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Override variants if needed */
  variants?: Variants;
  once?: boolean;
  amount?: number;
  as?: Tag;
};

export function FadeIn({
  children,
  className,
  delay = 0,
  variants = fadeUp,
  once = true,
  amount = 0.25,
  as = "div",
}: Props) {
  const sharedProps = {
    className,
    initial: "hidden" as const,
    whileInView: "show" as const,
    viewport: { once, amount },
    variants,
    transition: { delay },
  };

  switch (as) {
    case "section":
      return <motion.section {...sharedProps}>{children}</motion.section>;
    case "article":
      return <motion.article {...sharedProps}>{children}</motion.article>;
    case "li":
      return <motion.li {...sharedProps}>{children}</motion.li>;
    case "span":
      return <motion.span {...sharedProps}>{children}</motion.span>;
    case "div":
    default:
      return <motion.div {...sharedProps}>{children}</motion.div>;
  }
}
