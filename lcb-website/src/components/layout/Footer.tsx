import Link from "next/link";
import { Linkedin, Facebook, Users, Instagram } from "lucide-react";
import { siteConfig, navigation } from "@/content/site";
import { Container } from "@/components/ui/Container";
import { FooterWordmark } from "./FooterWordmark";
import { FooterLive } from "./FooterLive";

const socialLinks = [
  { label: "LinkedIn",      href: siteConfig.socials.linkedin,      icon: Linkedin  },
  { label: "Facebook Page", href: siteConfig.socials.facebookPage,  icon: Facebook  },
  { label: "LCB Group",     href: siteConfig.socials.facebookGroup, icon: Users     },
  { label: "Instagram",     href: siteConfig.socials.instagram,     icon: Instagram },
];

const groupLinks = [
  { label: "LinkedIn Group", href: siteConfig.socials.linkedinGroup,    icon: Linkedin },
  { label: "Facebook Group", href: siteConfig.socials.facebookGroupAlt, icon: Facebook },
];

const jivonLinks = [
  { label: "JIVON on LinkedIn", href: siteConfig.socials.jivonLinkedin, icon: Linkedin },
  { label: "JIVON on Facebook", href: siteConfig.socials.jivonFacebook, icon: Facebook },
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
        <FooterWordmark />
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

            {/* Main social icons + LCB official groups */}
            <div className="mt-8 flex flex-wrap items-end gap-3">
              {/* Core 4 */}
              {socialLinks.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full glass text-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-400/30 hover:text-white hover:shadow-glow"
                >
                  <s.icon className="h-4 w-4" strokeWidth={1.75} />
                </Link>
              ))}

              {/* Divider */}
              <span className="h-6 w-px bg-white/[0.10]" aria-hidden />

              {/* LCB Official Groups — amber tinted to distinguish from core socials */}
              {groupLinks.map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-1">
                  <Link
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-400/25 bg-amber-400/[0.07] text-amber-300/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-400/45 hover:bg-amber-400/[0.14] hover:text-amber-200 hover:shadow-[0_0_18px_rgba(251,191,36,0.18)]"
                  >
                    <s.icon className="h-4 w-4" strokeWidth={1.75} />
                  </Link>
                  <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-amber-400/60">
                    Group
                  </span>
                </div>
              ))}
            </div>

            {/* JIVON initiative links */}
            <div className="mt-5 flex flex-col gap-1.5">
              <div className="flex items-center gap-3">
              {/* JIVON badge */}
              <div className="relative flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-400/[0.07] px-3 py-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
                <span className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300">
                  JIVON
                </span>
              </div>

              {jivonLinks.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className="relative flex h-11 w-11 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-cyan-400/[0.12] hover:text-cyan-200 hover:shadow-[0_0_20px_rgba(34,211,238,0.20)]"
                >
                  <s.icon className="h-4 w-4" strokeWidth={1.75} />
                </Link>
              ))}
              </div>
            <p className="text-[10px] font-medium uppercase tracking-[0.20em]"
               style={{ color: "#c9a227" }}>
              An initiative of LCB
            </p>
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
            © {new Date().getFullYear()} {siteConfig.shortName}. All rights reserved.
          </p>

          <FooterLive />
        </div>
      </Container>
    </footer>
  );
}