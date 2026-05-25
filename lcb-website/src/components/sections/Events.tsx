"use client";

import { useState, useMemo } from "react";
import { ArrowUpRight, Calendar, MapPin, ChevronLeft, ChevronRight, ChevronDown, Search, X } from "lucide-react";
import { EventImage } from "@/components/ui/EventImage";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { Stagger } from "@/components/motion/Stagger";
import { FadeIn } from "@/components/motion/FadeIn";
import { SafeHtml } from "@/components/ui/RichTextEditor";
import { events as staticEvents, type Event } from "@/content/events";
import { cn } from "@/lib/utils";

const PAST_PER_PAGE   = 4;
const FORMATS         = ["Online", "On-Campus", "Hybrid"] as const;

export function Events({ liveEvents }: { liveEvents?: Event[] }) {
  const [pastPage,  setPastPage]  = useState(1);
  const [pastOpen,  setPastOpen]  = useState(false);
  const [query,     setQuery]     = useState("");
  const [fmtFilter, setFmtFilter] = useState<string>("All");

  const source = (liveEvents ?? staticEvents).filter((e) => e.published !== false);

  // Search + format filter applied first
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return source.filter((e) => {
      if (fmtFilter !== "All" && e.format !== fmtFilter) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        (e.speaker?.name ?? "").toLowerCase().includes(q)
      );
    });
  }, [source, query, fmtFilter]);

  const upcoming = useMemo(() =>
    [...filtered]
      .filter((e) => e.status !== "past")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [filtered]
  );

  const past = useMemo(() =>
    [...filtered]
      .filter((e) => e.status === "past")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [filtered]
  );

  const pastTotalPages = Math.max(1, Math.ceil(past.length / PAST_PER_PAGE));
  const pastVisible    = past.slice((pastPage - 1) * PAST_PER_PAGE, pastPage * PAST_PER_PAGE);

  // Reset pagination when filter changes
  function changeFilter(fmt: string) {
    setFmtFilter(fmt);
    setPastPage(1);
  }
  function changeQuery(q: string) {
    setQuery(q);
    setPastPage(1);
  }

  const hasFilters = query || fmtFilter !== "All";
  const noResults  = filtered.length === 0 && hasFilters;

  return (
    <Section id="events">
      <Container>
        <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={<Eyebrow>Events</Eyebrow>}
            title={
              <>
                Sessions that{" "}
                <span className="serif-italic">change trajectories.</span>
              </>
            }
            description="Masterclasses, fireside chats and networking nights — most weeks, most universities."
            maxWidth="medium"
          />
          <FadeIn className="hidden items-center gap-3 lg:flex">
            <span className="h-px w-12 bg-gradient-to-r from-brand-400 to-transparent" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">
              Q2 — Q3 · 2026
            </span>
          </FadeIn>
        </div>

        {/* ── Search + Format filter ─────────────────────────────────────── */}
        <FadeIn className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" strokeWidth={1.75} />
            <input
              type="text"
              value={query}
              onChange={(e) => changeQuery(e.target.value)}
              placeholder="Search events…"
              className="w-full rounded-full border border-white/[0.08] bg-white/[0.04] py-2 pl-10 pr-9 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-brand-400/40 focus:bg-white/[0.06]"
            />
            {query && (
              <button
                onClick={() => changeQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Format filter pills */}
          <div className="flex flex-wrap gap-1.5">
            {(["All", ...FORMATS] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => changeFilter(fmt)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200",
                  fmtFilter === fmt
                    ? "bg-brand-500 text-white shadow-glow"
                    : "border border-white/[0.08] bg-white/[0.03] text-white/50 hover:border-white/[0.14] hover:text-white"
                )}
              >
                {fmt}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* ── No-results state ──────────────────────────────────────────── */}
        {noResults ? (
          <FadeIn>
            <div className="mt-16 rounded-2xl border border-white/[0.06] bg-white/[0.02] py-14 text-center">
              <p className="text-sm text-white/40">
                No events match <span className="text-white/70">&ldquo;{query}&rdquo;</span>.
              </p>
              <button
                onClick={() => { changeQuery(""); changeFilter("All"); }}
                className="mt-4 text-sm text-brand-300 hover:underline"
              >
                Clear filters
              </button>
            </div>
          </FadeIn>
        ) : (
          <>
            {/* ── Upcoming / Live events ─────────────────────────────────── */}
            {upcoming.length > 0 ? (
              <Stagger className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
                {upcoming.map((event, i) => (
                  <FadeIn key={event.id} className={cn(i === 0 && "md:col-span-2")}>
                    <EventCard event={event} featured={i === 0} />
                  </FadeIn>
                ))}
              </Stagger>
            ) : !hasFilters ? (
              <FadeIn>
                <div className="mt-16 rounded-2xl border border-white/[0.06] bg-white/[0.02] py-14 text-center">
                  <p className="text-sm text-white/40">
                    No upcoming events right now — check back soon.
                  </p>
                </div>
              </FadeIn>
            ) : null}

            {/* ── Past Sessions ──────────────────────────────────────────── */}
            {past.length > 0 && (
              <div className="mt-16 border-t border-white/[0.06] pt-10">
                <button
                  onClick={() => setPastOpen((o) => !o)}
                  className="group flex w-full items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-4 text-left transition-colors duration-200 hover:bg-white/[0.04] sm:px-8"
                  aria-expanded={pastOpen}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-white/35">Archive</span>
                    <span className="font-display text-lg font-medium text-white/70 transition-colors group-hover:text-white/90">
                      Past Sessions
                    </span>
                    <span className="rounded-full border border-white/[0.10] bg-white/[0.06] px-2.5 py-0.5 text-xs font-medium text-white/50">
                      {past.length}
                    </span>
                  </div>
                  <ChevronDown className={cn("h-5 w-5 shrink-0 text-white/40 transition-transform duration-300", pastOpen && "rotate-180")} />
                </button>

                {pastOpen && (
                  <div className="mt-8">
                    {pastTotalPages > 1 && (
                      <div className="mb-8 flex justify-end">
                        <Pagination current={pastPage} total={pastTotalPages} onChange={setPastPage} />
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      {pastVisible.map((event) => (
                        <EventCard key={event.id} event={event} featured={false} />
                      ))}
                    </div>
                    {pastTotalPages > 1 && (
                      <div className="mt-10 flex justify-center">
                        <Pagination current={pastPage} total={pastTotalPages} onChange={setPastPage} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Container>
    </Section>
  );
}

// ── EventCard ─────────────────────────────────────────────────────────────────

function EventCard({ event, featured }: { event: Event; featured: boolean }) {
  return (
    <GlassCard as="article" className="group flex h-full flex-col overflow-hidden">
      <div className="relative">
        <EventImage
          src={event.image}
          alt={event.title}
          aspect={featured ? "16/9" : "16/10"}
          objectPosition={featured ? "center 35%" : "center 40%"}
          priority={featured}
          sizes={featured ? "(max-width: 768px) 100vw, 100vw" : "(max-width: 768px) 100vw, 50vw"}
          overlay="medium"
        />
        <div className="absolute left-5 top-5 z-10 flex items-center gap-2">
          <StatusPill status={event.status} />
          <span className="rounded-full border border-white/[0.12] bg-black/30 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-white/80 backdrop-blur">
            {event.format}
          </span>
        </div>
        {featured && event.status !== "past" && (
          <div className="absolute right-5 top-5 z-10 flex items-center gap-2 rounded-full border border-brand-400/40 bg-brand-500/20 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-brand-200 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-300 shadow-[0_0_8px_rgba(79,156,235,0.8)]" />
            Next up
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-8">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-white/45">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
            {event.dateLabel}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
            {event.location}
          </span>
        </div>

        <h3 className={cn("mt-4 font-display font-medium text-white", featured ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl")}>
          {event.title}
        </h3>

        <SafeHtml
          html={event.description}
          className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-white/55"
        />

        <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-5">
          <div className="flex flex-col">
            {event.partner && (
              <span className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                With {event.partner}
              </span>
            )}
            {event.speaker && (
              <span className="mt-1 text-sm text-white/75">
                {event.speaker.name} · <span className="text-white/50">{event.speaker.role}</span>
              </span>
            )}
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] text-white/70 transition-all duration-300 group-hover:border-brand-400/40 group-hover:text-white group-hover:shadow-glow">
            <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
          </span>
        </div>
      </div>
    </GlassCard>
  );
}

// ── StatusPill ────────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: "upcoming" | "past" | "live" }) {
  const config = {
    upcoming: { label: "Upcoming", color: "bg-brand-400" },
    live:     { label: "Live now", color: "bg-rose-400" },
    past:     { label: "Past",     color: "bg-white/40" },
  }[status];

  return (
    <span className="flex items-center gap-2 rounded-full border border-white/[0.12] bg-black/30 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-white/90 backdrop-blur">
      <span className={cn("h-1.5 w-1.5 rounded-full", config.color)} />
      {config.label}
    </span>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center gap-1.5" role="navigation" aria-label="Past events pagination">
      <button onClick={() => onChange(Math.max(1, current - 1))} disabled={current === 1} aria-label="Previous page"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] text-white/40 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-30 hover:border-white/[0.18] hover:text-white">
        <ChevronLeft className="h-4 w-4" />
      </button>
      {Array.from({ length: total }, (_, i) => i + 1).map((page) => (
        <button key={page} onClick={() => onChange(page)} aria-label={`Page ${page}`} aria-current={page === current ? "page" : undefined}
          className={cn("flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-200",
            page === current
              ? "bg-brand-400 text-white shadow-[0_0_16px_rgba(79,156,235,0.35)]"
              : "border border-white/[0.08] text-white/50 hover:border-white/[0.18] hover:text-white"
          )}>
          {page}
        </button>
      ))}
      <button onClick={() => onChange(Math.min(total, current + 1))} disabled={current === total} aria-label="Next page"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] text-white/40 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-30 hover:border-white/[0.18] hover:text-white">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
