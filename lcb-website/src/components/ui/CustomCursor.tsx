"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";

export function CustomCursor() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Apple-tuned silky spring physics
  const springX = useSpring(mouseX, { stiffness: 450, damping: 35 });
  const springY = useSpring(mouseY, { stiffness: 450, damping: 35 });

  useEffect(() => {
    if (isAdmin) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;

    let isVisible = false;

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) {
        isVisible = true;
        setVisible(true);
      }
    };

    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el) return;
      const isInteractive = el.closest("a, button, [role='button'], input, select, textarea, [data-interactive='true']") !== null;
      setHovering(isInteractive);
    };

    const onLeave = () => {
      isVisible = false;
      setVisible(false);
    };
    const onEnter = () => {
      isVisible = true;
      setVisible(true);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, [mouseX, mouseY, isAdmin]);

  if (!visible || isAdmin) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed z-[9999] rounded-full will-change-transform mix-blend-screen"
      style={{
        left: springX,
        top: springY,
        translateX: "-50%",
        translateY: "-50%",
      }}
      animate={{
        width: hovering ? 56 : 28,
        height: hovering ? 56 : 28,
        opacity: hovering ? 0.6 : 0.25,
        backgroundColor: hovering
          ? "rgba(34, 211, 238, 0.15)"
          : "rgba(10, 102, 194, 0.2)",
        boxShadow: hovering
          ? "0 0 24px rgba(34, 211, 238, 0.4), inset 0 0 12px rgba(255, 255, 255, 0.3)"
          : "0 0 14px rgba(79, 156, 235, 0.25)",
      }}
      transition={{ type: "spring", stiffness: 450, damping: 35 }}
    />
  );
}
