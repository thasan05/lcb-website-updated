import type { LucideIcon } from "lucide-react";
import { Network, Compass, Sparkles, Rocket, GraduationCap, Globe2 } from "lucide-react";

export type Benefit = {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: "brand" | "cyan" | "indigo";
};

export const benefits: Benefit[] = [
  {
    icon: Network,
    title: "Network without borders",
    description:
      "Connect with peers, mentors and industry leaders across every campus and corner of Bangladesh — and beyond.",
    accent: "brand",
  },
  {
    icon: GraduationCap,
    title: "Learn from the best",
    description:
      "Masterclasses, fireside chats and live sessions with founders, recruiters and the country's most respected professionals.",
    accent: "cyan",
  },
  {
    icon: Compass,
    title: "Find your career direction",
    description:
      "Personal branding, LinkedIn optimization and job-search strategy — the playbook universities don't teach.",
    accent: "indigo",
  },
  {
    icon: Rocket,
    title: "Build in public",
    description:
      "A culture that celebrates shipping, sharing and showing your work. Visibility compounds. So does opportunity.",
    accent: "brand",
  },
  {
    icon: Sparkles,
    title: "Lead from your campus",
    description:
      "Apply to become a Campus Lead and shape the movement on the ground at your university.",
    accent: "cyan",
  },
  {
    icon: Globe2,
    title: "A national movement",
    description:
      "Be part of the first generation rewriting what professional growth looks like in Bangladesh.",
    accent: "indigo",
  },
];
