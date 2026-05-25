"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/content/site";

export function StickyJoinCTA() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  // Only show on public pages, not admin
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) return;

    const onScroll = () => {
      // Show after scrolling past ~80% of viewport height
      setShow(window.scrollY > window.innerHeight * 0.8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isAdmin]);

  if (isAdmin) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 right-6 z-[9990]"
        >
          <a
            href={siteConfig.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2.5 rounded-full border border-brand-400/30 bg-brand-500/90 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_32px_-4px_rgba(10,102,194,0.6)] backdrop-blur-xl transition-all duration-300 hover:bg-brand-400 hover:shadow-[0_8px_40px_-4px_rgba(10,102,194,0.8)]"
          >
            {/* LinkedIn icon */}
            <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            Join LCB
            <span className="inline-block translate-x-0 transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
