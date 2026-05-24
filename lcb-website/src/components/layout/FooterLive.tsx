"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

/** Animated counter — counts from `from` to `to` over 1.8s */
function AnimatedCount({ to }: { to: number }) {
  const count = useMotionValue(Math.max(0, to - Math.min(to * 0.12, 200)));
  const display = useTransform(count, (v) => fmt(Math.round(v)));

  useEffect(() => {
    const ctrl = animate(count, to, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
    });
    return ctrl.stop;
  }, [count, to]);

  return <motion.span className="tabular-nums">{display}</motion.span>;
}

export function FooterLive() {
  const [count, setCount] = useState<number | null>(null);
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    const alreadyCounted =
      typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem("lcb_pv") === "1";

    fetch("/api/visitors", { method: alreadyCounted ? "GET" : "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.count === "number") {
          setCount(d.count);
          if (!alreadyCounted) {
            sessionStorage.setItem("lcb_pv", "1");
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">

      {/* Visitor count pill — only shown when KV active */}
      {count !== null && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5"
        >
          {/* Animated pulse dot */}
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/40" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          </span>
          <span className="text-xs text-white/45">
            <AnimatedCount to={count} />
            <span className="ml-1 text-white/30">visits</span>
          </span>
        </motion.div>
      )}

      {/* Built-by — linked */}
      <p className="flex items-center gap-1.5 text-xs text-white/35">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
        Built by{" "}
        <Link
          href="https://www.linkedin.com/in/thasan05/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/50 underline-offset-2 transition-colors hover:text-white hover:[text-decoration:underline]"
        >
          Tanvir Hasan
        </Link>
        <span className="text-white/20">↗</span>
      </p>
    </div>
  );
}
