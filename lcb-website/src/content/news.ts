import newsData from "./data/news.json";

export type NewsCategory =
  | "Announcement"
  | "Event"
  | "Milestone"
  | "Partnership"
  | "Spotlight";

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  date: string;
  dateLabel: string;
  category: NewsCategory;
  image: string;
  href?: string;
  featured?: boolean;
  social?: {
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
};

// ── HOW TO UPDATE NEWS ────────────────────────────────────────────────────────
//
// Use the Admin Panel at /admin  →  Newsroom
//
// Manual edit:  src/content/data/news.json
//   - Paste a new object at the TOP of the array
//   - Set  "featured": true  on the new item, remove it from the old one
//   - Run  npm run build  (or save in dev — hot reload works automatically)
//
// ─────────────────────────────────────────────────────────────────────────────

export const news = newsData as NewsItem[];
