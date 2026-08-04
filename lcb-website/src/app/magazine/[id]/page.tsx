import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { kvGet } from "@/lib/kv";
import { siteConfig } from "@/content/site";
import type { Magazine } from "@/content/magazines";
import { FooterLive } from "@/components/layout/FooterLive";
import { MagazineShareButtons } from "./MagazineShareButtons";

export const revalidate = 300;

const MAGAZINE_BASE = "https://magazine.linkedincommunitybangladesh.com";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

async function getMagazine(id: string): Promise<Magazine | null> {
  try {
    const all = await kvGet<Magazine[]>("data:magazines");
    return all?.find((m) => m.id === id && m.published) ?? null;
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
  const mag = await getMagazine(id);
  if (!mag) return { title: "Issue Not Found · LCB Magazine" };

  const url    = `${MAGAZINE_BASE}/${mag.id}`;
  const images = mag.coverUrl ? [{ url: mag.coverUrl, width: 800, height: 1120 }] : [];

  return {
    title:       `${mag.title} · LCB Magazine`,
    description: `Read and download the ${mag.title} issue of the LCB Magazine.`,
    openGraph: {
      title:       mag.title,
      description: `Read the ${mag.title} issue of LCB Magazine`,
      url,
      type:        "article",
      images,
      siteName:    "LCB Magazine",
    },
    twitter: {
      card:    mag.coverUrl ? "summary_large_image" : "summary",
      title:   mag.title,
      images:  mag.coverUrl ? [mag.coverUrl] : [],
    },
    alternates: { canonical: url },
  };
}

export default async function MagazineReaderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mag = await getMagazine(id);
  if (!mag) notFound();

  const shareUrl = `${MAGAZINE_BASE}/${mag.id}`;

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 rounded-full pl-1">
            <Image src="/logo.svg" alt="LCB" width={80} height={24} priority className="h-6 w-auto" />
            <span className="hidden text-sm font-medium text-white/50 sm:block">/ Magazine</span>
          </Link>
          <div className="flex items-center gap-3">
            <a href={`${MAGAZINE_BASE}/`} className="text-sm text-white/50 transition hover:text-white">
              ← All issues
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

      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-80 opacity-25"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(10,102,194,0.4), transparent 70%)" }}
      />

      <main className="relative flex-1">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

          {/* Meta + actions */}
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-widest text-[#4F9CEB]/60">
                {formatDate(mag.uploadedAt)}
              </p>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">{mag.title}</h1>
              <p className="mt-1 text-sm text-white/40">LCB Magazine</p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <a
                href={mag.fileUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-white/60 transition hover:border-white/20 hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download PDF
              </a>
              <a
                href={mag.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-[#4F9CEB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3d8bd6] sm:hidden"
              >
                Open PDF
              </a>
            </div>
          </div>

          {/* PDF viewer (desktop) */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1424] shadow-2xl">
            <iframe
              src={`/api/magazine/${mag.id}/pdf`}
              title={mag.title}
              className="hidden h-[80vh] w-full sm:block"
              style={{ border: "none" }}
            />

            {/* Mobile fallback — PDF in iframe is poor on iOS */}
            <div className="flex flex-col items-center justify-center gap-6 py-14 sm:hidden">
              {mag.coverUrl ? (
                <div className="relative h-64 w-48 overflow-hidden rounded-xl border border-white/10 shadow-xl">
                  <Image src={mag.coverUrl} alt={mag.title} fill className="object-cover" />
                </div>
              ) : (
                <svg className="h-16 w-16 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              )}
              <p className="text-sm text-white/40">Tap below to read on your device</p>
              <div className="flex w-full max-w-xs flex-col gap-3 px-4">
                <a
                  href={mag.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4F9CEB] px-5 py-3 text-sm font-semibold text-white"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.641 0-8.573-3.007-9.964-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Read Magazine
                </a>
                <a
                  href={mag.fileUrl}
                  download
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-5 py-3 text-sm font-medium text-white/60 transition hover:text-white"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download PDF
                </a>
              </div>
            </div>
          </div>

          {/* Bottom share row */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.06] pt-8">
            <a href={`${MAGAZINE_BASE}/`} className="text-sm text-white/40 transition hover:text-white">
              ← All issues
            </a>
            <MagazineShareButtons url={shareUrl} title={mag.title} />
          </div>
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
