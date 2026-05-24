"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="back-to-top"
          initial={{ opacity: 0, scale: 0.8, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 8 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={scrollTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.12] bg-ink-100/80 text-white/60 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-colors duration-200 hover:border-brand-400/40 hover:text-white sm:bottom-8 sm:right-8"
        >
          <ArrowUp className="h-4 w-4" strokeWidth={2} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
