// ─────────────────────────────────────────────────────────────────────────────
// Team data types
// To add members: edit the relevant category file in /src/data/team/
// To add a new category: create a new file + register it in index.ts
// ─────────────────────────────────────────────────────────────────────────────

export interface TeamSocial {
  linkedin?: string;
  facebook?: string;
  /** Portfolio, personal site, or any relevant URL */
  website?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  /**
   * Path relative to /public  →  "/team/central/altaf.jpg"
   * Or a full URL            →  "https://images.unsplash.com/..."
   * Omit entirely for initials fallback avatar.
   */
  image?: string;
  bio?: string;
  social?: TeamSocial;
  // ── Category-specific metadata ────────────────────────────────────────────
  /** University name — shown on campus-lead cards */
  university?: string;
  /** City — shown on campus-lead cards */
  city?: string;
  /** Company / organisation — shown on professional cards */
  company?: string;
  /**
   * Short badge labels rendered as pills on the card.
   * e.g. ["Founder"]  |  ["⭐ LCB Star 2024"]
   */
  badges?: string[];
  /** One-liners shown in a list (useful for award / achievement categories) */
  achievements?: string[];
  /** First member of a category gets a subtle visual boost */
  featured?: boolean;
}

export type TeamCategoryId =
  | "central"
  | "campus-leads"
  | "heads"
  | "professionals"
  | "initiatives";

export interface TeamCategory {
  id: TeamCategoryId;
  /** Label shown in the tab pill */
  label: string;
  /** Optional subtitle shown below the tab nav when this category is active */
  description?: string;
  members: TeamMember[];
}
