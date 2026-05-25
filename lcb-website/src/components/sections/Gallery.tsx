import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MasonryGallery } from "@/components/gallery/MasonryGallery";
import staticManifest from "@/data/gallery/manifest.json";

type GalleryCategory = { id: string; label: string };
type GalleryImage    = { id: string; src: string; category: string; alt: string; caption?: string };
type Manifest        = { version: number; categories: GalleryCategory[]; images: GalleryImage[] };

interface Props {
  liveManifest?: Manifest;
}

export function Gallery({ liveManifest }: Props) {
  const manifest = liveManifest ?? (staticManifest as Manifest);

  return (
    <Section id="gallery">
      <Container>
        <SectionHeading
          align="center"
          eyebrow={<Eyebrow>Gallery</Eyebrow>}
          title={
            <>
              Moments from <span className="serif-italic">the movement.</span>
            </>
          }
          description="Events, sessions, campus gatherings, and the community behind it all."
          maxWidth="medium"
        />

        <div className="mt-14">
          <MasonryGallery
            images={manifest.images}
            categories={manifest.categories}
          />
        </div>
      </Container>
    </Section>
  );
}
