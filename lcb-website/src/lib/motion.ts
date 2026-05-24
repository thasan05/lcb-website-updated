import type { Variants, Transition } from "framer-motion";

// Cinematic easing curves (framer-motion compatible tuples)
export const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const easeOut: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const spring: Transition = {
  type: "spring",
  stiffness: 140,
  damping: 22,
  mass: 0.9,
};

export const softSpring: Transition = {
  type: "spring",
  stiffness: 90,
  damping: 20,
  mass: 1,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 1, ease } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96, filter: "blur(8px)" },
  show: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 1, ease },
  },
};

export const staggerContainer = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: stagger,
      delayChildren,
    },
  },
});

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.9, ease } },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.9, ease } },
};
