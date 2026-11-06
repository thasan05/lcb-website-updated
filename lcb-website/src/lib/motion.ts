import type { Variants, Transition } from "framer-motion";

// Apple-signature fluid easing curve (iOS / macOS HIG standard)
export const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const easeOut: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const spring: Transition = {
  type: "spring",
  stiffness: 350,
  damping: 32,
  mass: 0.8,
};

export const softSpring: Transition = {
  type: "spring",
  stiffness: 220,
  damping: 26,
  mass: 1,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: easeOut },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.7, ease: easeOut } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: easeOut },
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
  hidden: { opacity: 0, x: -30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: easeOut } },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: easeOut } },
};
