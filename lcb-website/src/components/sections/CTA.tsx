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
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 90% at 50% 50%, rgba(10,102,194,0.22), transparent 70%)",
        }}
      />

      <Container size="md" className="relative z-10">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer(0.12)}
          className="relative overflow-hidden rounded-[36px] border border-white/[0.12] bg-gradient-to-b from-[#0e101a]/90 to-[#060810]/95 p-10 text-center backdrop-blur-3xl shadow-[0_30px_90px_-20px_rgba(0,0,0,0.8)] sm:p-16 lg:p-20"
        >
          {/* Top specular highlight */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          
          {/* Grid ambient texture */}
          <div className="pointer-events-none absolute inset-0 grid-bg mask-fade-edges opacity-40" />

          {/* Bottom light beam */}
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 left-1/2 h-80 w-[140%] -translate-x-1/2 blur-3xl"
            style={{
              background:
                "radial-gradient(ellipse 50% 100% at 50% 100%, rgba(10,102,194,0.45), transparent 70%)",
            }}
          />

          <div className="relative z-10 flex flex-col items-center">
            <motion.p
              variants={fadeUp}
              className="text-xs uppercase tracking-[0.22em] text-cyan-400 font-medium"
            >
              Your next chapter
            </motion.p>

            <motion.h2
              variants={fadeUp}
              className="mt-6 max-w-3xl font-display text-[clamp(2.5rem,5.5vw,4.5rem)] font-bold tracking-tight text-white [text-wrap:balance] leading-[1.08]"
            >
              The community is{" "}
              <span className="serif-italic text-brand-300">already here.</span>
              <br className="hidden sm:inline" /> You should be too.
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="mt-7 max-w-xl text-balance text-lg leading-relaxed text-white/60"
            >
              Join 24,000+ students, creators and future leaders building the most
              ambitious professional community in Bangladesh.
            </motion.p>

            {/* Apple dual pill actions */}
            <motion.div
              variants={fadeUp}
              className="mt-10 flex w-full flex-col gap-3.5 sm:w-auto sm:flex-row sm:items-center sm:justify-center sm:gap-4"
            >
              <a
                href={siteConfig.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex h-[54px] w-full items-center justify-center gap-2 rounded-full bg-white px-8 text-base font-semibold text-black shadow-[0_0_30px_rgba(255,255,255,0.25)] transition-all duration-300 hover:bg-white/90 hover:scale-[1.02] active:scale-[0.97] sm:w-auto focus-ring"
              >
                <span>Follow LCB on LinkedIn</span>
                <ArrowUpRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={2.5}
                />
              </a>
              <a
                href={siteConfig.socials.facebookGroup}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-[54px] w-full items-center justify-center rounded-full border border-white/15 bg-white/[0.07] px-8 text-base font-medium text-white backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.13] hover:border-white/30 hover:scale-[1.02] active:scale-[0.97] sm:w-auto focus-ring"
              >
                Join Facebook group
              </a>
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="mt-12 text-[11px] uppercase tracking-[0.22em] text-white/35 font-medium"
            >
              Free · Open to all · Nationwide
            </motion.p>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
