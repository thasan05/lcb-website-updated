import Link from "next/link";
import { ExternalLink, Newspaper } from "lucide-react";
import type { PressItem } from "@/content/press";

interface Props {
  items: PressItem[];
}

export function Press({ items }: Props) {
  const published = items.filter((i) => i.published);
  if (published.length === 0) return null;

  return (
    <section className="relative py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header row */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.10] bg-white/[0.04]">
              <Newspaper className="h-3.5 w-3.5 text-white/50" />
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-white/40">
              LCB in Press
            </span>
          </div>
          <span className="h-px flex-1 bg-white/[0.06]" />
        </div>

        {/* Cards */}
        <div className="flex flex-wrap gap-3">
          {published.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-w-0 max-w-sm items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5 transition-all duration-200 hover:border-brand-400/20 hover:bg-white/[0.04]"
            >
              {/* Outlet badge */}
              <span className="mt-0.5 shrink-0 rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/40 group-hover:border-brand-400/20 group-hover:text-brand-300/70 transition-colors">
                {item.outlet}
              </span>

              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium leading-snug text-white/75 group-hover:text-white transition-colors">
                  {item.headline}
                </p>
                {item.dateLabel && (
                  <p className="mt-1 text-[11px] text-white/30">{item.dateLabel}</p>
                )}
              </div>

              <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/20 transition-colors group-hover:text-brand-400/60" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
