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
import { Testimonials } from "@/components/sections/Testimonials";
import { CTA } from "@/components/sections/CTA";
import { getApplicationsConfig } from "@/lib/admin";
import { kvGet } from "@/lib/kv";
import type { TeamMember } from "@/data/team";
import type { Event } from "@/content/events";
import type { NewsItem } from "@/content/news";

type GalleryCategory = { id: string; label: string };
type GalleryImage    = { id: string; src: string; category: string; alt: string; caption?: string };
type GalleryManifest = { version: number; categories: GalleryCategory[]; images: GalleryImage[] };

export const dynamic = "force-dynamic";

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
  const [appsConfig, teamData, liveEvents, liveNews, liveGallery] = await Promise.all([
    getApplicationsConfig(),
    getTeamData(),
    kvGet<Event[]>("data:events").catch(() => null),
    kvGet<NewsItem[]>("data:news").catch(() => null),
    kvGet<GalleryManifest>("data:gallery-manifest").catch(() => null),
  ]);

  return (
    <>
      <Navbar />
      <main className="relative">
        <Hero applicationsConfig={appsConfig} />
        <Story />
        <Stats />
        <Events liveEvents={liveEvents ?? undefined} />
        <Team liveMembers={teamData} />
        <Gallery liveManifest={liveGallery ?? undefined} />
        <News liveNews={liveNews ?? undefined} />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
