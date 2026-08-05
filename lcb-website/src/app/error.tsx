"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Route-level error boundary. Without this, an unexpected render error showed
 * Next's bare default screen with no way back into the site. `reset()` retries
 * the segment, which is often enough when the cause was a transient data read.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[rgb(var(--bg-base))] px-6 text-center text-white">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/[0.08]">
        <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-white/45">
        This section failed to load. Trying again usually fixes it — if not, the page will be back shortly.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 focus-ring"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-white/[0.12] px-5 py-2.5 text-sm font-medium text-white/70 transition hover:border-white/25 hover:text-white focus-ring"
        >
          Back to home
        </Link>
      </div>

      {error.digest && (
        <p className="mt-8 font-mono text-[11px] text-white/25">Reference: {error.digest}</p>
      )}
    </div>
  );
}
