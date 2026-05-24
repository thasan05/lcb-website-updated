"use client";

import { useRef, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useAnimationFrame,
  useReducedMotion,
} from "framer-motion";
import { TeamCard } from "@/components/team/TeamCard";
import { type TeamMember } from "@/data/team";
import { cn } from "@/lib/utils";

interface InfiniteTeamScrollerProps {
  members: TeamMember[];
  direction?: "left" | "right";
  /** Scroll speed in px/second */
  speed?: number;
  className?: string;
}

const CARD_WIDTH = 260;
const CARD_GAP = 20;
const ITEM_SIZE = CARD_WIDTH + CARD_GAP;

export function InfiniteTeamScroller({
  members,
  direction = "left",
  speed = 70,
  className,
}: InfiniteTeamScrollerProps) {
  const shouldReduceMotion = useReducedMotion();
  const loopWidth = members.length * ITEM_SIZE;

  // Right-moving rows start at midpoint so there's no visible wrap on first frame
  const x = useMotionValue(direction === "right" ? -loopWidth * 0.5 : 0);

  const isHovered = useRef(false);
  const isDragging = useRef(false);

  // Duplicate 4× so the strip always fills the widest viewports
  const allItems: TeamMember[] = Array.from({ length: 4 }, () => members).flat();

  useAnimationFrame((_, rawDelta) => {
    if (shouldReduceMotion || isHovered.current || isDragging.current) return;

    // Clamp delta to avoid large jump on first frame or tab-switch resume
    const delta = Math.min(rawDelta, 33);
    const sign = direction === "left" ? -1 : 1;
    let next = x.get() + sign * (speed * delta) / 1000;

    // Seamless modulo wrap — content repeats so the jump is invisible
    if (direction === "left" && next <= -loopWidth) next += loopWidth;
    if (direction === "right" && next >= 0) next -= loopWidth;

    x.set(next);
  });

  const onDragStart = useCallback(() => {
    isDragging.current = true;
  }, []);

  const onDragEnd = useCallback(() => {
    // Delay re-enabling the loop to allow any elastic spring-back to settle
    setTimeout(() => {
      isDragging.current = false;
    }, 350);
  }, []);

  return (
    <div
      role="region"
      aria-label="Team members"
      className={cn("overflow-hidden", className)}
      onMouseEnter={() => { isHovered.current = true; }}
      onMouseLeave={() => { isHovered.current = false; }}
    >
      <motion.div
        className="flex"
        style={{ x, gap: CARD_GAP, willChange: "transform", cursor: "grab" }}
        drag="x"
        dragMomentum={false}
        dragElastic={0.05}
        dragConstraints={{
          left: -(loopWidth * 2),
          right: ITEM_SIZE,
        }}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        whileTap={{ cursor: "grabbing" }}
      >
        {allItems.map((member, i) => (
          <TeamCard key={`${member.id}-${i}`} member={member} />
        ))}
      </motion.div>
    </div>
  );
}