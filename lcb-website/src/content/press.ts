export interface PressItem {
  id: string;
  headline: string;
  outlet: string;      // publication / media name
  url: string;
  date?: string;       // ISO "2026-05-08"
  dateLabel?: string;  // "May 08, 2026"
  published: boolean;
}
