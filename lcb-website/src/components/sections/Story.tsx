"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { FadeIn } from "@/components/motion/FadeIn";
import { ScrollScrubText } from "@/components/motion/ScrollScrubText";
import { gallery, type GalleryItem } from "@/content/gallery";
import { campusLeads } from "@/content/campusLeads";

// ─────────────────────────────────────────────────────────────────────────────
// CyclingImage — handles single photo or multi-photo crossfade carousel.
// Uses opacity transitions only — no layout shifts, hardware accelerated.
// ─────────────────────────────────────────────────────────────────────────────
function CyclingImage({
  item,
  sizes,
  priority = false,
  hover = false,
}: {
  item: GalleryItem;
  sizes: string;
  priority?: boolean;
  hover?: boolean;
}) {
  const images = item.srcs && item.srcs.length > 1 ? item.srcs : [item.src];
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(
      () => setActiveIdx((i) => (i + 1) % images.length),
      3600
    );
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <>
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={item.alt}
          fill
          sizes={sizes}
          priority={priority && i === 0}
          className={[
            "object-cover",
            "transition-opacity duration-[1400ms] ease-in-out",
            hover ? "group-hover:scale-105 transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]" : "",
            i === activeIdx ? "opacity-100" : "opacity-0",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      ))}
    </>
  );
}

