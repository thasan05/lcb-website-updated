import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLElement> & {
  id?: string;
  spacing?: "default" | "tight" | "loose" | "none";
};

const spacings = {
  default: "py-section",
  tight: "py-section-sm",
  loose: "py-[clamp(7rem,14vw,12rem)]",
  none: "",
};

export function Section({ className, spacing = "default", ...props }: Props) {
  return (
    <section
      className={cn("relative", spacings[spacing], className)}
      {...props}
    />
  );
}
