# LinkedIn Community BD — Official Website

The premium, production-grade web presence for **LCB** — Bangladesh's first LinkedIn-based professional growth community.

Built with Next.js 15 (App Router) + TypeScript + Tailwind + Framer Motion. Designed to feel like a funded startup brand, not a generic community page.

---

## ✦ Design philosophy

| Pillar         | Direction                                                                                     |
| -------------- | --------------------------------------------------------------------------------------------- |
| **Tone**       | Cinematic. Editorial. Premium-restrained. Confident, never loud.                              |
| **Theme**      | Ultra-deep ink-navy foundation, LinkedIn blue accent, electric cyan + soft indigo highlights. |
| **Typography** | `Geist` (display + body) paired with `Instrument Serif` italic accents — editorial luxury.    |
| **Motion**     | Framer Motion springs, staggered reveals, parallax, cursor-reactive glow. Never flashy.       |
| **Surfaces**   | Layered glassmorphism, hairline borders, ambient floating glows, faint grid + film grain.    |

---

## ✦ Tech stack

- **Next.js 15** — App Router, React Server Components, image optimization
- **TypeScript** — strict mode, fully typed content layer
- **Tailwind CSS** — extended design tokens, fluid typography scale
- **Framer Motion** — centralized motion system in `src/lib/motion.ts`
- **Lucide Icons** — minimal, consistent iconography
- **Vercel-ready** — zero config deployment

---

## ✦ Getting started

```bash
# Install dependencies
npm install

# Run the dev server
npm run dev

# Open http://localhost:3000
```

Other scripts:

```bash
npm run build       # Production build
npm run start       # Run production server
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
```

---

## ✦ Project structure

```
src/
├── app/
│   ├── layout.tsx          ← Fonts, metadata, html shell
│   ├── page.tsx            ← Homepage composition
│   └── globals.css         ← Design tokens, atmosphere, utilities
│
├── components/
│   ├── layout/             ← Navbar, Footer
│   ├── sections/           ← Hero, Story, Stats, Benefits, Events, Team, News, Testimonials, CTA
│   ├── ui/                 ← Container, Section, Button, GlassCard, Eyebrow, SectionHeading
│   ├── motion/             ← FadeIn, Stagger, Magnetic wrappers
│   └── background/         ← AmbientGlow, GridOverlay
│
├── content/                ← ⚡ Edit these to update the site
│   ├── site.ts             ← Brand, nav, socials, contact
│   ├── stats.ts            ← Community stats
│   ├── benefits.ts         ← Why LCB pillars
│   ├── events.ts           ← Upcoming + past events
│   ├── team.ts             ← Team members
│   ├── campusLeads.ts      ← Campus leads roster
│   ├── news.ts             ← Newsroom items
│   ├── testimonials.ts     ← Community quotes
│   └── gallery.ts          ← Storytelling photography
│
└── lib/
    ├── motion.ts           ← Easings, variants, springs
    └── utils.ts            ← cn() helper
```

---

## ✦ Editing content

**All site content lives in `src/content/`** as typed objects. You almost never need to touch JSX.

### Add a new team member

```ts
// src/content/team.ts
export const team: TeamMember[] = [
  // ... existing members
  {
    id: "new-person",
    name: "New Person",
    role: "Lead · Something",
    bio: "Short, punchy bio (~1–2 sentences).",
    image: "https://your-cdn.com/photo.jpg",
    social: {
      linkedin: "https://linkedin.com/in/...",
      github: "https://github.com/...",
    },
  },
];
```

### Add a news item

```ts
// src/content/news.ts
{
  id: "unique-slug",
  title: "Headline",
  summary: "1–2 sentence summary.",
  date: "2026-06-15",
  dateLabel: "Jun 15, 2026",
  category: "Announcement",   // or Event | Milestone | Partnership
  image: "https://...",
}
```

Same pattern for **events**, **stats**, **benefits**, **campus leads**, **testimonials**, **gallery**.

### Change brand details / socials

`src/content/site.ts` is the single source of truth for the brand name, tagline, socials (LinkedIn, Facebook page, Facebook group), nav, and contact info.

---

## ✦ Design system at a glance

### Colors (`tailwind.config.ts`)

- `ink-50 → ink-600` — deep navy foundation tones
- `brand-50 → brand-900` — LinkedIn blue spectrum (`brand-500` = `#0A66C2`)
- `cyan-400/500` — electric accent
- `indigo-400/500` — soft secondary accent

### Typography (fluid scale)

- `text-display-xl` — Hero headlines
- `text-display-lg` — CTA headlines
- `text-display-md` — Section titles
- `text-display-sm` — Quotes / sub-titles

Italic accents use `.serif-italic` (Instrument Serif).

### Motion (`src/lib/motion.ts`)

- `fadeUp`, `fadeIn`, `scaleIn`, `slideInLeft`, `slideInRight`
- `staggerContainer(stagger, delayChildren)` — orchestration
- `spring` / `softSpring` — physically-believable easings

### Background atmosphere

`<AmbientGlow />` + `<GridOverlay />` are placed inside sections that need extra depth. The page-level film grain + radial wash lives in `globals.css`.

---

## ✦ Deploy to Vercel

```bash
# Just push to GitHub and import on Vercel
# OR
npx vercel
```

Zero config. The project is set up with image optimization for `images.unsplash.com` and `media.licdn.com` out of the box — add your CDN domain to `next.config.ts` when swapping placeholders for real assets.

---

## ✦ Roadmap

- [ ] `/events/[slug]` dynamic event pages
- [ ] `/news/[slug]` article pages with MDX
- [ ] `/team/[slug]` member detail pages
- [ ] Campus Leads application form
- [ ] Bengali (বাংলা) language toggle
- [ ] Open Graph image generation per page

---

> A movement, not a meetup. Built in Dhaka, for Bangladesh.
