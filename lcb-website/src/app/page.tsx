import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
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

export const dynamic = "force-dynamic";

export default function HomePage() {
  const appsConfig = getApplicationsConfig();

  return (
    <>
      <Navbar />
      <main className="relative">
        <Hero applicationsConfig={appsConfig} />
        <Story />
        <Stats />
        <Events />
        <Team />
        <Gallery />
        <News />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
