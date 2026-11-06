"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  Link2,
  Search,
  X,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { Stagger } from "@/components/motion/Stagger";
import { FadeIn } from "@/components/motion/FadeIn";
import { SafeHtml } from "@/components/ui/RichTextEditor";
import { news as staticNews, type NewsItem, type NewsCategory } from "@/content/news";
import { cn } from "@/lib/utils";

/** Items visible per page: 1 featured large card + up to 3 secondary */
const NEWS_PER_PAGE = 4;
const CATEGORIES: NewsCategory[] = ["Announcement", "Event", "Milestone", "Partnership", "Spotlight"];

const CATEGORY_STYLES: Record<NewsCategory, { badge: string; text: string }> = {
  Announcement: {
    badge: "border-blue-400/30 bg-blue-500/15 text-blue-300",
    text: "text-blue-300",
  },
  Event: {
    badge: "border-purple-400/30 bg-purple-500/15 text-purple-300",
    text: "text-purple-300",
  },
  Milestone: {
    badge: "border-amber-400/30 bg-amber-500/15 text-amber-300",
    text: "text-amber-300",
  },
  Partnership: {
    badge: "border-emerald-400/30 bg-emerald-500/15 text-emerald-300",
    text: "text-emerald-300",
  },
  Spotlight: {
    badge: "border-pink-400/30 bg-pink-500/15 text-pink-300",
    text: "text-pink-300",
  },
};

export function getNewsStoryUrl(item: NewsItem): string {
  if (item.href && item.href.trim()) return item.href.trim();
  if (item.social?.linkedin && item.social.linkedin.trim()) return item.social.linkedin.trim();
  if (item.social?.facebook && item.social.facebook.trim()) return item.social.facebook.trim();
  if (item.social?.instagram && item.social.instagram.trim()) return item.social.instagram.trim();
  return "";
}

export function isExternalUrl(url?: string): boolean {
  if (!url) return false;
  return url.startsWith("http://") || url.startsWith("https://");
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback below
  }
  try {
    if (typeof document !== "undefined") {
      const input = document.createElement("textarea");
      input.value = text;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.focus();
      input.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(input);
      return successful;
    }
  } catch {
    // ignore
  }
  return false;
}

