"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Linkedin, Facebook, Globe } from "lucide-react";
import { type TeamMember } from "@/data/team";
import { TeamImage } from "@/components/ui/TeamImage";
import { cn } from "@/lib/utils";

// ── Social icon map ────────────────────────────────────────────────────────
const SOCIAL_CONFIG = {
  linkedin: { Icon: Linkedin, label: "LinkedIn" },
  facebook: { Icon: Facebook, label: "Facebook" },
  website: { Icon: Globe, label: "Website" },
} as const;

// ── Deterministic avatar color from name ──────────────────────────────────
const AVATAR_GRADIENTS = [
  "from-brand-700 to-brand-900",
  "from-indigo-500/80 to-indigo-700/80",
  "from-cyan-500/60 to-brand-700",
  "from-brand-600 to-indigo-600/80",
];
function avatarGradient(name: string) {
  return AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length];
}
function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// ── Component ─────────────────────────────────────────────────────────────
interface TeamCardProps {
  member: TeamMember;
  className?: string;
}

export function TeamCard({ member, className }: TeamCardProps) {
  const {
    name, role, bio, image, social, featured,
    university, city, company, badges,
  } = member;

  const subtitle = university
    ? [university, city].filter(Boolean).join(" · ")
    : company ?? null;

  const hasSocials = social && Object.values(social).some(Boolean);

  return (
    <motion.article
      className={cn(
        "group relative w-full overflow-hidden rounded-[24px] select-none",
        "border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.015]",
        "backdrop-blur-md transition-all duration-500 hover:border-white/[0.18]",
        className
      )}
      whileHover={{ scale: 1.025, y: -4 }}
      transition={{ type: "spring", stiffness: 350, damping: 28, mass: 0.8 }}
    >
      {/* Top hairline */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/[0.22] to-transparent" />

      {/* Hover glow ring */}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          boxShadow: "inset 0 0 0 1px rgba(79,156,235,0.30), 0 0 32px -12px rgba(10,102,194,0.5)",
        }}
      />

      {/* ── Image / avatar ──────────────────────────────────────────────── */}
      <div className="relative">
        {image ? (
          <TeamImage src={image} alt={name} priority={featured} sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw" />
        ) : (
          <AvatarFallback name={name} />
        )}

        {/* Gradient overlay for text legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#040614] via-[#040614]/15 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-55" />

        {/* Badge pill — top-left */}
        {badges && badges.length > 0 && (
          <span className="absolute left-3 top-3 z-10 rounded-full border border-white/[0.14] bg-black/50 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-brand-300 backdrop-blur-sm">
            {badges[0]}
          </span>
        )}

        {/* Founder star — top-right */}
        {featured && (
          <span className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-brand-400/40 bg-brand-500/30 text-[11px] backdrop-blur-sm">
            ✦
          </span>
        )}

        {/* Social icons — float up on hover */}
        {hasSocials && (
          <div className="absolute inset-x-0 bottom-0 z-10 flex translate-y-1.5 items-center gap-1.5 p-3 opacity-0 transition-all duration-400 ease-out group-hover:translate-y-0 group-hover:opacity-100">
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
                    className="flex h-7 w-7 items-center justify-center rounded-full glass-strong text-white/75 transition-all duration-300 hover:scale-110 hover:text-white"
                  >
                    <cfg.Icon className="h-3 w-3" strokeWidth={1.75} />
                  </Link>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* ── Text info ───────────────────────────────────────────────────── */}
      <div className="p-4 pb-5">
        <h3 className="font-display text-[14px] font-semibold leading-snug text-white">
          {name}
        </h3>
        <p className="mt-0.5 text-[11px] font-medium tracking-wide text-brand-300">
          {role}
        </p>
        {subtitle && (
          <p className="mt-0.5 text-[11px] text-white/35">{subtitle}</p>
        )}
        {bio && (
          <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-white/45 transition-colors duration-300 group-hover:text-white/60">
            {bio}
          </p>
        )}
      </div>
    </motion.article>
  );
}

// ── Initials fallback ──────────────────────────────────────────────────────
function AvatarFallback({ name }: { name: string }) {
  return (
    <div
      className={cn(
        "flex aspect-[4/5] w-full items-center justify-center",
        "bg-gradient-to-br",
        avatarGradient(name)
      )}
    >
      <span className="font-display text-4xl font-bold text-white/20">
        {initials(name)}
      </span>
    </div>
  );
}
