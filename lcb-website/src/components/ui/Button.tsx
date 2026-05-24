"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

type Props = {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  external?: boolean;
  arrow?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
};

const variants: Record<Variant, string> = {
  primary:
    "shine-sweep bg-brand-500 text-white shadow-glow hover:shadow-glow-lg border border-brand-400/40 hover:bg-brand-400",
  secondary:
    "glass-strong text-white hover:bg-white/[0.08]",
  ghost: "text-white/80 hover:text-white hover:bg-white/[0.04]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-[54px] px-7 text-base",
};

export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className,
  external,
  arrow = false,
  onClick,
  ariaLabel,
}: Props) {
  const classes = cn(
    "group relative inline-flex items-center justify-center gap-2 rounded-full font-medium",
    "transition-all duration-300 ease-out focus-ring",
    "active:scale-[0.98]",
    variants[variant],
    sizes[size],
    className
  );

  const inner = (
    <>
      <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent opacity-60 mix-blend-overlay" />
      <span className="relative z-10">{children}</span>
      {arrow && (
        <ArrowUpRight
          className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          strokeWidth={2.25}
        />
      )}
    </>
  );

  if (href) {
    return (
      <motion.span whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className="inline-block">
        <Link
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          aria-label={ariaLabel}
          className={classes}
        >
          {inner}
        </Link>
      </motion.span>
    );
  }

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      aria-label={ariaLabel}
      className={classes}
    >
      {inner}
    </motion.button>
  );
}
