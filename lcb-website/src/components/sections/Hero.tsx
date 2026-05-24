"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowUpRight, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { AmbientGlow } from "@/components/background/AmbientGlow";
import { GridOverlay } from "@/components/background/GridOverlay";
import { NetworkGraph } from "@/components/background/NetworkGraph";
import { Spotlight } from "@/components/background/Spotlight";
import { ease } from "@/lib/motion";
import { siteConfig } from "@/content/site";
import type { ApplicationsConfig } from "@/lib/admin";

type HeroProps = {
  applicationsConfig?: ApplicationsConfig;
};

export function Hero({ applicationsConfig }: HeroProps) {
  const [showClosedModal, setShowClosedModal] = useState<"campus" | "central" | null>(null);
  const open = applicationsConfig?.campusLeads.open ?? siteConfig.applications.open;
  const formUrl = applicationsConfig?.campusLeads.formUrl ?? siteConfig.applications.formUrl;
  const centralOpen = applicationsConfig?.centralTeam.open ?? siteConfig.centralApplications.open;
  const centralFormUrl = applicationsConfig?.centralTeam.formUrl ?? siteConfig.centralApplications.formUrl;

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-20 sm:pt-28">
      {/* Atmosphere stack — order matters: graph behind, glows on top */}
      <NetworkGraph />
      <AmbientGlow intensity="strong" />
      <GridOverlay />
      <Spotlight />

      {/* Bottom edge fade to next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent via-ink-100/60 to-ink-100" />

      <Container className="relative z-10">
        <div className="flex flex-col items-center text-center">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease, delay: 0.05 }}
            className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/70"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-cyan-400/60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-cyan-400" />
            </span>
            <span className="shimmer-text">Built for ambitious professionals</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.1, ease, delay: 0.2 }}
            className="mt-8 font-display text-display-xl font-bold text-gradient-hero [text-wrap:balance]"
          >
            Where Bangladesh&apos;s
            <br className="hidden sm:inline" />
            {" "}future leaders{" "}
            <span className="serif-italic text-white/95">connect.</span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, ease, delay: 0.95 }}
            className="mt-7 max-w-2xl text-balance text-lg leading-relaxed text-white/60 sm:text-xl"
          >
            A nationwide movement helping students and young professionals build networks, gain opportunities, and grow into future-ready leaders.
          </motion.p>

          {/* CTAs — premium shine-sweep treatment */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 1.15 }}
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4"
          >
            {/* Campus Lead button */}
            {open && formUrl ? (
              <a
                href={formUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shine-sweep focus-ring group relative inline-flex h-[54px] items-center justify-center gap-2 rounded-full border border-brand-400/40 bg-brand-500 px-7 text-base font-medium text-white shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-400 hover:shadow-glow-lg active:scale-[0.98]"
              >
                <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent opacity-60 mix-blend-overlay" />
                <span className="relative z-10">Apply as a Campus Lead</span>
                <ArrowUpRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2.25} />
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setShowClosedModal("campus")}
                className="shine-sweep focus-ring group relative inline-flex h-[54px] items-center justify-center gap-2 rounded-full border border-brand-400/40 bg-brand-500 px-7 text-base font-medium text-white shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-400 hover:shadow-glow-lg active:scale-[0.98]"
              >
                <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent opacity-60 mix-blend-overlay" />
                <span className="relative z-10">Apply as a Campus Lead</span>
                <ArrowUpRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2.25} />
              </button>
            )}

            {/* Central Team button */}
            {centralOpen && centralFormUrl ? (
              <a
                href={centralFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring group relative inline-flex h-[54px] items-center justify-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.06] px-7 text-base font-medium text-white/80 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.22] hover:bg-white/[0.10] hover:text-white active:scale-[0.98]"
              >
                <span className="relative z-10">Apply in Central Team</span>
                <ArrowUpRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2.25} />
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setShowClosedModal("central")}
                className="focus-ring group relative inline-flex h-[54px] items-center justify-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.06] px-7 text-base font-medium text-white/80 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.22] hover:bg-white/[0.10] hover:text-white active:scale-[0.98]"
              >
                <span className="relative z-10">Apply in Central Team</span>
                <ArrowUpRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2.25} />
              </button>
            )}
          </motion.div>

          {/* Applications-closed modal */}
          <AnimatePresence>
            {showClosedModal && (
              <ClosedModal
                type={showClosedModal}
                onClose={() => setShowClosedModal(null)}
              />
            )}
          </AnimatePresence>

          {/* Floating stat ticker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease, delay: 1.4 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs uppercase tracking-[0.18em] text-white/40 sm:gap-x-12"
          >
            <span className="flex items-center gap-2"><Dot /> 24K+ Members</span>
            <span className="flex items-center gap-2"><Dot /> 40+ Campus Leads</span>
            <span className="flex items-center gap-2"><Dot /> 192+ Career Sessions</span>
            <span className="flex items-center gap-2"><Dot /> Nationwide Network</span>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7, duration: 1, ease }}
          className="absolute inset-x-0 bottom-10 hidden flex-col items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/35 md:flex"
        >
          <span>Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}

// ── Applications-closed modal ─────────────────────────────────────────────────

function ClosedModal({ type, onClose }: { type: "campus" | "central"; onClose: () => void }) {
  const isCentral = type === "central";
  return (
    // Backdrop
    <motion.div
      key="closed-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label="Applications closed"
    >
      {/* Blur + dark overlay */}
      <div className="absolute inset-0 bg-ink-100/80 backdrop-blur-md" />

      {/* Card */}
      <motion.div
        key="closed-modal-card"
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/[0.10] bg-gradient-to-b from-white/[0.07] to-white/[0.02] shadow-2xl"
      >
        {/* Top highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] text-white/40 transition-all hover:border-white/[0.18] hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-8 pb-8 pt-10 text-center sm:px-10">
          {/* Icon */}
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-400/20 bg-brand-500/10">
            <svg
              className="h-6 w-6 text-brand-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
            </svg>
          </div>

          <h2 className="font-display text-2xl font-semibold text-white">
            Applications are closed
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-white/55">
            {isCentral
              ? "We’re not accepting Central Team applications right now. Follow LCB on LinkedIn to be the first to know when the next intake opens — we’ll announce it there first."
              : "We’re not accepting Campus Lead applications right now. Follow LCB on LinkedIn to be the first to know when the next intake opens — we’ll announce it there first."}
          </p>

          {/* LinkedIn CTA */}
          <a
            href={siteConfig.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/20 py-3 text-sm font-medium text-brand-300 transition-all duration-200 hover:bg-brand-500/30 hover:text-white"
          >
            Follow LCB on LinkedIn
            <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full rounded-full py-3 text-sm text-white/35 transition-colors hover:text-white/60"
          >
            Dismiss
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function Dot() {
  return (
    <span className="h-1 w-1 rounded-full bg-brand-400 shadow-[0_0_6px_rgba(79,156,235,0.8)]" />
  );
}
