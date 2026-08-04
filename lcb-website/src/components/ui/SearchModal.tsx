"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, Users, Newspaper, Calendar } from "lucide-react";
import { allMembers } from "@/data/team";
import { events } from "@/content/events";
import { news } from "@/content/news";

// ── Searchable index ──────────────────────────────────────────────────────────

type Result = {
  id: string;
  title: string;
  subtitle: string;
  section: string;
  href: string;
  icon: React.ReactNode;
};

function buildIndex(): Result[] {
  const members: Result[] = allMembers.map((m) => ({
    id:       `member-${m.id}`,
    title:    m.name,
    subtitle: m.role + (m.university ? ` · ${m.university}` : ""),
    section:  "Team",
    href:     "#team",
    icon:     <Users className="h-3.5 w-3.5" />,
  }));

  const eventResults: Result[] = events.map((e) => ({
    id:       `event-${e.id}`,
    title:    e.title,
    subtitle: e.dateLabel + " · " + e.location,
    section:  "Events",
    href:     "#events",
    icon:     <Calendar className="h-3.5 w-3.5" />,
  }));

  const newsResults: Result[] = news.map((n) => ({
    id:       `news-${n.id}`,
    title:    n.title,
    subtitle: n.category + " · " + n.date,
    section:  "Newsroom",
    href:     "#news",
    icon:     <Newspaper className="h-3.5 w-3.5" />,
  }));

  return [...members, ...eventResults, ...newsResults];
}

const INDEX = buildIndex();

function query(q: string): Result[] {
  if (!q.trim()) return [];
  const lower = q.toLowerCase();
  return INDEX.filter(
    (r) =>
      r.title.toLowerCase().includes(lower) ||
      r.subtitle.toLowerCase().includes(lower) ||
      r.section.toLowerCase().includes(lower)
  ).slice(0, 8);
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = query(q);

  const close = useCallback(() => {
    setOpen(false);
    setQ("");
    setSelected(0);
  }, []);

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [close]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  // Arrow key navigation
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && results[selected]) {
      window.location.hash = results[selected].href.slice(1);
      close();
    }
  };

  return (
    <>
      {/* Trigger button — shown in Navbar */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="group flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1.5 text-xs text-white/40 backdrop-blur transition-all hover:border-white/[0.18] hover:text-white/70"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded bg-white/[0.08] px-1.5 py-0.5 text-[10px] sm:inline">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="search-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[9990] bg-ink-100/80 backdrop-blur-md"
              onClick={close}
            />

            {/* Modal */}
            <motion.div
              key="search-modal"
              initial={{ opacity: 0, scale: 0.96, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-4 top-[10vh] z-[9991] mx-auto max-w-xl overflow-hidden rounded-2xl border border-white/[0.12] bg-[#080d24]/95 shadow-2xl backdrop-blur-2xl"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3">
                <Search className="h-4 w-4 shrink-0 text-white/40" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setSelected(0); }}
                  onKeyDown={onKey}
                  placeholder="Search team, events, news…"
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
                />
                {q && (
                  <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="text-white/30 hover:text-white/70">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <kbd className="rounded border border-white/[0.08] px-1.5 py-0.5 text-[10px] text-white/30">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              {results.length > 0 ? (
                <ul className="max-h-72 overflow-y-auto py-2">
                  {results.map((r, i) => (
                    <li key={r.id}>
                      <a
                        href={r.href}
                        onClick={close}
                        onMouseEnter={() => setSelected(i)}
                        className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                          i === selected ? "bg-brand-500/20" : "hover:bg-white/[0.04]"
                        }`}
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/50">
                          {r.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white/90">{r.title}</p>
                          <p className="truncate text-xs text-white/40">{r.subtitle}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/35">
                          {r.section}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : q ? (
                <div className="py-10 text-center text-sm text-white/30">
                  No results for &ldquo;{q}&rdquo;
                </div>
              ) : (
                <div className="py-10 text-center text-sm text-white/30">
                  Type to search team members, events, news…
                </div>
              )}

              {/* Footer hint */}
              <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-2">
                <div className="flex items-center gap-3 text-[10px] text-white/25">
                  <span><kbd className="rounded bg-white/[0.06] px-1">↑↓</kbd> navigate</span>
                  <span><kbd className="rounded bg-white/[0.06] px-1">↵</kbd> go</span>
                </div>
                <span className="text-[10px] text-white/20">{results.length} results</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
