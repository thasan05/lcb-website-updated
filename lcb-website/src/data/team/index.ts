// ─────────────────────────────────────────────────────────────────────────────
// Team data index
// Import from here — never from individual category files.
// ─────────────────────────────────────────────────────────────────────────────
import { centralTeam } from "./central-team";
import { campusLeads } from "./campus-leads";
import { lcbHeads } from "./lcb-heads";
import { professionals } from "./professionals";
import { initiatives } from "./initiatives";
import { type TeamCategory } from "./types";

export { type TeamMember, type TeamCategory, type TeamCategoryId, type TeamSocial } from "./types";

/** All categories in display order */
export const teamCategories: TeamCategory[] = [
  {
    id: "central",
    label: "Central Team",
    description: "The small, deliberate team building Bangladesh's largest professional community.",
    members: centralTeam,
  },
  {
    id: "campus-leads",
    label: "Campus Leads",
    description: "151 student leaders representing LCB across 67+ universities nationwide.",
    members: campusLeads,
  },
  {
    id: "heads",
    label: "LCB Heads",
    description: "Senior Leadership Team steering each department of LCB.",
    members: lcbHeads,
  },
  {
    id: "professionals",
    label: "Professionals",
    description: "LCB members making waves across Bangladesh's top industries.",
    members: professionals,
  },
  {
    id: "initiatives",
    label: "Initiatives",
    description: "19 active initiatives driven by LCB community members.",
    members: initiatives,
  },
];

/** Flat list of all members — useful for search / mentions */
export const allMembers = teamCategories.flatMap((c) => c.members);
