"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { siteConfig } from "@/content/site";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function CTA() {
  return (
    <Section id="cta" spacing="loose" className="relative overflow-hidden">
      {/* Section connector thread */}
      <span className="section-thread" aria-hidden />

      {/* Page-scale dramatic radial */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 90% at 50% 50%, rgba(10,102,194,0.28), transparent 70%)",
        }}
      />

      <Container size="md" className="relative">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={staggerContainer(0.12)}
          className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.08] bg-gradient-to-b from-ink-100/85 to-ink-50/85 p-10 backdrop-blur-2xl sm:p-16 lg:p-20"
        >
          {/* Top highlight */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          {/* Faint grid inside */}
          <div className="pointer-events-none absolute inset-0 grid-bg mask-fade-edges opacity-50" />
          {/* Bottom light beam */}
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 left-1/2 h-80 w-[140%] -translate-x-1/2 blur-3xl"
            style={{
              background:
                "radial-gradient(ellipse 50% 100% at 50% 100%, rgba(10,102,194,0.55), transparent 70%)",
            }}
          />
          {/* Subtle floating node accent — left */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-6 top-1/2 hidden h-2 w-2 -translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_24px_6px_rgba(34,211,238,0.6)] lg:block"
          />
          {/* Subtle floating node accent — right */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-6 top-1/3 hidden h-2 w-2 rounded-full bg-brand-400 shadow-[0_0_24px_6px_rgba(79,156,235,0.6)] lg:block"
          />

          <div className="relative text-center">
            <motion.p
              variants={fadeUp}
              className="text-xs uppercase tracking-[0.2em] text-brand-300"
            >
              Your next chapter
            </motion.p>

            <motion.h2
              variants={fadeUp}
              className="mx-auto mt-6 max-w-3xl font-display text-display-lg font-medium text-gradient-editorial [text-wrap:balance]"
            >
              The community is{" "}
              <span className="serif-italic text-white/95">already here.</span>
              <br className="hidden sm:inline" /> You should be too.
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-7 max-w-xl text-balance text-lg leading-relaxed text-white/60"
            >
              Join 24,000+ students, creators and future leaders building the most
              ambitious professional community in Bangladesh.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4"
            >
              <a
                href={siteConfig.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="shine-sweep focus-ring group relative inline-flex h-[54px] w-full items-center justify-center gap-2 rounded-full border border-brand-400/40 bg-brand-500 px-7 text-base font-medium text-white shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-400 hover:shadow-glow-lg active:scale-[0.98] sm:w-auto"
              >
                <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent opacity-60 mix-blend-overlay" />
                <span className="relative z-10">Follow LCB on LinkedIn</span>
                <ArrowUpRight
                  className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={2.25}
                />
              </a>
              <a
                href={siteConfig.socials.facebookGroup}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring inline-flex h-[54px] w-full items-center justify-center rounded-full glass-strong px-7 text-base font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.08] active:scale-[0.98] sm:w-auto"
              >
                Join the Facebook group
              </a>
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="mt-10 text-xs uppercase tracking-[0.18em] text-white/35"
            >
              Free · Open to all · Built in Bangladesh
            </motion.p>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
