"use client";

import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { testimonials } from "@/content/testimonials";

export function Testimonials() {
  const row1 = [...testimonials.slice(0, 3), ...testimonials.slice(0, 3)];
  const row2 = [...testimonials.slice(3), ...testimonials.slice(3)];

  return (
    <Section id="testimonials" className="overflow-hidden">
      <Container>
        <SectionHeading
          align="center"
          eyebrow={<Eyebrow>Voices</Eyebrow>}
          title={
            <>
              What the community <span className="serif-italic">says.</span>
            </>
          }
          description="Students, founders and campus leads on what LCB has meant to them."
          maxWidth="medium"
        />
      </Container>

      <div className="relative mt-16 space-y-6">
        {/* Edge fade masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-ink-100 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-ink-100 to-transparent" />

        <MarqueeRow items={row1} direction="left" />
        <MarqueeRow items={row2} direction="right" />
      </div>
    </Section>
  );
}

function MarqueeRow({
  items,
  direction,
}: {
  items: typeof testimonials;
  direction: "left" | "right";
}) {
  return (
    <div className="flex overflow-hidden">
      <div
        className="flex shrink-0 gap-6 pr-6"
        style={{
          animation: `marquee ${direction === "left" ? "60s" : "75s"} linear infinite`,
          animationDirection: direction === "right" ? "reverse" : "normal",
        }}
      >
        {items.map((t, i) => (
          <article
            key={`${t.id}-${i}`}
            className="group relative w-[360px] shrink-0 overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-7 backdrop-blur-xl transition-colors duration-500 hover:border-white/[0.14] sm:w-[440px] sm:p-9"
          >
            {/* Top highlight */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            {/* Decorative serif quote glyph */}
            <span
              aria-hidden
              className="serif-italic pointer-events-none absolute -right-2 -top-6 font-display text-[6rem] leading-none text-brand-400/15"
            >
              &rdquo;
            </span>

            <p className="relative font-display text-lg leading-relaxed text-white/85 [text-wrap:pretty] sm:text-xl">
              <span className="serif-italic text-white/95">&ldquo;</span>
              {t.quote}
              <span className="serif-italic text-white/95">&rdquo;</span>
            </p>
            <div className="relative mt-6 flex items-center gap-3 border-t border-white/[0.06] pt-5">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-brand-400/20">
                {t.image ? (
                  <Image
                    src={t.image}
                    alt={t.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-500/30 to-brand-500/10 text-sm font-medium text-brand-200">
                    {t.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{t.name}</p>
                <p className="text-xs text-white/45">{t.role}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
