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
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-48 w-[600px] rounded-full bg-[#4F9CEB]/[0.04] blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header row */}
        <div className="mb-10 flex items-center gap-4">
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
        <div className="flex flex-wrap justify-center gap-5">
          {published.map((item, idx) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="press-card group relative flex min-w-[280px] max-w-md flex-1 items-start gap-4 overflow-hidden rounded-2xl border p-5 transition-all duration-300"
              style={{ animationDelay: `${idx * 0.4}s` }}
            >
              {/* Animated border glow overlay */}
              <span className="press-glow pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* Subtle shimmer sweep */}
              <span className="press-shimmer pointer-events-none absolute inset-0 rounded-2xl" />

              {/* Outlet badge */}
              <span className="relative z-10 mt-0.5 shrink-0 rounded-lg border border-white/[0.10] bg-white/[0.05] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white/50 transition-all duration-300 group-hover:border-[#4F9CEB]/40 group-hover:bg-[#4F9CEB]/10 group-hover:text-[#4F9CEB]/90">
                {item.outlet}
              </span>

              <div className="relative z-10 min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug text-white/80 transition-colors duration-300 group-hover:text-white">
                  {item.headline}
                </p>
                {item.dateLabel && (
                  <p className="mt-1.5 text-[11px] text-white/30">{item.dateLabel}</p>
                )}
              </div>

              <ExternalLink className="relative z-10 mt-0.5 h-4 w-4 shrink-0 text-white/20 transition-all duration-300 group-hover:text-[#4F9CEB]/70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          ))}
        </div>
      </div>

      <style>{`
        /* Pulsing border animation */
        @keyframes press-pulse {
          0%, 100% { border-color: rgba(79,156,235,0.15); box-shadow: 0 0 0 0 rgba(79,156,235,0); }
          50%       { border-color: rgba(79,156,235,0.35); box-shadow: 0 0 18px 2px rgba(79,156,235,0.12); }
        }

        /* Shimmer sweep */
        @keyframes press-sweep {
          0%   { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(250%) skewX(-15deg); }
        }

        .press-card {
          animation: press-pulse 3s ease-in-out infinite;
          background: rgba(255,255,255,0.025);
        }

        /* Stagger second card */
        .press-card:nth-child(2) {
          animation-delay: 1.5s;
        }

        /* On hover: stronger steady glow */
        .press-card:hover {
          animation: none;
          border-color: rgba(79,156,235,0.40) !important;
          box-shadow: 0 0 28px 4px rgba(79,156,235,0.14), 0 0 0 1px rgba(79,156,235,0.20);
          background: rgba(79,156,235,0.04);
          transform: translateY(-2px);
        }

        /* Glow inner overlay */
        .press-glow {
          background: radial-gradient(ellipse at 50% 0%, rgba(79,156,235,0.10) 0%, transparent 70%);
        }

        /* Shimmer sweep line */
        .press-shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%);
          transform: translateX(-100%) skewX(-15deg);
          animation: press-sweep 3.5s ease-in-out infinite;
        }

        .press-card:nth-child(2) .press-shimmer::after {
          animation-delay: 1.75s;
        }
      `}</style>
    </section>
  );
}
