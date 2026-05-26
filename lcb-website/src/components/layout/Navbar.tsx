"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Linkedin, Facebook, Users, Instagram } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigation, siteConfig } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { SearchModal } from "@/components/ui/SearchModal";

const mobileSocials = [
  { label: "LinkedIn", href: siteConfig.socials.linkedin, Icon: Linkedin },
  { label: "Facebook", href: siteConfig.socials.facebookPage, Icon: Facebook },
  { label: "Group",    href: siteConfig.socials.facebookGroup, Icon: Users },
  { label: "Instagram",href: siteConfig.socials.instagram, Icon: Instagram },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  // Scroll-aware navbar styling
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active-section indicator via IntersectionObserver
  useEffect(() => {
    const ids = navigation
      .filter((n) => n.href.startsWith("#"))
      .map((n) => n.href.replace("#", ""));
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(`#${visible[0].target.id}`);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0.1, 0.5, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:pt-5"
      >
        <nav
          className={cn(
            "flex w-full max-w-6xl items-center justify-between gap-4 rounded-full px-3 py-2 sm:px-4",
            "transition-all duration-500",
            scrolled
              ? "border border-white/[0.08] bg-ink-100/70 backdrop-blur-xl shadow-[0_8px_40px_-8px_rgba(0,0,0,0.5)]"
              : "border border-transparent bg-transparent"
          )}
        >
          <Link
            href="/"
            className="flex items-center pl-1 focus-ring rounded-full"
            aria-label={`${siteConfig.name} home`}
          >
            <Image
              src="/logo.svg"
              alt="LCB — LinkedIn Community Bangladesh"
              width={80}
              height={24}
              priority
              className="h-6 w-auto"
            />
          </Link>

          <ul className="hidden items-center gap-0.5 md:flex">
            {navigation.map((item) => {
              const isExternal = item.href.startsWith("http");
              const isActive = !isExternal && active === item.href;
              const linkCls = cn(
                "relative rounded-full px-3.5 py-1.5 text-sm transition-colors duration-300 focus-ring",
                isActive
                  ? "text-white"
                  : "text-white/65 hover:bg-white/[0.05] hover:text-white"
              );
              return (
                <li key={item.href} className="relative">
                  {isExternal ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkCls}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link href={item.href} className={linkCls}>
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 -z-10 rounded-full bg-white/[0.07]"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <SearchModal />
            <Button
              href={siteConfig.socials.linkedin}
              external
              variant="primary"
              size="sm"
              className="hidden sm:inline-flex"
            >
              Join LCB
            </Button>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full glass text-white md:hidden focus-ring"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              <AnimatePresence mode="wait" initial={false}>
                {open ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -45, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 45, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-4 w-4" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 45, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -45, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-4 w-4" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile menu sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 bg-ink-50/95 backdrop-blur-2xl md:hidden"
          >
            <motion.ul
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              exit={{ y: 20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-full flex-col items-center justify-center gap-6 px-8"
            >
              {navigation.map((item, i) => {
                const isExternal = item.href.startsWith("http");
                return (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.07, duration: 0.6 }}
                  >
                    {isExternal ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setOpen(false)}
                        className="font-display text-4xl font-medium text-gradient-editorial hover:text-white"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="font-display text-4xl font-medium text-gradient-editorial hover:text-white"
                      >
                        {item.label}
                      </Link>
                    )}
                  </motion.li>
                );
              })}
              <motion.li
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-6"
              >
                <Button href={siteConfig.socials.linkedin} external arrow size="lg">
                  Represent LCB on your campus
                </Button>
              </motion.li>

              {/* Social links */}
              <motion.li
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.62, duration: 0.5 }}
                className="mt-8"
              >
                <div className="flex items-center gap-4">
                  {mobileSocials.map(({ label, href, Icon }) => (
                    <Link
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      onClick={() => setOpen(false)}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.04] text-white/50 transition-all duration-200 hover:border-brand-400/30 hover:text-white"
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </Link>
                  ))}
                </div>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

