"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { Stagger } from "@/components/motion/Stagger";
import { FadeIn } from "@/components/motion/FadeIn";
import { news, type NewsItem } from "@/content/news";
import { cn } from "@/lib/utils";

/** Items visible per page: 1 featured large card + up to 3 secondary */
const NEWS_PER_PAGE = 4;

export function News() {
  const [page, setPage] = useState(1);

  // Always sort newest first — no need to maintain order in news.ts
  const sorted = [...news].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / NEWS_PER_PAGE));
  const pageItems = sorted.slice(
    (page - 1) * NEWS_PER_PAGE,
    page * NEWS_PER_PAGE
  );

  // Page 1: honour the explicit  featured: true  flag.
  // Other pages: treat first item on that page as featured.
  const featured =
    page === 1
      ? (pageItems.find((n) => n.featured) ?? pageItems[0])
      : pageItems[0];
  const rest = pageItems.filter((n) => n.id !== featured?.id);

  return (
    <Section id="news">
      <Container>
        <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={<Eyebrow>Newsroom</Eyebrow>}
            title={
              <>
                The latest from{" "}
                <span className="serif-italic">the community.</span>
              </>
            }
            description="Milestones, partnerships and announcements — straight from LCB."
            maxWidth="medium"
          />
          <FadeIn className="hidden items-center gap-3 lg:flex">
            <span className="h-px w-12 bg-gradient-to-r from-brand-400 to-transparent" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">
              Updated weekly
            </span>
          </FadeIn>
        </div>

        {/* ── News grid ───────────────────────────────────────────────────── */}
        {featured && (
          <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Featured — large card */}
            <FadeIn className="lg:col-span-7">
              <GlassCard as="article" className="group h-full overflow-hidden">
                <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/10]">
                  <Image
                    src={featured.image}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-100 via-ink-100/30 to-transparent" />
                  <span className="absolute left-5 top-5 rounded-full border border-white/[0.14] bg-black/40 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white/90 backdrop-blur">
                    {featured.category}
                  </span>
                </div>
                <div className="p-8 sm:p-10">
                  <div className="flex items-center gap-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                      {featured.dateLabel}
                    </p>
                    <span className="h-[3px] w-[3px] rounded-full bg-white/30" />
                    <p className="text-xs uppercase tracking-[0.18em] text-brand-300">
                      Featured
                    </p>
                  </div>
                  <h3 className="mt-4 font-display text-3xl font-medium text-white sm:text-4xl [text-wrap:balance]">
                    {featured.title}
                  </h3>
                  <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/55">
                    {featured.summary}
                  </p>
                  {featured.social && (
                    <SocialLinks social={featured.social} size="md" />
                  )}
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-brand-300 transition-colors group-hover:text-white">
                    Read the full story
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </GlassCard>
            </FadeIn>

            {/* Secondary stack */}
            <Stagger stagger={0.1} className="space-y-6 lg:col-span-5">
              {rest.map((item) => (
                <FadeIn key={item.id}>
                  <GlassCard as="article" className="group flex gap-5 p-5 sm:p-6">
                    {/* Thumbnail */}
                    <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-2xl sm:w-32">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="160px"
                        className="object-cover transition-transform duration-[1500ms] group-hover:scale-105"
                      />
                      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/[0.06]" />
                    </div>
                    {/* Text */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-brand-300">
                            {item.category}
                          </span>
                          <span className="h-[3px] w-[3px] rounded-full bg-white/30" />
                          <span className="text-[11px] uppercase tracking-[0.15em] text-white/40">
                            {item.dateLabel}
                          </span>
                        </div>
                        <h4 className="mt-2 line-clamp-2 font-display text-base font-medium text-white sm:text-lg [text-wrap:balance]">
                          {item.title}
                        </h4>
                        <p className="mt-1.5 line-clamp-2 text-sm text-white/55">
                          {item.summary}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/55 transition-colors group-hover:text-brand-300">
                          Read more
                          <ArrowUpRight
                            className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            strokeWidth={2}
                          />
                        </span>
                        {item.social && (
                          <SocialLinks social={item.social} size="sm" />
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </FadeIn>
              ))}
            </Stagger>
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <Pagination current={page} total={totalPages} onChange={setPage} />
          </div>
        )}
      </Container>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Social link pills — LinkedIn / Facebook / Instagram
// ─────────────────────────────────────────────────────────────────────────────

type SocialLinksProps = {
  social: NonNullable<NewsItem["social"]>;
  size: "md" | "sm";
};

function SocialLinks({ social, size }: SocialLinksProps) {
  if (size === "md") {
    return (
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {social.linkedin && (
          <a
            href={social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-white/55 transition-all duration-200 hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]"
          >
            <LinkedInIcon className="h-3 w-3" />
            LinkedIn
          </a>
        )}
        {social.facebook && (
          <a
            href={social.facebook}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-white/55 transition-all duration-200 hover:border-[#1877F2]/50 hover:bg-[#1877F2]/10 hover:text-[#1877F2]"
          >
            <FacebookIcon className="h-3 w-3" />
            Facebook
          </a>
        )}
        {social.instagram && (
          <a
            href={social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-white/55 transition-all duration-200 hover:border-[#E1306C]/50 hover:bg-[#E1306C]/10 hover:text-[#E1306C]"
          >
            <InstagramIcon className="h-3 w-3" />
            Instagram
          </a>
        )}
      </div>
    );
  }

  // sm — icon-only circles for secondary cards
  return (
    <div className="flex items-center gap-1.5">
      {social.linkedin && (
        <a
          href={social.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="LinkedIn"
          className="flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white/35 transition-all duration-200 hover:border-[#0A66C2]/50 hover:text-[#0A66C2]"
        >
          <LinkedInIcon className="h-3 w-3" />
        </a>
      )}
      {social.facebook && (
        <a
          href={social.facebook}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="Facebook"
          className="flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white/35 transition-all duration-200 hover:border-[#1877F2]/50 hover:text-[#1877F2]"
        >
          <FacebookIcon className="h-3 w-3" />
        </a>
      )}
      {social.instagram && (
        <a
          href={social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="Instagram"
          className="flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white/35 transition-all duration-200 hover:border-[#E1306C]/50 hover:text-[#E1306C]"
        >
          <InstagramIcon className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

// ── Brand SVG icons ──────────────────────────────────────────────────────────

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagination — numbered buttons with prev/next arrows
// ─────────────────────────────────────────────────────────────────────────────

function Pagination({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (page: number) => void;
}) {
  return (
    <div
      className="flex items-center gap-1.5"
      role="navigation"
      aria-label="Newsroom pagination"
    >
      <button
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
        aria-label="Previous page"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] text-white/40 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-30 hover:border-white/[0.18] hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          aria-label={`Page ${p}`}
          aria-current={p === current ? "page" : undefined}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-200",
            p === current
              ? "bg-brand-400 text-white shadow-[0_0_16px_rgba(79,156,235,0.35)]"
              : "border border-white/[0.08] text-white/50 hover:border-white/[0.18] hover:text-white"
          )}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onChange(Math.min(total, current + 1))}
        disabled={current === total}
        aria-label="Next page"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] text-white/40 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-30 hover:border-white/[0.18] hover:text-white"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
