"use client";

import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { stats as fallbackStats } from "@/content/stats";
import type { StatsConfig } from "@/content/stats";
import { cn } from "@/lib/utils";

const DEFAULT_UPDATED_LABEL = "August 2026";

/** `config` comes from KV (editable at /admin/stats); omitted falls back to the bundled values. */
export function Stats({ config }: { config?: StatsConfig }) {
  const stats = config?.items?.length ? config.items : fallbackStats;
  const updatedLabel = config?.updatedLabel?.trim() || DEFAULT_UPDATED_LABEL;

  return (
    <Section spacing="tight" className="relative">
      <Container>
        <div className="relative overflow-hidden rounded-[32px] border border-white/[0.10] bg-gradient-to-b from-white/[0.05] to-white/[0.015] backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
          {/* Top highlight line */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          
          {/* Inner atmosphere glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-40 h-80"
            style={{
              background:
                "radial-gradient(ellipse 60% 100% at 50% 100%, rgba(10,102,194,0.18), transparent 70%)",
            }}
          />

          {/* Header row */}
          <div className="relative flex flex-wrap items-center justify-between gap-4 px-8 pt-8 sm:px-14 sm:pt-10">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-gradient-to-r from-brand-400 to-transparent" />
              <span className="text-[11px] uppercase tracking-[0.22em] text-white/50 font-medium">
                The movement in numbers
              </span>
            </div>
            <span className="text-[11px] uppercase tracking-[0.22em] text-white/30">
              Updated {updatedLabel}
            </span>
          </div>

          {/* Numbers Grid */}
          <div className="relative grid grid-cols-2 gap-y-10 p-8 pt-10 sm:p-14 sm:pt-12 lg:grid-cols-4 lg:gap-y-0">
            {stats.map((stat, i) => (
              <StatBlock
                key={stat.label}
                index={i}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                description={stat.description}
                isLast={i === stats.length - 1}
              />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

function StatBlock({
  index,
  value,
  suffix,
  label,
  description,
  isLast,
}: {
  index: number;
  value: string;
  suffix?: string;
  label: string;
  description: string;
  isLast: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const target = parseInt(value, 10);
  const count = useMotionValue(0);
  const display = useTransform(count, (v) =>
    Number.isFinite(target) ? Math.floor(v).toString() : value
  );

  useEffect(() => {
    if (inView && Number.isFinite(target)) {
      const controls = animate(count, target, {
        duration: 2.0,
        ease: [0.16, 1, 0.3, 1],
        delay: index * 0.1,
      });
      return controls.stop;
    }
  }, [inView, target, count, index]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 }}
      className={cn(
        "relative flex flex-col gap-2 px-4 pb-8 sm:px-6 lg:px-8 lg:pb-0",
        !isLast && "lg:border-r lg:border-white/[0.07]",
        index < 2 && "border-b border-white/[0.07] lg:border-b-0",
        index >= 2 && "pt-8 lg:pt-0"
      )}
    >
      {/* Index label */}
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
        0{index + 1}
      </span>

      {/* Monumental Apple stat typography */}
      <div className="flex items-baseline gap-1 font-display text-[clamp(2.75rem,5.5vw,4.75rem)] font-bold tracking-tight text-white leading-none">
        <motion.span>{Number.isFinite(target) ? display : value}</motion.span>
        {suffix && <span className="text-cyan-400 font-semibold">{suffix}</span>}
      </div>
      <p className="text-base font-semibold text-white/90 tracking-tight mt-1">{label}</p>
      <p className="text-sm leading-relaxed text-white/50">{description}</p>
    </motion.div>
  );
}
