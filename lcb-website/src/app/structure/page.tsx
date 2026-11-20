import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/ui/BackToTop";
import { DynamicFloatingBar } from "@/components/ui/DynamicFloatingBar";
import { StructureDashboard } from "@/components/structure/StructureDashboard";
import { getStructureData } from "@/lib/structure-sheet";
import { siteConfig } from "@/content/site";

export const revalidate = 300; // Auto-regenerates every 5 minutes from live Google Sheet

export const metadata: Metadata = {
  title: "Organizational Hierarchy & Headcount | LinkedIn Community Bangladesh",
  description:
    "Explore the official organizational structure, leadership hierarchy, central departments, campus leads, and initiatives of LinkedIn Community Bangladesh.",
  openGraph: {
    title: "Organizational Hierarchy & Headcount — LCB",
    description:
      "One view of who leads LCB, how the teams are organised, and how many people sit in each part.",
    url: `${siteConfig.url}/structure`,
    siteName: siteConfig.name,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
  },
};

export default async function StructurePage() {
  const data = await getStructureData();

  return (
    <>
      <Navbar />
      <main className="relative">
        <StructureDashboard data={data} />
      </main>
      <Footer />
      <DynamicFloatingBar />
      <BackToTop />
    </>
  );
}
