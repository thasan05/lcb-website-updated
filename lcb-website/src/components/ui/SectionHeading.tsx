"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import type { ReactNode } from "react";

type Props = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
  maxWidth?: "narrow" | "medium" | "wide";
};

const widths = {
  narrow: "max-w-2xl",
  medium: "max-w-3xl",
  wide: "max-w-4xl",
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  maxWidth = "medium",
}: Props) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={staggerContainer(0.12)}
      className={cn(
        "flex flex-col gap-6",
        align === "center" && "items-center text-center",
        widths[maxWidth],
        align === "center" && "mx-auto",
        className
      )}
    >
      {eyebrow && <motion.div variants={fadeUp}>{eyebrow}</motion.div>}
      <motion.h2
        variants={fadeUp}
        className="font-display text-display-md font-medium text-gradient-editorial [text-wrap:balance]"
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          variants={fadeUp}
          className="text-lg leading-relaxed text-white/60 [text-wrap:pretty] sm:text-xl"
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}
