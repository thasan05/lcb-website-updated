"use client";

import { useScroll, useSpring, motion } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  // Apple-tuned responsive spring curve
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 38,
    restDelta: 0.0005,
  });

  return (
    <div className="fixed inset-x-0 top-0 z-[100] h-[2px] pointer-events-none">
      <motion.div
        style={{
          scaleX,
          background:
            "linear-gradient(90deg, #0a66c2 0%, #22d3ee 50%, #60a5fa 100%)",
        }}
        className="h-full origin-left drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]"
      />
    </div>
  );
}
