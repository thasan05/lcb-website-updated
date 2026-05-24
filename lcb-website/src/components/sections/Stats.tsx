"use client";

import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { stats } from "@/content/stats";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function Stats() {
  return (
    <Section spacing="tight" className="relative">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-xl">
          {/* Top highlight */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          {/* Inner glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-40 h-80"
            style={{
              background:
                "radial-gradient(ellipse 60% 100% at 50% 100%, rgba(10,102,194,0.22), transparent 70%)",
            }}
          />
          {/* Side accent dots */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 top-1/2 hidden h-1.5 w-1.5 -translate-y-1/2 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_16px_4px_rgba(34,211,238,0.5)] lg:block"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-1/2 hidden h-1.5 w-1.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-brand-400 shadow-[0_0_16px_4px_rgba(79,156,235,0.5)] lg:block"
          />

          {/* Editorial label */}
          <div className="relative flex flex-wrap items-center justify-between gap-4 px-8 pt-8 sm:px-14 sm:pt-10">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-gradient-to-r from-brand-400 to-transparent" />
              <span className="text-[11px] uppercase tracking-[0.22em] text-white/45">
                The movement in numbers
              </span>
            </div>
            <span className="text-[11px] uppercase tracking-[0.22em] text-white/30">
              Updated May 2026
            </span>
          </div>

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
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const target = parseInt(value, 10);
  const count = useMotionValue(0);
  const display = useTransform(count, (v) =>
    Number.isFinite(target) ? Math.floor(v).toString() : value
  );

  useEffect(() => {
    if (inView && Number.isFinite(target)) {
      const controls = animate(count, target, {
        duration: 2.2,
        ease,
        delay: index * 0.1,
      });
      return controls.stop;
    }
  }, [inView, target, count, index]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease, delay: index * 0.08 }}
      className={cn(
        "relative flex flex-col gap-2 px-4 sm:px-6 lg:px-8",
        !isLast && "lg:border-r lg:border-white/[0.06]"
      )}
    >
      {/* Index label */}
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
        0{index + 1}
      </span>

      <div className="flex items-baseline gap-1 font-display text-[clamp(2.75rem,5.5vw,4.5rem)] font-medium tracking-tight text-gradient-brand">
        <motion.span>{Number.isFinite(target) ? display : value}</motion.span>
        {suffix && <span className="text-brand-300">{suffix}</span>}
      </div>
      <p className="text-base font-medium text-white/90">{label}</p>
      <p className="text-sm leading-relaxed text-white/50">{description}</p>
    </motion.div>
  );
}
