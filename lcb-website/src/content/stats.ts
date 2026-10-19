export type Stat = {
  value: string;
  suffix?: string;
  label: string;
  description: string;
};

/**
 * Editable via /admin/stats, stored in KV under `data:stats`.
 *
 * The `stats` array below is the seed/fallback: it is what a brand-new database
 * is populated from, and what the homepage falls back to if the KV read fails.
 */
export type StatsConfig = {
  updatedLabel: string;
  items: Stat[];
};

export const stats: Stat[] = [
  {
    value: "24",
    suffix: "K+",
    label: "Lives Impacted",
    description: "Students, professionals & creators reached nationwide.",
  },
  {
    value: "125",
    suffix: "+",
    label: "Campus Leads",
    description: "Across leading universities from Dhaka to Chittagong.",
  },
  {
    value: "250",
    suffix: "+",
    label: "Sessions Hosted",
    description: "Masterclasses, workshops & networking nights.",
  },
  {
    value: "1",
    suffix: "st",
    label: "In Bangladesh",
    description: "The nation's first LinkedIn-based professional community.",
  },
];
