export interface Article {
  id: string;
  title: string;
  excerpt: string;          // short plain-text preview
  content: string;          // rich text HTML
  authorName: string;
  authorDesignation: string;
  authorCompany?: string;
  authorPhoto?: string;     // https URL
  date: string;             // ISO "2026-05-27"
  dateLabel: string;        // "May 27, 2026"
  coverImage?: string;      // https URL
  tags?: string[];
  published: boolean;
  featured?: boolean;
}
