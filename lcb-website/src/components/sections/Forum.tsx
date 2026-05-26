"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, Search, Calendar, Building2, Tag } from "lucide-react";
import type { Article } from "@/content/articles";
import { SafeHtml } from "@/components/ui/RichTextEditor";

interface Props {
  articles: Article[];
}

function AuthorAvatar({
  photo,
  name,
  size = 40,
}: {
  photo?: string;
  name: string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  if (photo) {
    return (
      <div
        className="relative shrink-0 overflow-hidden rounded-full border border-white/10"
        style={{ width: size, height: size }}
      >
        <Image src={photo} alt={name} fill className="object-cover" />
      </div>
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-brand-300 font-semibold border border-brand-500/20"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

function ArticleCard({
  article,
  onClick,
  featured = false,
}: {
  article: Article;
  onClick: () => void;
  featured?: boolean;
}) {
  if (featured) {
    return (
      <button
        onClick={onClick}
        className="group relative w-full overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] text-left transition-all duration-300 hover:border-brand-400/25 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      >
        {article.coverImage && (
          <div className="relative h-64 w-full overflow-hidden">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#040614] via-[#040614]/40 to-transparent" />
          </div>
        )}
        <div className="p-6 md:p-8">
          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {article.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-brand-500/10 px-2.5 py-0.5 text-[11px] font-medium text-brand-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h3 className="text-xl font-bold text-white md:text-2xl leading-snug group-hover:text-brand-200 transition-colors">
            {article.title}
          </h3>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/55">
            {article.excerpt}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <AuthorAvatar photo={article.authorPhoto} name={article.authorName} size={40} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white/90">{article.authorName}</p>
              <p className="truncate text-xs text-white/45">
                {article.authorDesignation}
                {article.authorCompany && ` · ${article.authorCompany}`}
              </p>
            </div>
            <span className="ml-auto shrink-0 text-xs text-white/35">{article.dateLabel}</span>
          </div>
        </div>

        {/* Featured badge */}
        <span className="absolute left-4 top-4 rounded-full bg-brand-500 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-glow">
          Featured
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="group flex w-full flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] text-left transition-all duration-300 hover:border-brand-400/20 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
    >
      {article.coverImage && (
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#040614]/60 to-transparent" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        {article.tags && article.tags.length > 0 && (
          <div className="mb-2.5 flex flex-wrap gap-1">
            {article.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-medium text-brand-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-white/90 group-hover:text-white transition-colors">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-white/45">
          {article.excerpt}
        </p>
        <div className="mt-4 flex items-center gap-2.5">
          <AuthorAvatar photo={article.authorPhoto} name={article.authorName} size={32} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white/80">{article.authorName}</p>
            <p className="truncate text-[11px] text-white/40">{article.authorDesignation}</p>
          </div>
          <span className="shrink-0 text-[11px] text-white/30">{article.dateLabel}</span>
        </div>
      </div>
    </button>
  );
}

function ArticleModal({
  article,
  onClose,
}: {
  article: Article;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/[0.10] bg-[#080d1e] shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.07] text-white/60 transition hover:bg-white/[0.12] hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto">
          {/* Cover image */}
          {article.coverImage && (
            <div className="relative h-56 w-full shrink-0 sm:h-72">
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080d1e] via-transparent to-transparent" />
            </div>
          )}

          <div className="p-6 sm:p-8">
            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-white/30" />
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-brand-500/10 px-2.5 py-0.5 text-[11px] font-medium text-brand-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h2 className="text-2xl font-bold leading-snug text-white sm:text-3xl">
              {article.title}
            </h2>

            {/* Author row */}
            <div className="mt-5 flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
              <AuthorAvatar photo={article.authorPhoto} name={article.authorName} size={52} />
              <div className="flex-1">
                <p className="font-semibold text-white">{article.authorName}</p>
                <p className="text-sm text-white/60">{article.authorDesignation}</p>
                {article.authorCompany && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-white/40">
                    <Building2 className="h-3 w-3" />
                    {article.authorCompany}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/35">
                <Calendar className="h-3.5 w-3.5" />
                {article.dateLabel}
              </div>
            </div>

            {/* Content */}
            <div className="mt-6 border-t border-white/[0.06] pt-6">
              <SafeHtml
                html={article.content}
                className="prose prose-invert prose-sm max-w-none text-white/75 prose-headings:text-white prose-a:text-brand-300 prose-strong:text-white/90"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Forum({ articles }: Props) {
  const [selected, setSelected] = useState<Article | null>(null);
  const [search, setSearch] = useState("");

  const published = useMemo(
    () => articles.filter((a) => a.published),
    [articles]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return published;
    const q = search.toLowerCase();
    return published.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.authorName.toLowerCase().includes(q) ||
        a.authorDesignation.toLowerCase().includes(q) ||
        (a.authorCompany ?? "").toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        (a.tags ?? []).some((t) => t.toLowerCase().includes(q))
    );
  }, [published, search]);

  const close = useCallback(() => setSelected(null), []);

  const featured = filtered.find((a) => a.featured);
  const rest = filtered.filter((a) => !a.featured);

  if (published.length === 0) return null;

  return (
    <>
      <section id="forum" className="relative py-24">
        {/* Section connector */}
        <span className="section-thread" aria-hidden />

        {/* Background ambient */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(10,102,194,0.3), transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-500/10 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                <span className="text-[11px] font-bold uppercase tracking-[0.20em] text-brand-300">
                  Community Forum
                </span>
              </div>
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Insights from the community
              </h2>
              <p className="mt-2 max-w-xl text-base text-white/50">
                Thought leadership, career stories, and professional wisdom from
                Bangladesh&apos;s top professionals.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                type="text"
                placeholder="Search articles…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-white/[0.08] bg-white/[0.04] py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/30 outline-none transition focus:border-brand-400/40 focus:bg-white/[0.06]"
              />
            </div>
          </div>

          {/* No results */}
          {filtered.length === 0 && (
            <div className="py-16 text-center text-white/35">
              No articles match &ldquo;{search}&rdquo;
            </div>
          )}

          {/* Featured article */}
          {featured && (
            <div className="mb-8">
              <ArticleCard
                article={featured}
                onClick={() => setSelected(featured)}
                featured
              />
            </div>
          )}

          {/* Grid */}
          {rest.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onClick={() => setSelected(article)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {selected && <ArticleModal article={selected} onClose={close} />}
    </>
  );
}
