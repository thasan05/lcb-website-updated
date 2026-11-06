"use client";

import { useRef, ReactNode } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScrollScrubWordProps {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}

function ScrubWord({ children, progress, range }: ScrollScrubWordProps) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  const blur = useTransform(progress, range, ["blur(2px)", "blur(0px)"]);
  const y = useTransform(progress, range, [4, 0]);

  return (
    <motion.span
      style={{ opacity, filter: blur, y }}
      className="inline-block transition-colors duration-200"
    >
      {children}
    </motion.span>
  );
}

interface ScrollScrubTextProps {
  text: string;
  className?: string;
  highlightClass?: string;
  highlightIndices?: number[];
  as?: "h1" | "h2" | "h3" | "p";
}

export function ScrollScrubText({
  text,
  className,
  highlightClass,
  highlightIndices = [],
  as: Tag = "p",
}: ScrollScrubTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 85%", "end 45%"],
  });

  const words = text.split(" ");
  const step = 1 / words.length;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Tag className="flex flex-wrap items-baseline gap-x-[0.28em] gap-y-[0.1em] leading-snug">
        {words.map((word, i) => {
          const start = i * step;
          const end = Math.min(1, start + step * 1.5);
          const isHighlight = highlightIndices.includes(i);

          return (
            <ScrubWord key={i} progress={scrollYProgress} range={[start, end]}>
              <span className={isHighlight ? highlightClass : undefined}>{word}</span>
            </ScrubWord>
          );
        })}
      </Tag>
    </div>
  );
}
