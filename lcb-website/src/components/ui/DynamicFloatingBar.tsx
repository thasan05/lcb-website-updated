"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Compass } from "lucide-react";
import { siteConfig } from "@/content/site";
import { useLenis } from "@/components/motion/SmoothScroll";

export function DynamicFloatingBar() {
  const [visible, setVisible] = useState(false);
  const { scrollTo } = useLenis();

  useEffect(() => {
    const onScroll = () => {
      // Show when scrolled past hero (approx 500px) and hide near bottom
      const scrolledPast = window.scrollY > 500;
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500;
      setVisible(scrolledPast && !nearBottom);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 inset-x-0 z-40 flex justify-center pointer-events-none px-4"
        >
          <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-white/[0.14] bg-[#000000]/75 p-1.5 pl-4 backdrop-blur-2xl shadow-[0_16px_50px_rgba(0,0,0,0.8),0_0_24px_rgba(255,255,255,0.05)]">
            {/* Top bevel gloss */}
            <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            {/* Quick jump pills */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollTo("#story", { offset: -70, duration: 1.3 })}
                className="rounded-full px-3 py-1 text-xs font-medium text-white/60 transition-colors hover:text-white hover:bg-white/[0.08]"
              >
                Story
              </button>
              <button
                type="button"
                onClick={() => scrollTo("#events", { offset: -70, duration: 1.3 })}
                className="rounded-full px-3 py-1 text-xs font-medium text-white/60 transition-colors hover:text-white hover:bg-white/[0.08]"
              >
                Events
              </button>
              <button
                type="button"
                onClick={() => scrollTo("#team", { offset: -70, duration: 1.3 })}
                className="rounded-full px-3 py-1 text-xs font-medium text-white/60 transition-colors hover:text-white hover:bg-white/[0.08]"
              >
                Team
              </button>
            </div>

            <div className="h-4 w-px bg-white/15 mx-1" />

            {/* Apple-style action button */}
            <a
              href={siteConfig.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 hover:bg-white/90 hover:scale-[1.02] active:scale-[0.96]"
            >
              <span>Join</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2.5} />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
