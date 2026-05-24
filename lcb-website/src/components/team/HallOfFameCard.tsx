"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Linkedin, Facebook, Globe } from "lucide-react";
import { type TeamMember } from "@/data/team";
import { TeamImage } from "@/components/ui/TeamImage";

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
      className="group relative w-full cursor-default select-none overflow-hidden rounded-2xl"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, scale: 1.025 }}
    >
      {/* ── Border ring — pulses gold on hover ───────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 z-30 rounded-2xl border border-amber-400/20 transition-all duration-500 group-hover:border-amber-400/55"
        style={{ boxShadow: "0 0 0 0 rgba(251,191,36,0)" }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-30 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ boxShadow: "0 8px 40px -8px rgba(251,191,36,0.4)" }}
      />

      {/* ── Portrait image ───────────────────────────────────────────── */}
      <div className="relative aspect-[3/4] w-full">
        {image ? (
          <TeamImage
            src={image}
            alt={name}
            priority
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-950/60 to-neutral-900">
            <span className="font-display text-5xl font-bold text-amber-400/25">
              {name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
            </span>
          </div>
        )}

        {/* Deep cinematic gradient — bottom 60% */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#040614] via-[#040614]/50 via-[40%] to-transparent" />

        {/* Shimmer on hover */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-amber-200/8 to-transparent transition-transform duration-[1400ms] ease-out group-hover:translate-x-full"
        />

        {/* ── Top-left badge only: HALL OF FAME ───────────────────────── */}
        <div className="absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-amber-400/35 bg-amber-500/20 px-2.5 py-1 backdrop-blur-md">
          <span className="text-[10px]">🏆</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-amber-300">
            Hall of Fame
          </span>
        </div>

        {/* ── Bottom text block ────────────────────────────────────────── */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-4">
          {/* Social icons — slide up on hover */}
          {hasSocials && (
            <div className="mb-2 flex translate-y-2 items-center gap-1.5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
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
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-amber-400/40 bg-amber-500/20 text-amber-300 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-amber-500/35 hover:text-white"
                    >
                      <cfg.Icon className="h-3 w-3" strokeWidth={1.75} />
                    </Link>
                  );
                }
              )}
            </div>
          )}

          {/* Name */}
          <h3 className="font-display text-[15px] font-semibold leading-snug text-white">
            {name}
          </h3>

          {/* Role */}
          <p className="mt-0.5 text-[11px] font-medium tracking-wide text-amber-400/75">
            {role}
          </p>

          {/* Achievement */}
          {achievements && achievements[0] && (
            <p className="mt-1 text-[10px] text-white/40">
              {achievements[0]}
            </p>
          )}
        </div>
      </div>
    </motion.article>
  );
}
