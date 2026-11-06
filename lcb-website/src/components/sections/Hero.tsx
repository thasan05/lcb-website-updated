"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/content/site";
import type { ApplicationsConfig } from "@/lib/admin";
import { useLenis } from "@/components/motion/SmoothScroll";

// Lazy-load decorative bg components — don't block hero text paint
const NetworkGraph = dynamic(() => import("@/components/background/NetworkGraph").then(m => ({ default: m.NetworkGraph })), { ssr: false });
const AmbientGlow  = dynamic(() => import("@/components/background/AmbientGlow").then(m => ({ default: m.AmbientGlow })),   { ssr: false });
const GridOverlay  = dynamic(() => import("@/components/background/GridOverlay").then(m => ({ default: m.GridOverlay })),   { ssr: false });
const Spotlight    = dynamic(() => import("@/components/background/Spotlight").then(m => ({ default: m.Spotlight })),       { ssr: false });

type HeroProps = {
  applicationsConfig?: ApplicationsConfig;
};

export function Hero({ applicationsConfig }: HeroProps) {
  const [showClosedModal, setShowClosedModal] = useState<"campus" | "central" | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollTo } = useLenis();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Apple-signature scroll parallax depth
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.2]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  const open = applicationsConfig?.campusLeads.open ?? siteConfig.applications.open;
  const formUrl = applicationsConfig?.campusLeads.formUrl ?? siteConfig.applications.formUrl;
  const centralOpen = applicationsConfig?.centralTeam.open ?? siteConfig.centralApplications.open;
  const centralFormUrl = applicationsConfig?.centralTeam.formUrl ?? siteConfig.centralApplications.formUrl;

  return (
    <section ref={heroRef} className="relative flex min-h-[100svh] items-start sm:items-center overflow-hidden pt-20 sm:pt-28">
      {/* Atmosphere stack — order matters: graph behind, glows on top */}
      <NetworkGraph />
      <AmbientGlow intensity="strong" />
      <GridOverlay />
      <Spotlight />

      {/* Bottom edge fade to next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent via-ink-100/60 to-ink-100" />

      <Container className="relative z-10">
        <motion.div
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="flex flex-col items-center text-center will-change-transform"
        >
          {/* Apple-style Dynamic Status Pill */}
          <div
            className="hero-anim inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-white/70 backdrop-blur-xl shadow-[0_0_20px_rgba(34,211,238,0.15)]"
            style={{ animationDelay: "0.05s" }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-cyan-400/70" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-cyan-400" />
            </span>
            <span className="shimmer-text">Built for ambitious professionals</span>
          </div>

          {/* Headline — Apple typography scale */}
          <h1
            className="hero-anim mt-8 font-display text-[clamp(2.75rem,7.5vw,5.5rem)] font-bold tracking-tight text-gradient-hero [text-wrap:balance] leading-[1.08]"
            style={{ animationDelay: "0.15s" }}
          >
            Where Bangladesh&apos;s
            <br className="hidden sm:inline" />
            {" "}future leaders{" "}
            <span className="serif-italic text-white/95">connect.</span>
          </h1>

          {/* Subhead */}
          <p
            className="hero-anim mt-7 max-w-2xl text-balance text-lg leading-relaxed text-white/60 sm:text-xl font-normal"
            style={{ animationDelay: "0.3s" }}
          >
            A nationwide movement helping students and young professionals build networks, gain opportunities, and grow into future-ready leaders.
          </p>

          {/* Apple-style CTAs */}
          <div
            className="hero-anim mt-10 flex w-full flex-col gap-3.5 sm:w-auto sm:flex-row sm:gap-4 items-center"
            style={{ animationDelay: "0.45s" }}
          >
            {/* Campus Lead button — Apple high-gloss pill */}
            {open && formUrl ? (
              <a
                href={formUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex h-[54px] w-full items-center justify-center gap-2.5 rounded-full bg-white px-8 text-base font-semibold text-black shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300 hover:bg-white/90 hover:scale-[1.02] active:scale-[0.97] sm:w-auto focus-ring"
              >
                <span>Apply as a Campus Lead</span>
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2.5} />
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setShowClosedModal("campus")}
                className="group relative inline-flex h-[54px] w-full items-center justify-center gap-2.5 rounded-full bg-white px-8 text-base font-semibold text-black shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300 hover:bg-white/90 hover:scale-[1.02] active:scale-[0.97] sm:w-auto focus-ring"
              >
                <span>Apply as a Campus Lead</span>
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2.5} />
              </button>
            )}

            {/* Central Team button — Apple translucent dark acrylic */}
            {centralOpen && centralFormUrl ? (
              <a
                href={centralFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex h-[54px] w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-8 text-base font-medium text-white backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.13] hover:border-white/30 hover:scale-[1.02] active:scale-[0.97] sm:w-auto focus-ring"
              >
                <span>Apply in Central Team</span>
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2.2} />
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setShowClosedModal("central")}
                className="group relative inline-flex h-[54px] w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-8 text-base font-medium text-white backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.13] hover:border-white/30 hover:scale-[1.02] active:scale-[0.97] sm:w-auto focus-ring"
              >
                <span>Apply in Central Team</span>
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2.2} />
              </button>
            )}
          </div>

          {/* Applications-closed modal */}
          <AnimatePresence>
            {showClosedModal && (
              <ClosedModal
                type={showClosedModal}
                onClose={() => setShowClosedModal(null)}
              />
            )}
          </AnimatePresence>

          {/* Floating stat ticker — Apple subtle pill row */}
          <div
            className="hero-anim mt-16 grid grid-cols-2 justify-items-center gap-x-8 gap-y-3.5 text-xs uppercase tracking-[0.2em] text-white/45 sm:flex sm:flex-wrap sm:gap-x-12"
            style={{ animationDelay: "0.6s" }}
          >
            <span className="flex items-center gap-2"><Dot /> 24K+ Members</span>
            <span className="flex items-center gap-2"><Dot /> 40+ Campus Leads</span>
            <span className="flex items-center gap-2"><Dot /> 192+ Career Sessions</span>
            <span className="flex items-center gap-2"><Dot /> Nationwide Network</span>
          </div>
        </motion.div>

        {/* Scroll cue with Lenis smooth scroll */}
        <button
          type="button"
          onClick={() => scrollTo("#story", { offset: -70, duration: 1.4 })}
          className="hero-anim absolute inset-x-0 bottom-8 hidden flex-col items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-white/35 transition-colors hover:text-white/80 md:flex focus-ring rounded-full py-1"
          style={{ animationDelay: "0.8s" }}
        >
          <span>Scroll to explore</span>
          <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
        </button>
      </Container>
    </section>
  );
}