export function News({ liveNews }: { liveNews?: NewsItem[] }) {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState<NewsCategory | "All">("All");
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const source = (liveNews ?? staticNews).filter((n) => n.published !== false);

  // Search + category filter
  const sorted = useMemo(() => {
    const q = query.toLowerCase().trim();
    const base = source.filter((n) => {
      if (catFilter !== "All" && n.category !== catFilter) return false;
      if (!q) return true;
      return (
        n.title.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q)
      );
    });
    return [...base].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [source, query, catFilter]);

  // Deep linking and anchor scroll support
  useEffect(() => {
    if (typeof window === "undefined") return;

    function handleHash() {
      const hash = window.location.hash.replace("#", "");
      if (!hash || hash === "news") return;
      const targetId = hash.startsWith("news-") ? hash.replace("news-", "") : hash;
      const index = sorted.findIndex((n) => n.id === targetId);
      if (index !== -1) {
        const targetPage = Math.floor(index / NEWS_PER_PAGE) + 1;
        setPage(targetPage);
        setTimeout(() => {
          const el = document.getElementById(`news-${targetId}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            setHighlightedId(targetId);
            setTimeout(() => setHighlightedId(null), 3500);
          }
        }, 150);
      }
    }

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [sorted]);

  function changeFilter(cat: NewsCategory | "All") {
    setCatFilter(cat);
    setPage(1);
  }
  function changeQuery(q: string) {
    setQuery(q);
    setPage(1);
  }

  const hasFilters = query || catFilter !== "All";
  const noResults  = sorted.length === 0 && hasFilters;

  const totalPages = Math.max(1, Math.ceil(sorted.length / NEWS_PER_PAGE));
  const pageItems  = sorted.slice((page - 1) * NEWS_PER_PAGE, page * NEWS_PER_PAGE);

  // Page 1: honour the explicit featured: true flag.
  // Other pages: treat first item on that page as featured.
  const featured =
    page === 1
      ? (pageItems.find((n) => n.featured) ?? pageItems[0])
      : pageItems[0];
  const rest = pageItems.filter((n) => n.id !== featured?.id);

  const featuredStoryUrl = featured ? getNewsStoryUrl(featured) : "";
  const isFeaturedExternal = isExternalUrl(featuredStoryUrl);

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

        {/* ── Search + Category filter ─────────────────────────────────────── */}
        <FadeIn className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" strokeWidth={1.75} />
            <input
              type="text"
              value={query}
              onChange={(e) => changeQuery(e.target.value)}
              placeholder="Search news…"
              className="w-full rounded-full border border-white/[0.08] bg-white/[0.04] py-2 pl-10 pr-9 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-brand-400/40 focus:bg-white/[0.06]"
            />
            {query && (
              <button onClick={() => changeQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white" aria-label="Clear search">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["All", ...CATEGORIES] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => changeFilter(cat as NewsCategory | "All")}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200",
                  catFilter === cat
                    ? "bg-brand-500 text-white shadow-glow"
                    : "border border-white/[0.08] bg-white/[0.03] text-white/50 hover:border-white/[0.14] hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* ── No-results ──────────────────────────────────────────────────── */}
        {noResults && (
          <FadeIn>
            <div className="mt-12 rounded-2xl border border-white/[0.06] bg-white/[0.02] py-14 text-center">
              <p className="text-sm text-white/40">No news matches <span className="text-white/70">&ldquo;{query}&rdquo;</span>.</p>
              <button onClick={() => { changeQuery(""); changeFilter("All"); }} className="mt-4 text-sm text-brand-300 hover:underline">
                Clear filters
              </button>
            </div>
          </FadeIn>
        )}

        {/* ── News grid ───────────────────────────────────────────────────── */}
        {!noResults && featured && (
          <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Featured — large card */}
            <FadeIn className="lg:col-span-7">
              <GlassCard
                as="article"
                id={`news-${featured.id}`}
                className={cn(
                  "group h-full overflow-hidden transition-all duration-300",
                  highlightedId === featured.id && "ring-2 ring-brand-400 shadow-[0_0_35px_rgba(79,156,235,0.45)]"
                )}
              >
                {/* Thumbnail / cover */}
                <div
                  className="group/feat relative aspect-[4/3] cursor-pointer overflow-hidden sm:aspect-[16/10]"
                  onClick={() => setSelectedItem(featured)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSelectedItem(featured);
                  }}
                  aria-label={`Preview full story: ${featured.title}`}
                >
                  <Image
                    src={featured.image}
                    alt={featured.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    unoptimized={featured.image.endsWith(".svg")}
                    className="object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-100 via-ink-100/30 to-transparent" />
                  <span
                    className={cn(
                      "absolute left-5 top-5 rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] backdrop-blur",
                      CATEGORY_STYLES[featured.category]?.badge ?? "border-white/[0.14] bg-black/40 text-white/90"
                    )}
                  >
                    {featured.category}
                  </span>
                  <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-white/[0.14] bg-black/50 px-3 py-1 text-[11px] font-medium text-white/80 opacity-0 backdrop-blur transition-opacity duration-300 group-hover/feat:opacity-100">
                    <Eye className="h-3.5 w-3.5" />
                    Quick view
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
                    {isFeaturedExternal ? (
                      <a
                        href={featuredStoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:text-brand-200 focus-visible:outline-none focus-visible:underline"
                      >
                        {featured.title}
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedItem(featured)}
                        className="text-left transition-colors hover:text-brand-200 focus-visible:outline-none focus-visible:underline"
                      >
                        {featured.title}
                      </button>
                    )}
                  </h3>

                  <SafeHtml
                    html={featured.summary}
                    className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/55"
                  />

                  {/* Action & Links Footer */}
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.06] pt-5">
                    <div className="flex flex-wrap items-center gap-3">
                      {isFeaturedExternal ? (
                        <a
                          href={featuredStoryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-brand-400/30 bg-brand-500/15 px-4 py-2 text-sm font-medium text-brand-300 transition-all hover:border-brand-400/50 hover:bg-brand-500/25 hover:text-white hover:shadow-glow focus-visible:outline-none focus-visible:underline"
                        >
                          Read the full story
                          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedItem(featured)}
                          className="inline-flex items-center gap-2 rounded-xl border border-brand-400/30 bg-brand-500/15 px-4 py-2 text-sm font-medium text-brand-300 transition-all hover:border-brand-400/50 hover:bg-brand-500/25 hover:text-white hover:shadow-glow"
                        >
                          Read the full story
                          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedItem(featured)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.10] bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-white/60 transition-all hover:border-white/[0.20] hover:bg-white/[0.07] hover:text-white"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Quick view
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <SocialLinks social={featured.social} href={featured.href} size="md" />
                      <CopyLinkButton
                        url={featuredStoryUrl}
                        itemId={featured.id}
                        title={featured.title}
                        size="md"
                      />
                    </div>
                  </div>
                </div>
              </GlassCard>
            </FadeIn>

            {/* Secondary stack */}
            <Stagger stagger={0.1} className="space-y-6 lg:col-span-5">
              {rest.map((item) => {
                const itemStoryUrl = getNewsStoryUrl(item);
                const isItemExternal = isExternalUrl(itemStoryUrl);

                return (
                  <FadeIn key={item.id}>
                    <GlassCard
                      as="article"
                      id={`news-${item.id}`}
                      className={cn(
                        "group flex gap-5 p-5 sm:p-6 transition-all duration-300",
                        highlightedId === item.id && "ring-2 ring-brand-400 shadow-[0_0_35px_rgba(79,156,235,0.45)]"
                      )}
                    >
                      {/* Thumbnail */}
                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className="group/img relative aspect-square w-24 shrink-0 overflow-hidden rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 sm:w-32"
                        aria-label={`Preview ${item.title}`}
                      >
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="160px"
                          unoptimized={item.image.endsWith(".svg")}
                          className="object-cover transition-transform duration-[1500ms] group-hover:scale-105"
                        />
                        <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/[0.06]" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover/img:opacity-100">
                          <Eye className="h-5 w-5 text-white/90 drop-shadow" />
                        </div>
                      </button>

                      {/* Text content */}
                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className={cn("text-[10px] font-medium uppercase tracking-[0.18em]", CATEGORY_STYLES[item.category]?.text ?? "text-brand-300")}>
                              {item.category}
                            </span>
                            <span className="h-[3px] w-[3px] rounded-full bg-white/30" />
                            <span className="text-[11px] uppercase tracking-[0.15em] text-white/40">
                              {item.dateLabel}
                            </span>
                          </div>

                          <h4 className="mt-2 line-clamp-2 font-display text-base font-medium text-white sm:text-lg [text-wrap:balance]">
                            {isItemExternal ? (
                              <a
                                href={itemStoryUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="transition-colors hover:text-brand-300 focus-visible:outline-none focus-visible:underline"
                              >
                                {item.title}
                              </a>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setSelectedItem(item)}
                                className="text-left transition-colors hover:text-brand-300 focus-visible:outline-none focus-visible:underline"
                              >
                                {item.title}
                              </button>
                            )}
                          </h4>

                          <SafeHtml html={item.summary} className="mt-1.5 line-clamp-2 text-sm text-white/55" />
                        </div>

                        {/* Secondary Card Footer */}
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.04] pt-2 sm:pt-3">
                          <div className="flex items-center gap-2">
                            {isItemExternal ? (
                              <a
                                href={itemStoryUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-white/60 transition-colors hover:text-brand-300 group-hover:text-brand-300 focus-visible:outline-none focus-visible:underline"
                              >
                                Read more
                                <ArrowUpRight
                                  className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                  strokeWidth={2}
                                />
                              </a>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setSelectedItem(item)}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-white/60 transition-colors hover:text-brand-300 group-hover:text-brand-300"
                              >
                                Read more
                                <ArrowUpRight
                                  className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                  strokeWidth={2}
                                />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setSelectedItem(item)}
                              className="text-[11px] text-white/35 transition-colors hover:text-white/70"
                              title="Quick preview details"
                            >
                              · Preview
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <SocialLinks social={item.social} href={item.href} size="sm" />
                            <CopyLinkButton
                              url={itemStoryUrl}
                              itemId={item.id}
                              title={item.title}
                              size="sm"
                            />
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </FadeIn>
                );
              })}
            </Stagger>
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <Pagination current={page} total={totalPages} onChange={setPage} />
          </div>
        )}

        {/* ── Story Details Modal ─────────────────────────────────────────── */}
        {selectedItem && (
          <NewsModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </Container>
    </Section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Copy Link Button Component
// ─────────────────────────────────────────────────────────────────────────────

function CopyLinkButton({
  url,
  itemId,
  title,
  size = "sm",
}: {
  url?: string;
  itemId: string;
  title: string;
  size?: "sm" | "md";
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const linkToCopy =
      typeof window !== "undefined"
        ? `${window.location.origin}/news/${itemId}`
        : `https://www.linkedincommunitybangladesh.com/news/${itemId}`;

    const ok = await copyToClipboard(linkToCopy);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (size === "md") {
    return (
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy link for ${title}`}
        title={copied ? "Link copied to clipboard!" : "Copy link"}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all duration-200",
          copied
            ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
            : "border-white/[0.10] bg-white/[0.04] text-white/55 hover:border-white/[0.22] hover:bg-white/[0.08] hover:text-white"
        )}
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 text-emerald-400" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Link2 className="h-3 w-3" />
            <span>Copy link</span>
          </>
        )}
      </button>
    );
  }

  // sm size: circle icon matching social icon pills
  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copy link for ${title}`}
      title={copied ? "Link copied to clipboard!" : "Copy link"}
      className={cn(
        "flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-200",
        copied
          ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
          : "border-white/[0.08] bg-white/[0.03] text-white/35 hover:border-white/[0.22] hover:text-white"
      )}
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Link2 className="h-3 w-3" />}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Story Details Modal Component
// ─────────────────────────────────────────────────────────────────────────────

function NewsModal({
  item,
  onClose,
}: {
  item: NewsItem;
  onClose: () => void;
}) {
  const storyUrl = getNewsStoryUrl(item);
  const isExternal = isExternalUrl(storyUrl);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const siteLink = typeof window !== "undefined"
    ? `${window.location.origin}/news/${item.id}`
    : `https://www.linkedincommunitybangladesh.com/news/${item.id}`;

  const shareTargetUrl = siteLink;
  const encodedUrl = encodeURIComponent(shareTargetUrl);
  const encodedTitle = encodeURIComponent(item.title);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${item.title}\n${shareTargetUrl}`)}`;

  const handleCopyLink = async () => {
    const ok = await copyToClipboard(shareTargetUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/[0.12] bg-[#090d1f] shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.12] bg-black/60 text-white/70 backdrop-blur transition hover:bg-black/80 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="overflow-y-auto">
          {/* Cover image */}
          {item.image && (
            <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-black/30">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 672px) 100vw, 672px"
                unoptimized={item.image.endsWith(".svg")}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090d1f] via-transparent to-transparent" />
              <div className="absolute left-5 top-5 flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] backdrop-blur",
                    CATEGORY_STYLES[item.category]?.badge ?? "border-white/[0.14] bg-black/50 text-white/90"
                  )}
                >
                  {item.category}
                </span>
                {item.featured && (
                  <span className="rounded-full border border-brand-400/40 bg-brand-500/30 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-brand-200 backdrop-blur">
                    Featured
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/40">
              <Calendar className="h-3.5 w-3.5 text-white/40" />
              <span>{item.dateLabel}</span>
            </div>

            <h2 className="mt-3 font-display text-2xl font-medium text-white sm:text-3xl leading-snug">
              {item.title}
            </h2>

            <div className="mt-5 border-t border-white/[0.06] pt-5">
              <SafeHtml
                html={item.summary}
                className="prose prose-invert prose-sm max-w-none text-white/75 prose-headings:text-white prose-a:text-brand-300 prose-strong:text-white/90 text-[15px] leading-relaxed"
              />
            </div>

            {/* Official Source Links */}
            {(item.social || item.href) && (
              <div className="mt-6 border-t border-white/[0.06] pt-5">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-white/40">Official Links & Sources</p>
                <SocialLinks social={item.social} href={item.href} size="md" />
              </div>
            )}

            {/* Actions Footer */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-6">
              <div className="flex flex-wrap items-center gap-2">
                {isExternal && (
                  <a
                    href={storyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-glow transition hover:bg-brand-400"
                  >
                    Open original story
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium transition",
                    copied
                      ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                      : "border-white/[0.10] bg-white/[0.04] text-white/70 hover:border-white/[0.22] hover:bg-white/[0.08] hover:text-white"
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Link copied!</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="h-3.5 w-3.5" />
                      <span>Copy link</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Share buttons */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-white/35 mr-1">Share:</span>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Share on WhatsApp"
                  className="flex h-8 items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-xs text-white/55 transition hover:border-[#25D366]/40 hover:bg-[#25D366]/15 hover:text-[#25D366]"
                >
                  <WhatsAppIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Share on LinkedIn"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/45 transition hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/15 hover:text-[#0A66C2]"
                >
                  <LinkedInIcon className="h-3.5 w-3.5" />
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Share on Facebook"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/45 transition hover:border-[#1877F2]/40 hover:bg-[#1877F2]/15 hover:text-[#1877F2]"
                >
                  <FacebookIcon className="h-3.5 w-3.5" />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Share on X"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/45 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
                >
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Social link pills — LinkedIn / Facebook / Instagram / Website
// ─────────────────────────────────────────────────────────────────────────────

type SocialLinksProps = {
  social?: NewsItem["social"];
  href?: string;
  size: "md" | "sm";
};

function SocialLinks({ social, href, size }: SocialLinksProps) {
  const hasSocial = social && (social.linkedin || social.facebook || social.instagram);
  const showHref = href && isExternalUrl(href) && (!social?.linkedin || href !== social.linkedin);

  if (!hasSocial && !showHref) return null;

  if (size === "md") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {social?.linkedin && (
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
        {social?.facebook && (
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
        {social?.instagram && (
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
        {showHref && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-white/55 transition-all duration-200 hover:border-brand-400/50 hover:bg-brand-500/10 hover:text-brand-300"
          >
            <ExternalLink className="h-3 w-3" />
            Article
          </a>
        )}
      </div>
    );
  }

  // sm — icon-only circles for secondary cards
  return (
    <div className="flex items-center gap-1.5">
      {social?.linkedin && (
        <a
          href={social.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="Open LinkedIn Post"
          className="flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white/35 transition-all duration-200 hover:border-[#0A66C2]/50 hover:text-[#0A66C2]"
        >
          <LinkedInIcon className="h-3 w-3" />
        </a>
      )}
      {social?.facebook && (
        <a
          href={social.facebook}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="Open Facebook Post"
          className="flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white/35 transition-all duration-200 hover:border-[#1877F2]/50 hover:text-[#1877F2]"
        >
          <FacebookIcon className="h-3 w-3" />
        </a>
      )}
      {social?.instagram && (
        <a
          href={social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="Open Instagram Post"
          className="flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white/35 transition-all duration-200 hover:border-[#E1306C]/50 hover:text-[#E1306C]"
        >
          <InstagramIcon className="h-3 w-3" />
        </a>
      )}
      {showHref && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="Open External Article"
          className="flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white/35 transition-all duration-200 hover:border-brand-400/50 hover:text-brand-300"
        >
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

// ── Brand SVG icons ──────────────────────────────────────────────────────────

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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
