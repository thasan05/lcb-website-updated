import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { kvGetCached } from "@/lib/kv-cached";
import { siteConfig } from "@/content/site";
import type { Magazine } from "@/content/magazines";
import { FooterLive } from "@/components/layout/FooterLive";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Magazine · LinkedIn Community Bangladesh",
  description: "Browse and read all issues of the LCB Magazine — monthly insights from Bangladesh's professional community.",
  openGraph: {
    title: "LCB Magazine",
    description: "Monthly magazine from LinkedIn Community Bangladesh",
    siteName: "LCB Magazine",
  },
};

const MAGAZINE_BASE = "https://magazine.linkedincommunitybangladesh.com";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long", year: "numeric",
  });
}

async function getMagazines(): Promise<Magazine[]> {
  try {
    const all = await kvGetCached<Magazine[]>("data:magazines");
    return (all ?? []).filter((m) => m.published);
  } catch {
    return [];
  }
}

function MagazineCard({ mag }: { mag: Magazine }) {
  return (
    <a
      href={`${MAGAZINE_BASE}/${mag.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] transition-all duration-300 hover:border-[#4F9CEB]/25 hover:bg-white/[0.04]"
    >
      {/* Cover */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#0d1424]">
        {mag.coverUrl ? (
          <Image
            src={mag.coverUrl}
            alt={mag.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3">
            <svg
              className="h-14 w-14 text-white/10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={0.75}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <p className="text-xs text-white/20 font-medium tracking-widest uppercase">LCB</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#040614]/80 via-transparent to-transparent" />
      </div>

      {/* Meta */}
      <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-[#4F9CEB]/60 sm:text-[11px]">
            {formatDate(mag.uploadedAt)}
          </p>
          <h3 className="mt-1 text-sm font-semibold text-white group-hover:text-[#7BB8F0] transition-colors leading-snug sm:text-base">
            {mag.title}
          </h3>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-[#4F9CEB] sm:mt-4">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.641 0-8.573-3.007-9.964-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Read Issue
        </div>
      </div>
    </a>
  );
}

export default async function MagazinePage() {
  const magazines = await getMagazines();

  return (
    <div className="flex min-h-screen flex-col bg-[rgb(var(--bg-base,10,10,15))] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 rounded-full pl-1">
            <Image src="/logo.svg" alt="LCB" width={80} height={24} priority className="h-6 w-auto" />
            <span className="hidden text-sm font-medium text-white/50 sm:block">/ Magazine</span>
          </Link>
          <a
            href={siteConfig.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#4F9CEB] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3d8bd6]"
          >
            Join LCB
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-40"
          style={{
            background: "radial-gradient(ellipse 70% 60% at 50% -10%, rgba(10,102,194,0.4), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-20 lg:px-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#4F9CEB]/20 bg-[#4F9CEB]/10 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4F9CEB]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.20em] text-[#7BB8F0]">Monthly Publication</span>
          </div>
          <h1 className="text-3xl font-bold text-white sm:text-5xl">LCB Magazine</h1>
          <p className="mt-3 max-w-xl text-base text-white/50">
            Monthly insights, stories, and professional wisdom from Bangladesh&apos;s LinkedIn community.
          </p>
        </div>
      </section>

      {/* Grid */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
          {magazines.length === 0 ? (
            <div className="py-24 text-center">
              <svg
                className="mx-auto mb-4 h-16 w-16 text-white/10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={0.75}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <p className="text-white/30">First issue coming soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {magazines.map((mag) => (
                <MagazineCard key={mag.id} mag={mag} />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-8 text-xs text-white/40 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} {siteConfig.shortName}. All rights reserved.</p>
          <FooterLive />
        </div>
      </footer>
    </div>
  );
}
