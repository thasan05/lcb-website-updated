"use client";

import { useEffect } from "react";

/** Fires one POST to /api/analytics per browser session (uses sessionStorage). */
export function PageViewTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("lcb_pv_tracked")) return;
    fetch("/api/analytics", { method: "POST" }).catch(() => {});
    sessionStorage.setItem("lcb_pv_tracked", "1");
  }, []);
  return null;
}
