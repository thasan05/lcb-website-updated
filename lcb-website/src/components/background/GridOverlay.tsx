import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  fade?: boolean;
};

export function GridOverlay({ className, fade = true }: Props) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 grid-bg",
        fade && "mask-fade-edges",
        className
      )}
    />
  );
}
