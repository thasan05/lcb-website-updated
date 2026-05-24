"use client";

import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  intensity?: "soft" | "medium" | "strong";
};

const intensities = {
  soft: "opacity-[0.35]",
  medium: "opacity-[0.55]",
  strong: "opacity-[0.8]",
};

export function AmbientGlow({ className, intensity = "medium" }: Props) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        intensities[intensity],
        className
      )}
    >
      {/* Primary brand orb - top left */}
      <div
        className="absolute -left-32 -top-32 h-[520px] w-[520px] animate-float rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(10,102,194,0.45) 0%, rgba(10,102,194,0.05) 60%, transparent 80%)",
        }}
      />
      {/* Cyan accent - middle right */}
      <div
        className="absolute -right-24 top-1/3 h-[440px] w-[440px] animate-float-slow rounded-full blur-[110px]"
        style={{
          background:
            "radial-gradient(circle, rgba(34,211,238,0.25) 0%, rgba(34,211,238,0.04) 60%, transparent 80%)",
          animationDelay: "-8s",
        }}
      />
      {/* Indigo wash - bottom center */}
      <div
        className="absolute bottom-0 left-1/3 h-[380px] w-[380px] animate-float rounded-full blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.22) 0%, rgba(99,102,241,0.04) 60%, transparent 80%)",
          animationDelay: "-14s",
        }}
      />
    </div>
  );
}
