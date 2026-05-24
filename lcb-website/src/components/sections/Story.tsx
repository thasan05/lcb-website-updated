"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FadeIn } from "@/components/motion/FadeIn";
import { gallery, type GalleryItem } from "@/content/gallery";
import { campusLeads } from "@/content/campusLeads";
import { ease } from "@/lib/motion";

// ─────────────────────────────────────────────────────────────────────────────
// CyclingImage — handles single photo or multi-photo crossfade carousel.
// When item.srcs is provided with 2+ entries, cycles through them every 6 s.
// Uses opacity transitions only — no layout shifts, no JS jank.
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
      3500
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
            "transition-opacity duration-[1500ms] ease-in-out",
            hover ? "group-hover:scale-105 transition-transform duration-[1500ms]" : "",
            i === activeIdx ? "opacity-100" : "opacity-0",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      ))}
    </>
  );
}

export function Story() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const yFeatured = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const yGrid = useTransform(scrollYProgress, [0, 1], ["0%", "-6%"]);

  const featured = gallery.find((g) => g.span === "feature")!;
  const supporting = gallery.filter((g) => g.span !== "feature");

  // Collect unique university names for the marquee strip
  const universities = Array.from(new Set(campusLeads.map((c) => c.university)));

  return (
    <Section id="story" className="overflow-hidden">
      {/* Section connector thread */}
      <span className="section-thread" aria-hidden />

      <Container size="xl">
        {/* Editorial intro — asymmetric grid */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <FadeIn className="lg:col-span-5">
            <Eyebrow tone="default">The story</Eyebrow>
            <h2 className="mt-6 font-display text-display-md font-medium text-gradient-editorial [text-wrap:balance]">
              Where <span className="serif-italic text-white/95">ambition</span>,
            finds its people.
            </h2>
            {/* Sticky meta marker on desktop */}
            <div className="mt-10 hidden items-center gap-3 lg:flex">
              <span className="h-px w-12 bg-gradient-to-r from-brand-400 to-transparent" />
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                Est. 2017 · Dhaka, Bangladesh
              </span>
            </div>
          </FadeIn>

          <FadeIn
            delay={0.1}
            className="space-y-6 text-lg leading-relaxed text-white/65 lg:col-span-7 lg:pt-2"
          >
            <p>
            LCB started with a simple belief — Bangladesh&apos;s next generation deserved a professional community built around growth, opportunity, and connection. Today, it has become the country&apos;s first LinkedIn-based professional movement. Students, founders, creators, and future leaders learning in public, building together, and opening doors for one another. This is more than networking. It&apos;s momentum.
            </p>
            <p>
              Two years on, it&apos;s the country&apos;s first LinkedIn-based community.
              Campus Leads in every major university. Masterclasses with founders and
              recruiters. A culture of{" "}
              <em className="serif-italic text-white/90">building in public</em>, showing
              your work, and lifting people up as you climb.
            </p>
            <p className="font-display text-xl font-medium text-white/85">
              We don&apos;t do meetups. We move together.
            </p>
          </FadeIn>
        </div>

        {/* Cinematic photo composition — asymmetric overlap */}
        <div ref={ref} className="relative mt-24 lg:mt-32">
          {/* Featured photo with parallax */}
          <motion.div
            style={{ y: yFeatured }}
            initial={{ opacity: 0, scale: 1.04 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.4, ease }}
            className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-white/[0.08] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
          >
            <CyclingImage
              item={featured}
              sizes="(max-width: 1024px) 100vw, 1200px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-50/95 via-ink-50/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-6 sm:p-10">
              <p className="max-w-md text-balance font-display text-lg font-medium text-white sm:text-2xl">
                {featured.caption}
              </p>
              <span className="hidden shrink-0 items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/55 sm:flex">
                <span className="h-px w-8 bg-white/40" />
                01 — Community
              </span>
            </div>
          </motion.div>

          {/* Supporting grid — magazine-style asymmetry */}
          <motion.div
            style={{ y: yGrid }}
            className="mt-6 grid grid-cols-12 gap-4 sm:gap-6"
          >
            {/* Tall left */}
            <FadeIn className="group relative col-span-12 aspect-[4/5] overflow-hidden rounded-2xl border border-white/[0.08] sm:col-span-6 lg:col-span-4 lg:row-span-2 lg:aspect-auto">
              <CyclingImage
                item={supporting[0]}
                sizes="(max-width: 768px) 100vw, 33vw"
                hover
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/55">
                  02 — Voices
                </span>
                <p className="mt-2 font-display text-base text-white sm:text-lg">
                  {supporting[0].caption}
                </p>
              </div>
            </FadeIn>

            {/* Wide center */}
            <FadeIn
              delay={0.08}
              className="group relative col-span-12 aspect-[16/9] overflow-hidden rounded-2xl border border-white/[0.08] sm:col-span-6 lg:col-span-8"
            >
              <CyclingImage
                item={supporting[1]}
                sizes="(max-width: 768px) 100vw, 66vw"
                hover
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/55">
                  03 — Gathering
                </span>
                <p className="mt-2 font-display text-base text-white sm:text-lg">
                  {supporting[1].caption}
                </p>
              </div>
            </FadeIn>

            {/* Square + wide bottom */}
            <FadeIn
              delay={0.16}
              className="group relative col-span-12 aspect-square overflow-hidden rounded-2xl border border-white/[0.08] sm:col-span-5 lg:col-span-3"
            >
              <CyclingImage
                item={supporting[2]}
                sizes="(max-width: 768px) 100vw, 25vw"
                hover
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/55">
                  04 — Leadership
                </span>
                <p className="mt-2 font-display text-sm text-white">{supporting[2].caption}</p>
              </div>
            </FadeIn>

            <FadeIn
              delay={0.24}
              className="group relative col-span-12 aspect-[16/9] overflow-hidden rounded-2xl border border-white/[0.08] sm:col-span-7 lg:col-span-5"
            >
              <CyclingImage
                item={supporting[3]}
                sizes="(max-width: 768px) 100vw, 42vw"
                hover
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/55">
                  05 — Learning
                </span>
                <p className="mt-2 font-display text-base text-white sm:text-lg">
                  {supporting[3].caption}
                </p>
              </div>
            </FadeIn>
          </motion.div>
        </div>

        {/* University marquee strip — the reach of the movement */}
        <FadeIn className="mt-24 overflow-hidden lg:mt-32">
          <div className="flex items-center gap-6">
            <span className="shrink-0 text-[11px] uppercase tracking-[0.2em] text-white/40">
              On campus at
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          <div className="relative mt-6 overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink-100 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink-100 to-transparent" />
            <div className="flex">
              <div
                className="flex shrink-0 items-center gap-8 pr-8"
                style={{ animation: "marquee 50s linear infinite" }}
              >
                {[...universities, ...universities].map((u, i) => (
                  <span
                    key={`u-${i}`}
                    className="shrink-0 font-display text-2xl font-medium tracking-tight text-white/35 transition-colors hover:text-white/85 sm:text-3xl"
                  >
                    {u}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Pull-quote — editorial moment */}
        <FadeIn delay={0.1} className="mx-auto mt-24 max-w-3xl lg:mt-32">
          {/* Mobile: left-border card. Desktop: centered editorial block */}
          <div className="border-l-2 border-brand-400/40 pl-6 sm:border-0 sm:pl-0 sm:text-center">
            <span className="hidden font-display text-6xl text-brand-400/60 serif-italic sm:inline">&ldquo;</span>
            <p className="font-display text-display-sm font-medium text-gradient-editorial [text-wrap:balance]">
              <span className="serif-italic text-brand-300 sm:hidden">&ldquo;</span>
              A movement, not a meetup. You can feel it in every session, every post,
              every introduction.
              <span className="serif-italic text-brand-300 sm:hidden">&rdquo;</span>
            </p>
            <p className="mt-6 text-xs uppercase tracking-[0.22em] text-white/40">
              — Tanvir Hasan · Campus Lead · AIUB
            </p>
          </div>
        </FadeIn>
      </Container>
    </Section>
  );
}
