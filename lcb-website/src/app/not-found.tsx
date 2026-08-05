import Link from "next/link";
import { siteConfig } from "@/content/site";

export const metadata = {
  title: `Page not found · ${siteConfig.shortName}`,
  robots: { index: false, follow: true },
};

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/forum", label: "Forum" },
  { href: "/magazine", label: "Magazine" },
  { href: "/lor/apply", label: "LOR application" },
];

/**
 * Branded 404. Replaces Next's default screen, which was a dead end — this
 * offers the routes a visitor most likely wanted instead.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[rgb(var(--bg-base))] px-6 text-center text-white">
      <p className="font-mono text-sm tracking-widest text-brand-400">404</p>
      <h1 className="mt-3 text-3xl font-bold sm:text-4xl">This page doesn&apos;t exist</h1>
      <p className="mt-3 max-w-md text-sm text-white/45">
        The link may be outdated, or the page may have moved. Here&apos;s where you can go instead.
      </p>

      <nav aria-label="Suggested pages" className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="rounded-full border border-white/[0.12] px-5 py-2.5 text-sm font-medium text-white/70 transition hover:border-white/25 hover:text-white focus-ring"
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
