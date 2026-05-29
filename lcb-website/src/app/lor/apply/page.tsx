import { kvGet } from "@/lib/kv";
import type { LorConfig } from "@/content/lor";
import { LorApplyForm } from "./LorApplyForm";
import { Navbar } from "@/components/layout/Navbar";
import { FooterLive } from "@/components/layout/FooterLive";
import { BackToTop } from "@/components/ui/BackToTop";

export const dynamic = "force-dynamic";

export default async function LorApplyPage() {
  let config: LorConfig | null = null;
  try {
    config = await kvGet<LorConfig>("data:lor-config");
  } catch {
    /* fall through */
  }

  if (!config) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[70vh] items-center justify-center bg-[#0a0a0f] px-4">
          <p className="text-sm text-white/40">
            Configuration unavailable — please try again later.
          </p>
        </main>
        <FooterLive />
      </>
    );
  }

  return (
    <div className="bg-[#0a0a0f]">
      <Navbar />
      <LorApplyForm config={config} />
      <FooterLive />
      <BackToTop />
    </div>
  );
}
