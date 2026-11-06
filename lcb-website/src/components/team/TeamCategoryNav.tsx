"use client";

import { motion } from "framer-motion";
import { type TeamCategory, type TeamCategoryId } from "@/data/team";
import { cn } from "@/lib/utils";

interface TeamCategoryNavProps {
  categories: TeamCategory[];
  activeId: TeamCategoryId;
  onChange: (id: TeamCategoryId) => void;
}

export function TeamCategoryNav({
  categories,
  activeId,
  onChange,
}: TeamCategoryNavProps) {
  return (
    <div
      className="relative inline-flex max-w-full items-center gap-1 rounded-full border border-white/[0.10] bg-[#0c0d14]/80 p-1.5 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
      role="tablist"
      aria-label="Team categories"
    >
      {categories.map((cat) => {
        const isActive = cat.id === activeId;
        const count = cat.members.length;
        return (
          <button
            key={cat.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(cat.id as TeamCategoryId)}
            className={cn(
              "relative rounded-full px-4 py-2 text-xs sm:text-[13px] font-medium tracking-tight transition-colors duration-200 focus-ring",
              isActive ? "text-white" : "text-white/50 hover:text-white/80"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="team-tab-indicator"
                className="absolute inset-0 rounded-full bg-white/[0.14] shadow-[0_2px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.25)]"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              {cat.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums leading-none transition-colors duration-200",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-white/[0.06] text-white/40"
                )}
              >
                {count}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
