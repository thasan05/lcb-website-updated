/**
 * Shown while an article is fetched. Mirrors the reader layout so the page
 * doesn't jump when real content replaces it.
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-[rgb(var(--bg-base))] text-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading article…</span>
        <div className="animate-pulse space-y-6">
          <div className="h-3 w-24 rounded bg-white/[0.06]" />
          <div className="space-y-3">
            <div className="h-9 w-full rounded bg-white/[0.08]" />
            <div className="h-9 w-4/5 rounded bg-white/[0.08]" />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <div className="h-10 w-10 rounded-full bg-white/[0.06]" />
            <div className="space-y-2">
              <div className="h-3 w-32 rounded bg-white/[0.06]" />
              <div className="h-2.5 w-24 rounded bg-white/[0.04]" />
            </div>
          </div>
          <div className="aspect-[16/9] w-full rounded-2xl bg-white/[0.05]" />
          <div className="space-y-3 pt-2">
            {["w-full", "w-full", "w-11/12", "w-full", "w-3/4"].map((w, i) => (
              <div key={i} className={`h-3.5 rounded bg-white/[0.05] ${w}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
