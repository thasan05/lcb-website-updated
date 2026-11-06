import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, Calendar, ExternalLink } from "lucide-react";
import { kvGetCachedOr } from "@/lib/kv-cached";
import { siteConfig } from "@/content/site";
import { news as staticNews, type NewsItem } from "@/content/news";
import { SafeHtml } from "@/components/ui/RichTextEditor";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/ui/BackToTop";
import { NewsShareButtons } from "./NewsShareButtons";

export const revalidate = 300;
export const dynamicParams = true;

const CATEGORY_STYLES: Record<string, { badge: string; text: string }> = {
  Announcement: { badge: "border-blue-400/30 bg-blue-500/15 text-blue-300", text: "text-blue-300" },
  Event:        { badge: "border-purple-400/30 bg-purple-500/15 text-purple-300", text: "text-purple-300" },
  Milestone:    { badge: "border-amber-400/30 bg-amber-500/15 text-amber-300", text: "text-amber-300" },
  Partnership:  { badge: "border-emerald-400/30 bg-emerald-500/15 text-emerald-300", text: "text-emerald-300" },
  Spotlight:    { badge: "border-pink-400/30 bg-pink-500/15 text-pink-300", text: "text-pink-300" },
};

function toAbsoluteUrl(url?: string): string {
  if (!url) return `${siteConfig.url}/og.png`;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${siteConfig.url}${url.startsWith("/") ? "" : "/"}${url}`;
}

function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function getAllNews(): Promise<NewsItem[]> {
  try {
    const live = await kvGetCachedOr<NewsItem[] | null>("data:news", null);
    if (live && live.length > 0) return live;
  } catch {
    // fallback
  }
  return staticNews;
}

async function getNewsItem(id: string): Promise<NewsItem | null> {
  const all = await getAllNews();
  return all.find((n) => n.id === id && n.published !== false) ?? null;
}

export async function generateStaticParams() {
  return staticNews.map((n) => ({ id: n.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await getNewsItem(id);
  if (!item) return { title: "News Not Found · LCB Newsroom" };

  const absImage = toAbsoluteUrl(item.image);
  const description = cleanHtml(item.summary).slice(0, 200);
  const pageUrl = `${siteConfig.url}/news/${item.id}`;

  return {
    title: `${item.title} · LCB Newsroom`,
    description,
    openGraph: {
      title: item.title,
      description,
      url: pageUrl,
      siteName: "LinkedIn Community Bangladesh",
      type: "article",
      publishedTime: item.date,
      images: [
        {
          url: absImage,
          width: 1200,
          height: 630,
          alt: item.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description,
      images: [absImage],
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

export default async function NewsStoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getNewsItem(id);
  if (!item) notFound();

  const allNews = await getAllNews();
  const otherNews = allNews
    .filter((n) => n.id !== item.id && n.published !== false)
    .slice(0, 3);

  const pageUrl = `${siteConfig.url}/news/${item.id}`;
  const primaryExternalUrl =
    item.href?.trim() ||
    item.social?.linkedin?.trim() ||
    item.social?.facebook?.trim() ||
    item.social?.instagram?.trim();

  const badgeStyle = CATEGORY_STYLES[item.category]?.badge ?? "border-white/[0.14] bg-white/[0.04] text-white/90";

  return (
    <div className="flex min-h-screen flex-col bg-[#040614] text-white">
      {/* Sticky Sub-Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#040614]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <Image
              src="/logo.svg"
              alt="LCB Logo"
              width={80}
              height={24}
              priority
              className="h-6 w-auto"
            />
            <span className="hidden text-xs uppercase tracking-[0.2em] text-white/40 sm:inline">
              / Newsroom
            </span>
          </Link>

          <Link
            href="/#news"
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-white/70 transition hover:border-white/[0.18] hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All News</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-20">
        <article className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 lg:px-8">
          {/* Breadcrumb / Top Meta */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-white/40">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <span>/</span>
            <Link href="/#news" className="hover:text-white transition">Newsroom</Link>
            <span>/</span>
            <span className="text-white/60">{item.category}</span>
          </div>

          {/* Badges & Date */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] backdrop-blur ${badgeStyle}`}>
              {item.category}
            </span>
            {item.featured && (
              <span className="rounded-full border border-brand-400/40 bg-brand-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-200 backdrop-blur">
                Featured
              </span>
            )}
            <span className="h-1 w-1 rounded-full bg-white/25" />
            <span className="flex items-center gap-1.5 text-xs text-white/45">
              <Calendar className="h-3.5 w-3.5 text-white/40" />
              {item.dateLabel}
            </span>
          </div>

          {/* Headline */}
          <h1 className="mt-4 font-display text-3xl font-medium tracking-tight text-white sm:text-4xl lg:text-5xl leading-[1.15]">
            {item.title}
          </h1>

          {/* Hero Cover Image */}
          {item.image && (
            <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02] shadow-2xl">
              <Image
                src={item.image}
                alt={item.title}
                fill
                priority
                sizes="(max-width: 896px) 100vw, 896px"
                unoptimized={item.image.endsWith(".svg")}
                className="object-cover"
              />
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/[0.08]" />
            </div>
          )}

          {/* Article Summary / Story Body */}
          <div className="mt-8 border-b border-white/[0.08] pb-10">
            <SafeHtml
              html={item.summary}
              className="prose prose-invert prose-lg max-w-none text-white/75 leading-relaxed prose-headings:text-white prose-a:text-brand-300 prose-a:underline hover:prose-a:text-white prose-strong:text-white/90 text-base sm:text-lg"
            />
          </div>

          {/* Official Source Links */}
          {(item.social || item.href) && (
            <div className="mt-8 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 sm:p-6">
              <h3 className="text-xs uppercase tracking-[0.18em] text-white/40 mb-3">Official Posts & Sources</h3>
              <div className="flex flex-wrap items-center gap-2.5">
                {item.social?.linkedin && (
                  <a
                    href={item.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/75 transition hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/15 hover:text-[#0A66C2]"
                  >
                    <span>View LinkedIn Post</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
                {item.social?.facebook && (
                  <a
                    href={item.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/75 transition hover:border-[#1877F2]/50 hover:bg-[#1877F2]/15 hover:text-[#1877F2]"
                  >
                    <span>View Facebook Post</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
                {item.social?.instagram && (
                  <a
                    href={item.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/75 transition hover:border-[#E1306C]/50 hover:bg-[#E1306C]/15 hover:text-[#E1306C]"
                  >
                    <span>View Instagram Post</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
                {item.href && item.href !== item.social?.linkedin && (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/75 transition hover:border-brand-400/50 hover:bg-brand-500/15 hover:text-brand-300"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>External Article</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Action Row & Sharing */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-6">
            {primaryExternalUrl ? (
              <a
                href={primaryExternalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-glow transition hover:bg-brand-400"
              >
                <span>Open original story</span>
                <ArrowUpRight className="h-4 w-4" />
              </a>
            ) : (
              <Link
                href="/#news"
                className="inline-flex items-center gap-2 rounded-xl bg-white/[0.06] border border-white/[0.12] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.12]"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Newsroom</span>
              </Link>
            )}

            <NewsShareButtons url={pageUrl} title={item.title} />
          </div>

          {/* Related / More Stories */}
          {otherNews.length > 0 && (
            <div className="mt-20 border-t border-white/[0.08] pt-12">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-brand-300">Continue Reading</span>
                  <h3 className="mt-1 font-display text-2xl font-medium text-white">More from LCB Newsroom</h3>
                </div>
                <Link
                  href="/#news"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-brand-300 transition"
                >
                  <span>View all</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                {otherNews.map((newsItem) => (
                  <Link
                    key={newsItem.id}
                    href={`/news/${newsItem.id}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 transition duration-300 hover:border-brand-400/30 hover:bg-white/[0.05]"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-white/[0.02]">
                      <Image
                        src={newsItem.image}
                        alt={newsItem.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 280px"
                        unoptimized={newsItem.image.endsWith(".svg")}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/40">
                      <span className="text-brand-300">{newsItem.category}</span>
                      <span>·</span>
                      <span>{newsItem.dateLabel}</span>
                    </div>
                    <h4 className="mt-1.5 line-clamp-2 font-display text-sm font-medium text-white group-hover:text-brand-200 transition">
                      {newsItem.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
}
