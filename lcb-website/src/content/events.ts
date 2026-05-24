import eventsData from "./data/events.json";

export type EventStatus = "upcoming" | "past" | "live";

export type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  dateLabel: string;
  location: string;
  format: "Online" | "On-Campus" | "Hybrid";
  status: EventStatus;
  speaker?: { name: string; role: string };
  partner?: string;
  image: string;
  href?: string;
};

// ── HOW TO UPDATE EVENTS ──────────────────────────────────────────────────────
//
// Use the Admin Panel at /admin  →  Events
//
// Manual edit:  src/content/data/events.json
//   - Add a new object, set  "status": "upcoming"  or  "status": "past"
//   - Upcoming sorts ascending (next event first)
//   - Past sorts descending (most recent past first)
//
// ─────────────────────────────────────────────────────────────────────────────

export const events = eventsData as Event[];
