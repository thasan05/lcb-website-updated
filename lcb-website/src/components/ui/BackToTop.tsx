"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useLenis } from "@/components/motion/SmoothScroll";

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const { scrollTo } = useLenis();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleScrollTop() {
    scrollTo(0, { duration: 1.5 });
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="back-to-top"
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={handleScrollTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.12] bg-[#0c0d14]/80 text-white/70 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-all duration-300 hover:scale-105 hover:border-white/30 hover:text-white sm:bottom-8 sm:right-8 focus-ring"
        >
          <ArrowUp className="h-4 w-4" strokeWidth={2.2} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
