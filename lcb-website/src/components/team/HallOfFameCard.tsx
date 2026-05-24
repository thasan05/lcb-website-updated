"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Linkedin, Facebook, Globe } from "lucide-react";
import { type TeamMember } from "@/data/team";
import { TeamImage } from "@/components/ui/TeamImage";
import { cn } from "@/lib/utils";

const SOCIAL_CONFIG = {
  linkedin: { Icon: Linkedin, label: "LinkedIn" },
  facebook: { Icon: Facebook, label: "Facebook" },
  website:  { Icon: Globe,    label: "Website"   },
} as const;

interface HallOfFameCardProps {
  member: TeamMember;
  index?: number;
}

export function HallOfFameCard({ member, index = 0 }: HallOfFameCardProps) {
  const { name, role, image, social, achievements } = member;
  const hasSocials = social && Object.values(social).some(Boolean);

  return (
    <motion.article
      className={cn(
        "group relative w-full overflow-hidden rounded-3xl select-none",
        "border border-amber-400/20",
        "bg-gradient-to-b from-white/[0.05] to-white/[0.01]",
        "backdrop-blur-sm transition-all duration-500",
        "hover:border-amber-400/50",
      )}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.55,
        delay: index * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ scale: 1.03, y: -6 }}
    >
      {/* Ambient amber glow — intensifies on hover */}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          boxShadow:
            "inset 0 0 0 1px rgba(251,191,36,0.35), 0 0 48px -12px rgba(251,191,36,0.45)",
        }}
      />

      {/* Top hairline — gold */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

      {/* ── Portrait image ──────────────────────────────────────────────── */}
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        {image ? (
          <TeamImage
            src={image}
            alt={name}
            priority
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-900/40 to-amber-700/20">
            <span className="font-display text-5xl font-bold text-amber-400/30">
              {name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
            </span>
          </div>
        )}

        {/* Cinematic bottom gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#040614] via-[#040614]/40 to-transparent" />

        {/* Subtle gold shimmer sweep on hover */}
        <div
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-amber-300/10 to-transparent transition-transform duration-[1200ms] ease-out group-hover:translate-x-full"
          aria-hidden
        />

        {/* 🏆 Hall of Fame badge — top-left */}
        <span className="absolute left-3 top-3 z-20 inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/20 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-amber-300 backdrop-blur-sm">
          🏆 Hall of Fame
        </span>

        {/* Role pill — top-right */}
        <span className="absolute right-3 top-3 z-20 rounded-full border border-white/[0.10] bg-black/40 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-white/55 backdrop-blur-sm">
          {role}
        </span>

        {/* Social icons — float up on hover */}
        {hasSocials && (
          <div className="absolute inset-x-0 bottom-[4.5rem] z-20 flex translate-y-2 items-center gap-1.5 px-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            {(Object.entries(social!) as [keyof typeof SOCIAL_CONFIG, string][]).map(
              ([key, href]) => {
                const cfg = SOCIAL_CONFIG[key];
                if (!cfg || !href) return null;
                return (
                  <Link
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${name} on ${cfg.label}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/20 text-amber-300 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:border-amber-400/60 hover:text-white"
                  >
                    <cfg.Icon className="h-3 w-3" strokeWidth={1.75} />
                  </Link>
                );
              }
            )}
          </div>
        )}

        {/* Name + achievement over image at bottom */}
        <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-4">
          <h3 className="font-display text-[15px] font-semibold leading-snug text-white drop-shadow-sm">
            {name}
          </h3>
          {achievements && achievements.length > 0 && (
            <p className="mt-1 text-[10px] font-medium tracking-wide text-amber-400/80">
              {achievements[0]}
            </p>
          )}
        </div>
      </div>
    </motion.article>
  );
}
