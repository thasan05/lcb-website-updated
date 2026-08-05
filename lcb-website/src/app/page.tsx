import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/ui/BackToTop";
import { Hero } from "@/components/sections/Hero";
import { Story } from "@/components/sections/Story";
import { Stats } from "@/components/sections/Stats";
import { Events } from "@/components/sections/Events";
import { Team } from "@/components/sections/Team";
import { Gallery } from "@/components/sections/Gallery";
import { News } from "@/components/sections/News";
import { Forum } from "@/components/sections/Forum";
import { Press } from "@/components/sections/Press";
import { LorSection } from "@/components/sections/LorSection";
import { Testimonials } from "@/components/sections/Testimonials";
import { CTA } from "@/components/sections/CTA";
import { PageViewTracker } from "@/components/ui/PageViewTracker";
import { getApplicationsConfig } from "@/lib/admin";
import { kvGet } from "@/lib/kv";
import { siteConfig } from "@/content/site";
import type { TeamMember } from "@/data/team";
import type { Event } from "@/content/events";
import type { NewsItem } from "@/content/news";
import type { Article } from "@/content/articles";
import type { PressItem } from "@/content/press";
import type { LorConfig } from "@/content/lor";
import type { GalleryItem } from "@/content/gallery";

type GalleryCategory = { id: string; label: string };
type GalleryImage    = { id: string; src: string; category: string; alt: string; caption?: string };
type GalleryManifest = { version: number; categories: GalleryCategory[]; images: GalleryImage[] };

// ISR: served from cache, rebuilt at most every 5 min. Admin writes call
// revalidateContent() so saves appear immediately rather than after the window.
export const revalidate = 300;

const TEAM_KEYS: Record<string, string> = {
  central:        "team:central",
  "campus-leads": "team:campus-leads",
  heads:          "team:lcb-heads",
  professionals:  "team:professionals",
  initiatives:    "team:initiatives",
  "star-awards":  "team:star-awards",
};

async function getTeamData(): Promise<Record<string, TeamMember[]>> {
  try {
    const entries = await Promise.all(
      Object.entries(TEAM_KEYS).map(async ([id, key]) => [id, await kvGet<TeamMember[]>(key)] as const)
    );
    return Object.fromEntries(entries);
  } catch {
    return {};
  }
}

export default async function HomePage() {
  const [appsConfig, teamData, liveEvents, liveNews, liveGallery, liveArticles, livePress, lorConfig, liveStory] = await Promise.all([
    getApplicationsConfig(),
    getTeamData(),
    kvGet<Event[]>("data:events").catch(() => null),
    kvGet<NewsItem[]>("data:news").catch(() => null),
    kvGet<GalleryManifest>("data:gallery-manifest").catch(() => null),
    kvGet<Article[]>("data:articles").catch(() => null),
    kvGet<PressItem[]>("data:press").catch(() => null),
    kvGet<LorConfig>("data:lor-config").catch(() => null),
    kvGet<GalleryItem[]>("data:story-gallery").catch(() => null),
  ]);

  // JSON-LD structured data
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LinkedIn Community Bangladesh",
    alternateName: "LCB",
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.svg`,
    description: siteConfig.description,
    sameAs: [
      siteConfig.socials.linkedin,
      siteConfig.socials.facebookPage,
      siteConfig.socials.instagram,
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: siteConfig.contact.email,
      contactType: "customer support",
      areaServed: "BD",
      availableLanguage: ["English", "Bengali"],
    },
  };

  const eventsJsonLd = (liveEvents ?? [])
    .filter((e) => e.status === "upcoming")
    .slice(0, 5)
    .map((e) => ({
      "@context": "https://schema.org",
      "@type": "Event",
      name: e.title,
      startDate: e.date,
      description: e.description,
      location: {
        "@type": "Place",
        name: e.location,
      },
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode:
        e.format === "Online"
          ? "https://schema.org/OnlineEventAttendanceMode"
          : e.format === "Hybrid"
          ? "https://schema.org/MixedEventAttendanceMode"
          : "https://schema.org/OfflineEventAttendanceMode",
      organizer: {
        "@type": "Organization",
        name: "LinkedIn Community Bangladesh",
        url: siteConfig.url,
      },
    }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      {eventsJsonLd.map((ev, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ev) }}
        />
      ))}
      <PageViewTracker />
      <Navbar />
      <main className="relative">
        <Hero applicationsConfig={appsConfig} />
        <Story items={liveStory ?? undefined} />
        <Stats />
        <Events liveEvents={liveEvents ?? undefined} />
        <Team liveMembers={teamData} />
        <Gallery liveManifest={liveGallery ?? undefined} />
        <News liveNews={liveNews ?? undefined} />
        <Press items={livePress ?? []} />
        <Forum articles={liveArticles ?? []} />
        {lorConfig && (
          <LorSection config={{ open: lorConfig.open, closedMessage: lorConfig.closedMessage, rules: lorConfig.rules }} />
        )}
        <Testimonials />
        <CTA />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
