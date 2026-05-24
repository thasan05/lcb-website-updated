"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const WORDS = ["LinkedIn", "Community", "Bangladesh"];
const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Fix: whileInView breaks when any ancestor has overflow:hidden —
 * IntersectionObserver flags the element as not visible.
 * Solution: useInView on the outermost div (no overflow on it),
 * drive animate={} prop directly from the boolean.
 *
 * Gradient text rule: motion transform/opacity must NEVER be applied to
 * the element that owns background-clip:text — use a wrapper div instead.
 */
export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  // margin fires observer 80px before container enters viewport
  const inView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });

  return (
    <div ref={ref} aria-hidden className="relative select-none">

      {/* ── Mobile ───────────────────────────────────────────────────────── */}
      <div className="overflow-hidden sm:hidden">
        <motion.div
          initial={{ y: "110%" }}
          animate={inView ? { y: "0%" } : { y: "110%" }}
          transition={{ duration: 1.0, delay: 0.05, ease }}
        >
          <span className="block font-display font-bold leading-[0.88] tracking-[-0.05em] text-gradient-editorial opacity-[0.85] text-[clamp(4rem,22vw,7rem)]">
            LCB
          </span>
        </motion.div>
      </div>

      {/* ── Desktop: staggered word clip reveal ──────────────────────────── */}
      <div className="hidden overflow-x-hidden sm:block">
        {WORDS.map((word, i) => (
          <div key={word} className="overflow-hidden">
            <motion.div
              initial={{ y: "108%" }}
              animate={inView ? { y: "0%" } : { y: "108%" }}
              transition={{
                duration: 1.05,
                delay: 0.05 + i * 0.16,
                ease,
              }}
            >
              <span className="block font-display font-bold leading-[0.88] tracking-[-0.05em] text-gradient-editorial opacity-[0.85] text-[clamp(4rem,16vw,14rem)]">
                {word}
              </span>
            </motion.div>
          </div>
        ))}
      </div>

      {/* ── Light sweep after words land ─────────────────────────────────── */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 hidden w-[45%] sm:block"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.055) 45%, rgba(255,255,255,0.11) 50%, rgba(255,255,255,0.055) 55%, transparent 100%)",
        }}
        initial={{ x: "-110%" }}
        animate={inView ? { x: "320%" } : { x: "-110%" }}
        transition={{
          duration: 2.0,
          delay: 0.05 + 2 * 0.16 + 1.05 + 0.2,
          ease: [0.4, 0, 0.2, 1],
        }}
      />
    </div>
  );
}
