import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  dot?: boolean;
  tone?: "default" | "brand" | "cyan";
};

const tones = {
  default: "text-white/70",
  brand: "text-brand-300",
  cyan: "text-cyan-400",
};

export function Eyebrow({ className, dot = true, tone = "default", children, ...props }: Props) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5",
        "text-[11px] font-medium uppercase tracking-[0.18em]",
        tones[tone],
        className
      )}
      {...props}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-cyan-400/60" />
          <span className="relative h-1.5 w-1.5 rounded-full bg-cyan-400" />
        </span>
      )}
      {children}
    </div>
  );
}
