"use client";

import { useScroll, useSpring, motion } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{
        scaleX,
        background:
          "linear-gradient(90deg, #0a66c2 0%, #22d3ee 50%, #4f9ceb 100%)",
      }}
      className="fixed inset-x-0 top-0 z-[999] h-[2px] origin-left"
    />
  );
}
