import Link from "next/link";
import { Linkedin, Facebook, Users, Instagram } from "lucide-react";
import { siteConfig, navigation } from "@/content/site";
import { Container } from "@/components/ui/Container";

const socialLinks = [
  { label: "LinkedIn", href: siteConfig.socials.linkedin, icon: Linkedin },
  { label: "Facebook Page", href: siteConfig.socials.facebookPage, icon: Facebook },
  { label: "Facebook Group", href: siteConfig.socials.facebookGroup, icon: Users },
  { label: "Instagram", href: siteConfig.socials.instagram, icon: Instagram },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] pt-20">
      {/* Section connector thread */}
      <span className="section-thread" aria-hidden />

      {/* Ambient bottom glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[120%] -translate-x-1/2 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse 50% 100% at 50% 100%, rgba(10,102,194,0.18), transparent 70%)",
        }}
      />

      {/* Giant brand wordmark */}
      <Container className="relative mb-12">
        <div className="overflow-hidden">
          <h2
            aria-hidden
            className="font-display select-none text-[clamp(4rem,16vw,14rem)] font-bold leading-[0.85] tracking-[-0.05em] text-gradient-editorial opacity-[0.85]"
          >
            LinkedIn Community Bangladesh
          </h2>
        </div>
      </Container>

      <Container className="relative">
        <div className="grid grid-cols-1 gap-12 border-t border-white/[0.06] pt-12 md:grid-cols-12">
          {/* Left: tagline */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 shadow-glow">
                <span className="font-display text-sm font-bold text-white">in</span>
                <span className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-b from-white/30 to-transparent mix-blend-overlay" />
              </span>
              <span className="font-display text-lg font-medium tracking-tight text-white">
                LinkedIn Community Bangladesh
              </span>
            </div>

            <p className="mt-6 max-w-sm text-balance text-base leading-relaxed text-white/55">
              {siteConfig.tagline}. Building Bangladesh&apos;s most ambitious
              professional growth movement — one connection at a time.
            </p>

            <div className="mt-8 flex gap-3">
              {socialLinks.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full glass text-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-400/30 hover:text-white hover:shadow-glow"
                >
                  <s.icon className="h-4 w-4" strokeWidth={1.75} />
                </Link>
              ))}
            </div>
          </div>

          {/* Middle: nav */}
          <div className="md:col-span-3">
            <h3 className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-white/40">
              Explore
            </h3>

            <ul className="space-y-3">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-2 text-[15px] text-white/70 transition-colors hover:text-white"
                  >
                    <span className="h-px w-3 bg-white/30 transition-all duration-300 group-hover:w-6 group-hover:bg-brand-400" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: contact */}
          <div className="md:col-span-4">
            <h3 className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-white/40">
              Get in touch
            </h3>

            <ul className="space-y-3">
              <li>
                <Link
                  href={`mailto:${siteConfig.contact.email}`}
                  className="text-[15px] text-white/70 transition-colors hover:text-white"
                >
                  {siteConfig.contact.email}
                </Link>
              </li>

              <li className="text-[15px] text-white/55">
                {siteConfig.contact.location}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/[0.06] py-8 text-xs text-white/40 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. A movement, not a meetup.
          </p>

          <p className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
            Built by Tanvir Hasan.
          </p>
        </div>
      </Container>
    </footer>
  );
}