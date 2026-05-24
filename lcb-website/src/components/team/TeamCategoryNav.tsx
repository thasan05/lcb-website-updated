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
      className="relative inline-flex max-w-full items-center gap-1 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-1.5"
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
              "relative rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 focus-ring sm:px-3.5 sm:py-1.5",
              isActive ? "text-white" : "text-white/45 hover:text-white/70"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="team-tab-indicator"
                className="absolute inset-0 rounded-xl bg-white/[0.09] shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              {cat.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums leading-none transition-colors duration-200",
                  isActive
                    ? "bg-brand-500/30 text-brand-200"
                    : "bg-white/[0.06] text-white/30"
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
