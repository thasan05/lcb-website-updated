import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { kvGet } from "@/lib/kv";
import { siteConfig } from "@/content/site";
import type { Article } from "@/content/articles";
import { SafeHtml } from "@/components/ui/RichTextEditor";
import { FooterLive } from "@/components/layout/FooterLive";
import { BackToTop } from "@/components/ui/BackToTop";
import { ShareButtons } from "./ShareButtons";

export const dynamic = "force-dynamic";

const FORUM_BASE = "https://forum.linkedincommunitybangladesh.com";

async function getArticle(id: string): Promise<Article | null> {
  try {
    const articles = await kvGet<Article[]>("data:articles");
    return articles.find((a) => a.id === id && a.published) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) return { title: "Article Not Found · LCB Forum" };

  const url    = `${FORUM_BASE}/${article.id}`;
  const images = article.coverImage ? [{ url: article.coverImage, width: 1200, height: 630 }] : [];

  return {
    title:       `${article.title} · LCB Forum`,
    description: article.excerpt,
    openGraph: {
      title:       article.title,
      description: article.excerpt,
      url,
      type:        "article",
      authors:     [article.authorName],
      publishedTime: article.date,
      images,
      siteName: "LCB Forum",
    },
    twitter: {
      card:        article.coverImage ? "summary_large_image" : "summary",
      title:       article.title,
      description: article.excerpt,
      images:      article.coverImage ? [article.coverImage] : [],
    },
    alternates: { canonical: url },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) notFound();

  const shareUrl = `${FORUM_BASE}/${article.id}`;

  const initials = article.authorName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-[rgb(var(--bg-base,10,10,15))] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 rounded-full pl-1">
            <Image
              src="/logo.svg"
              alt="LCB"
              width={80}
              height={24}
              priority
              className="h-6 w-auto"
            />
            <span className="hidden text-sm font-medium text-white/50 sm:block">/ Forum</span>
          </Link>
          <div className="flex items-center gap-3">
            <a
              href="https://linkedincommunitybangladesh.com"
              className="hidden items-center gap-1.5 text-sm text-white/50 transition hover:text-white sm:flex"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to main site
            </a>
            <a
              href={`${FORUM_BASE}/`}
              className="text-sm text-white/50 transition hover:text-white"
            >
              ← All articles
            </a>
            <a
              href={siteConfig.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#4F9CEB] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3d8bd6]"
            >
              Join LCB
            </a>
          </div>
        </div>
      </header>

      {/* Article */}
      <main className="relative flex-1">
        {/* Top glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-80 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(10,102,194,0.35), transparent 70%)",
          }}
        />

        <article className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Cover image */}
          {article.coverImage && (
            <div className="mb-8 overflow-hidden rounded-3xl">
              <div className="relative h-64 w-full sm:h-80">
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#4F9CEB]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#7BB8F0]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold leading-snug text-white sm:text-4xl">
            {article.title}
          </h1>

          {/* Author + share row */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            {/* Author */}
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
              {article.authorPhoto ? (
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-white/10">
                  <Image src={article.authorPhoto} alt={article.authorName} fill className="object-cover" />
                </div>
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#4F9CEB]/20 bg-[#4F9CEB]/10 text-sm font-bold text-[#7BB8F0]">
                  {initials}
                </div>
              )}
              <div>
                <p className="font-semibold text-white">{article.authorName}</p>
                <p className="text-xs text-white/50">
                  {article.authorDesignation}
                  {article.authorCompany && ` · ${article.authorCompany}`}
                </p>
              </div>
              <span className="ml-4 hidden text-xs text-white/35 sm:block">{article.dateLabel}</span>
            </div>

            {/* Share buttons (client component) */}
            <ShareButtons url={shareUrl} title={article.title} />
          </div>

          {/* Content */}
          <div className="mt-10 border-t border-white/[0.06] pt-10">
            <SafeHtml
              html={article.content}
              className="prose prose-invert max-w-none text-white/75 prose-headings:text-white prose-a:text-[#7BB8F0] prose-strong:text-white/90 prose-p:leading-relaxed"
            />
          </div>

          {/* Bottom share */}
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.06] pt-8">
            <a
              href={`${FORUM_BASE}/`}
              className="text-sm text-white/40 transition hover:text-white"
            >
              ← Back to Forum
            </a>
            <ShareButtons url={shareUrl} title={article.title} />
          </div>
        </article>
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-8 text-xs text-white/40 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} {siteConfig.shortName}. All rights reserved.</p>
          <FooterLive />
        </div>
      </footer>

      <BackToTop />
    </div>
  );
}
