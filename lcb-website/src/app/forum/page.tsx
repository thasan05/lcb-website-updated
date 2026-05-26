import Image from "next/image";
import Link from "next/link";
import { kvGet } from "@/lib/kv";
import { siteConfig } from "@/content/site";
import type { Article } from "@/content/articles";
import { Forum } from "@/components/sections/Forum";
import { FooterLive } from "@/components/layout/FooterLive";
import { BackToTop } from "@/components/ui/BackToTop";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Forum · ${siteConfig.shortName}`,
  description:
    "Thought leadership, career stories, and professional wisdom from Bangladesh's top professionals.",
};

function ForumEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-32 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
        <svg
          className="h-7 w-7 text-white/30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"
          />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-white/60">No articles yet</h2>
      <p className="mt-2 text-sm text-white/35">
        The first thought leadership articles will appear here soon.
      </p>
    </div>
  );
}

export default async function ForumPage() {
  const articles = await kvGet<Article[]>("data:articles").catch(() => [] as Article[]);
  const published = (articles ?? []).filter((a) => a.published);

  return (
    <div className="flex min-h-screen flex-col bg-[rgb(var(--bg-base))] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[rgb(var(--bg-base))]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 focus-ring rounded-full pl-1">
            <Image
              src="/logo.svg"
              alt="LCB — LinkedIn Community Bangladesh"
              width={80}
              height={24}
              priority
              className="h-6 w-auto"
            />
            <span className="hidden text-sm font-medium text-white/50 sm:block">
              / Forum
            </span>
          </Link>

          {/* Back link + CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden items-center gap-1.5 text-sm text-white/50 transition hover:text-white sm:flex"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to main site
            </Link>
            <Link
              href={siteConfig.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Join LCB
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative flex-1">
        {/* Atmospheric top glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-80 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(10,102,194,0.3), transparent 70%)",
          }}
        />

        {published.length === 0 ? (
          <ForumEmptyState />
        ) : (
          <Forum articles={articles ?? []} />
        )}
      </main>

      {/* Footer */}
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
