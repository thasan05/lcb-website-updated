"use client";

import { MotionConfig } from "framer-motion";

/**
 * Makes every Framer Motion animation on the site honour the visitor's
 * "reduce motion" OS setting.
 *
 * globals.css already neutralises CSS animations and transitions under
 * `prefers-reduced-motion`, but Framer Motion animates by writing inline styles
 * from JavaScript, which those CSS rules cannot touch. Without this, a visitor
 * who has asked for reduced motion still got the full set of springs, parallax
 * and staggered reveals across ~27 components.
 *
 * `reducedMotion="user"` keeps opacity transitions (which don't cause vestibular
 * discomfort) while dropping transform and layout animations.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