export function Story({ items }: { items?: GalleryItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const yFeatured = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const yGrid = useTransform(scrollYProgress, [0, 1], ["0%", "-5%"]);

  const source = items?.length ? items : gallery;
  const featured = source.find((g) => g.span === "feature") ?? source[0];
  const supporting = source.filter((g) => g !== featured);

  const universities = Array.from(new Set(campusLeads.map((c) => c.university)));

  return (
    <Section id="story" className="overflow-hidden relative">
      <span className="section-thread" aria-hidden />

      <Container size="xl">
        {/* Editorial intro — Apple keynote presentation */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-start">
          <FadeIn className="lg:col-span-5">
            <h2 className="font-display text-[clamp(2.5rem,5.5vw,4.5rem)] font-bold tracking-tight text-white [text-wrap:balance] leading-[1.08]">
              Where <span className="serif-italic text-brand-300">ambition</span> finds its people.
            </h2>
            <div className="mt-8 flex items-center gap-3">
              <span className="h-px w-10 bg-gradient-to-r from-brand-400 to-transparent" />
              <span className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                Est. 2017 · Nationwide Movement
              </span>
            </div>
          </FadeIn>

          <div className="space-y-8 lg:col-span-7 lg:pt-3">
            {/* Apple scroll-scrub kinetic revelation */}
            <ScrollScrubText
              text="LCB started with a simple belief — Bangladesh's next generation deserved a professional community built around growth, opportunity, and genuine connection. Today, it has become the country's first LinkedIn-based professional movement."
              className="font-display text-[clamp(1.25rem,2.2vw,1.75rem)] font-medium text-white/90 leading-relaxed"
            />

            <ScrollScrubText
              text="Students, founders, creators, and future leaders learning in public, building together, and opening doors for one another. Campus Leads in every major university. Masterclasses with industry pioneers. We don't do passive meetups. We move forward together."
              className="text-lg leading-relaxed text-white/70"
            />
          </div>
        </div>

        {/* Cinematic photo composition — Apple hardware bento grid */}
        <div ref={ref} className="relative mt-20 lg:mt-28">
          {/* Featured photo with parallax */}
          <motion.div
            style={{ y: yFeatured }}
            initial={{ opacity: 0, scale: 1.03 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="group relative aspect-[16/9] overflow-hidden rounded-[32px] border border-white/[0.10] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md"
          >
            <CyclingImage
              item={featured}
              sizes="(max-width: 1024px) 100vw, 1200px"
              priority
              hover
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-6 sm:p-10">
              <p className="max-w-md text-balance font-display text-lg font-medium text-white sm:text-2xl">
                {featured.caption}
              </p>
              <span className="hidden shrink-0 items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/55 sm:flex">
                <span className="h-px w-8 bg-white/40" />
                Community
              </span>
            </div>
          </motion.div>

          {/* Supporting grid — Apple bento aesthetics */}
          <motion.div
            style={{ y: yGrid }}
            className="mt-6 grid grid-cols-12 gap-4 sm:gap-6"
          >
            {/* Tall left */}
            <FadeIn className="group relative col-span-12 aspect-[4/5] overflow-hidden rounded-[28px] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] sm:col-span-6 lg:col-span-4 lg:row-span-2 lg:aspect-auto">
              <CyclingImage
                item={supporting[0]}
                sizes="(max-width: 768px) 100vw, 33vw"
                hover
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">
                  Voices
                </span>
                <p className="mt-2 font-display text-base font-medium text-white sm:text-lg">
                  {supporting[0].caption}
                </p>
              </div>
            </FadeIn>

            {/* Wide center */}
            <FadeIn
              delay={0.08}
              className="group relative col-span-12 aspect-[16/9] overflow-hidden rounded-[28px] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] sm:col-span-6 lg:col-span-8"
            >
              <CyclingImage
                item={supporting[1]}
                sizes="(max-width: 768px) 100vw, 66vw"
                hover
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <span className="text-[10px] uppercase tracking-[0.2em] text-brand-300">
                  Gathering
                </span>
                <p className="mt-2 font-display text-base font-medium text-white sm:text-lg">
                  {supporting[1].caption}
                </p>
              </div>
            </FadeIn>

            {/* Square + wide bottom */}
            <FadeIn
              delay={0.16}
              className="group relative col-span-12 aspect-square overflow-hidden rounded-[28px] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] sm:col-span-5 lg:col-span-3"
            >
              <CyclingImage
                item={supporting[2]}
                sizes="(max-width: 768px) 100vw, 25vw"
                hover
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                  Leadership
                </span>
                <p className="mt-2 font-display text-sm font-medium text-white">{supporting[2].caption}</p>
              </div>
            </FadeIn>

            <FadeIn
              delay={0.24}
              className="group relative col-span-12 aspect-[16/9] overflow-hidden rounded-[28px] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)] sm:col-span-7 lg:col-span-5"
            >
              <CyclingImage
                item={supporting[3]}
                sizes="(max-width: 768px) 100vw, 42vw"
                hover
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                  Learning
                </span>
                <p className="mt-2 font-display text-base font-medium text-white sm:text-lg">
                  {supporting[3].caption}
                </p>
              </div>
            </FadeIn>
          </motion.div>
        </div>

        {/* University marquee strip — Apple-style clean ticker */}
        <FadeIn className="mt-24 overflow-hidden lg:mt-32">
          <div className="flex items-center gap-6">
            <span className="shrink-0 text-[11px] uppercase tracking-[0.22em] text-white/40">
              On campus at
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          <div className="relative mt-6 overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink-100 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink-100 to-transparent" />
            <div className="flex">
              <div
                className="flex shrink-0 items-center gap-10 pr-10"
                style={{ animation: "marquee 45s linear infinite" }}
              >
                {[...universities, ...universities].map((u, i) => (
                  <span
                    key={`u-${i}`}
                    className="shrink-0 font-display text-2xl font-medium tracking-tight text-white/40 transition-colors hover:text-white sm:text-3xl"
                  >
                    {u}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Pull-quote — Apple keynote quote block */}
        <FadeIn delay={0.1} className="mx-auto mt-24 max-w-3xl lg:mt-32">
          <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.02] p-8 sm:p-12 text-center backdrop-blur-xl relative overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <p className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-medium text-white [text-wrap:balance] leading-snug">
              &ldquo;A movement, not a meetup. You can feel it in every session, every post, every introduction.&rdquo;
            </p>
            <p className="mt-6 text-xs uppercase tracking-[0.22em] text-white/45">
              Tanvir Hasan · Campus Lead · AIUB
            </p>
          </div>
        </FadeIn>
      </Container>
    </Section>
  );
}
