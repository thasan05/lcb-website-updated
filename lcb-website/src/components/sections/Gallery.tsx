import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MasonryGallery } from "@/components/gallery/MasonryGallery";
import manifest from "@/data/gallery/manifest.json";

/**
 * Gallery section — data-driven from /src/data/gallery/manifest.json
 *
 * To add photos locally:
 *   1. Drop images into /public/gallery/{category}/
 *   2. Run:  npm run gallery
 *   3. Commit the updated manifest.json
 *
 * To add remote/CDN images:
 *   Edit manifest.json directly — add an entry with a full https:// src URL.
 */
export function Gallery() {
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
