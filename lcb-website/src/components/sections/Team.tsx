"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn } from "@/components/motion/FadeIn";
import { TeamCategoryNav } from "@/components/team/TeamCategoryNav";
import { TeamCard } from "@/components/team/TeamCard";
import { HallOfFameCard } from "@/components/team/HallOfFameCard";
import { teamCategories, type TeamMember, type TeamCategoryId } from "@/data/team";

const INITIAL_VISIBLE = 4;

type Props = {
  liveMembers?: Record<string, TeamMember[]>;
};

export function Team({ liveMembers = {} }: Props) {
  const [activeCategoryId, setActiveCategoryId] = useState(teamCategories[0].id);
  const [showAll, setShowAll] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);

  const handleCategoryChange = (id: TeamCategoryId) => {
    setActiveCategoryId(id);
    setShowAll(false);
    setShowScrollHint(false);
  };

  const categories = teamCategories.map((c) => {
    const live = liveMembers[c.id];
    const members =
      live && live.length >= c.members.length
        ? live
        : live && live.length > 0
        ? live
        : c.members;
    return {
      ...c,
      members,
    };
  });

  const activeCategory =
    categories.find((c) => c.id === activeCategoryId) || categories[0];

  const visibleMembers = showAll
    ? activeCategory.members
    : activeCategory.members.slice(0, INITIAL_VISIBLE);
  const hiddenCount = Math.max(0, activeCategory.members.length - INITIAL_VISIBLE);

  return (
    <Section id="team">
      <Container>
        {/* ── Heading ──────────────────────────────────────────────────── */}
        <SectionHeading
          align="center"
          eyebrow={<Eyebrow>The team</Eyebrow>}
          title={
            <>
              The minds behind{" "}
              <span className="serif-italic">the movement.</span>
            </>
          }
          description="Builders, leaders, and community makers across Bangladesh."
          maxWidth="medium"
        />

        {/* ── Category nav ─────────────────────────────────────────────── */}
        <FadeIn delay={0.15} className="relative mt-12 w-full">
          {/* Fade masks */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-ink-100 to-transparent sm:hidden" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-ink-100 to-transparent sm:hidden" />
          {/* Bouncing swipe hint — mobile only, disappears after interaction */}
          <AnimatePresence>
            {showScrollHint && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="pointer-events-none absolute inset-y-0 right-0 z-20 flex items-center pr-1 sm:hidden"
              >
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ChevronRight className="h-4 w-4 text-brand-400/80" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="overflow-x-auto scrollbar-none pb-1">
            <div className="flex justify-center min-w-max mx-auto px-4 sm:px-0">
              <TeamCategoryNav
                categories={categories}
                activeId={activeCategoryId}
                onChange={handleCategoryChange}
              />
            </div>
          </div>
        </FadeIn>

        {/* ── Active category description ───────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.p
            key={activeCategoryId + "-desc"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="mt-4 text-center text-sm text-white/40"
          >
            {activeCategory.description}
          </motion.p>
        </AnimatePresence>

        {/* ── Member grid ──────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeCategoryId === "star-awards" ? (
            <motion.div
              key="star-awards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            >
              {visibleMembers.map((member, i) => (
                <HallOfFameCard key={member.id} member={member} index={i} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={activeCategoryId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            >
              {visibleMembers.map((member, i) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: Math.min(i * 0.05, 0.35),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <TeamCard member={member} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── View more / collapse ─────────────────────────────────────── */}
        {hiddenCount > 0 && !showAll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex justify-center"
          >
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="group inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-6 py-2.5 text-sm font-medium text-white/60 backdrop-blur transition-all duration-200 hover:border-brand-400/40 hover:bg-brand-500/10 hover:text-white"
            >
              <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" strokeWidth={2} />
              View {hiddenCount} more
            </button>
          </motion.div>
        )}
        {showAll && activeCategory.members.length > INITIAL_VISIBLE && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll(false)}
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] px-6 py-2.5 text-sm text-white/35 transition-colors hover:text-white/60"
            >
              Show less
            </button>
          </div>
        )}

        {/* ── Campus leads CTA (only on campus-leads tab) ──────────────── */}
        {activeCategoryId === "campus-leads" && (
          <FadeIn delay={0.1} className="mt-10">
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-7 backdrop-blur-xl sm:p-8">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-16 left-1/2 h-32 w-2/3 -translate-x-1/2 blur-3xl"
                style={{ background: "radial-gradient(ellipse 50% 100% at 50% 100%, rgba(10,102,194,0.22), transparent 70%)" }}
              />
              <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                    Grow the movement
                  </p>
                  <h3 className="mt-2 font-display text-xl font-medium text-gradient-editorial">
                    Want to lead LCB at your university?
                  </h3>
                </div>
                <Link
                  href="#cta"
                  className="group inline-flex items-center gap-2 text-sm font-medium text-brand-300 transition-colors hover:text-white"
                >
                  Apply to become a campus lead
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2} />
                </Link>
              </div>
            </div>
          </FadeIn>
        )}

        {/* ── Star awards extra detail ──────────────────────────────────── */}
        {activeCategoryId === "star-awards" && (
          <FadeIn delay={0.1} className="mt-10">
            <div className="relative overflow-hidden rounded-3xl border border-brand-400/20 bg-gradient-to-b from-brand-500/[0.06] to-transparent p-7 backdrop-blur-xl sm:p-8">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/40 to-transparent" />
              <p className="text-sm text-white/50">
                LCB Star Awards recognise community members who went beyond — organising events,
                growing chapters, and inspiring others across Bangladesh.
                New awards are announced quarterly.
              </p>
            </div>
          </FadeIn>
        )}
      </Container>
    </Section>
  );
}