// ── Applications-closed modal — Apple iOS sheet feel ─────────────────────────

function ClosedModal({ type, onClose }: { type: "campus" | "central"; onClose: () => void }) {
  const isCentral = type === "central";
  return (
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
      <div className="absolute inset-0 bg-black/75 backdrop-blur-xl" />

      <motion.div
        key="closed-modal-card"
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/[0.12] bg-[#0c0d14]/90 p-8 text-center backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.8)] sm:p-10"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/50 transition-all hover:border-white/25 hover:text-white focus-ring"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-400/25 bg-brand-500/15 shadow-[0_0_24px_rgba(10,102,194,0.3)]">
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

        <h2 className="font-display text-2xl font-bold tracking-tight text-white">
          Applications are closed
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-white/60">
          {isCentral
            ? "We’re not accepting Central Team applications right now. Follow LCB on LinkedIn to be the first to know when the next intake opens — we’ll announce it there first."
            : "We’re not accepting Campus Lead applications right now. Follow LCB on LinkedIn to be the first to know when the next intake opens — we’ll announce it there first."}
        </p>

        <a
          href={siteConfig.socials.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-semibold text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-200 hover:bg-white/90 hover:scale-[1.01] active:scale-[0.98]"
        >
          Follow LCB on LinkedIn
          <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
        </a>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-full py-2.5 text-xs text-white/40 transition-colors hover:text-white/70"
        >
          Dismiss
        </button>
      </motion.div>
    </motion.div>
  );
}

function Dot() {
  return (
    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
  );
}
