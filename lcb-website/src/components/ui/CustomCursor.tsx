"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springX = useSpring(mouseX, { stiffness: 350, damping: 28 });
  const springY = useSpring(mouseY, { stiffness: 350, damping: 28 });

  useEffect(() => {
    // Desktop only
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none)").matches) return;

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setVisible(true);
    };

    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      setHovering(el.closest("a, button, [role='button'], label, input, select, textarea") !== null);
    };

    const onDown = () => setClicking(true);
    const onUp   = () => setClicking(false);
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    document.addEventListener("mousemove",  onMove);
    document.addEventListener("mouseover",  onOver);
    document.addEventListener("mousedown",  onDown);
    document.addEventListener("mouseup",    onUp);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    // Hide native cursor
    document.documentElement.style.cursor = "none";

    return () => {
      document.removeEventListener("mousemove",  onMove);
      document.removeEventListener("mouseover",  onOver);
      document.removeEventListener("mousedown",  onDown);
      document.removeEventListener("mouseup",    onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      document.documentElement.style.cursor = "";
    };
  }, [mouseX, mouseY]);

  if (!visible) return null;

  return (
    <>
      {/* Outer ring */}
      <motion.div
        className="pointer-events-none fixed z-[9999] rounded-full border border-brand-400/60"
        style={{
          left: springX,
          top:  springY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width:   hovering ? 44 : clicking ? 20 : 32,
          height:  hovering ? 44 : clicking ? 20 : 32,
          opacity: hovering ? 0.9 : 0.5,
          borderColor: hovering
            ? "rgba(34,211,238,0.8)"
            : "rgba(79,156,235,0.6)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      />
      {/* Inner dot */}
      <motion.div
        className="pointer-events-none fixed z-[9999] rounded-full bg-brand-400"
        style={{
          left: mouseX,
          top:  mouseY,
          translateX: "-50%",
          translateY: "-50%",
          width: 4,
          height: 4,
        }}
        animate={{ opacity: hovering ? 0 : 1, scale: clicking ? 0.5 : 1 }}
        transition={{ duration: 0.15 }}
      />
    </>
  );
}
