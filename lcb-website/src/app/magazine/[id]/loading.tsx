/** Shown while a magazine issue and its PDF viewer are fetched. */
export default function Loading() {
  return (
    <div className="min-h-screen bg-[rgb(var(--bg-base))] text-white">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading magazine issue…</span>
        <div className="animate-pulse space-y-6">
          <div className="h-3 w-28 rounded bg-white/[0.06]" />
          <div className="h-8 w-2/3 rounded bg-white/[0.08]" />
          <div className="aspect-[3/4] w-full rounded-2xl bg-white/[0.05] sm:aspect-[4/3]" />
        </div>
      </div>
    </div>
  );
}
