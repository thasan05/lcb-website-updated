"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Linkedin, Facebook, Users, Instagram, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigation, siteConfig } from "@/content/site";
import { SearchModal } from "@/components/ui/SearchModal";
import { useLenis } from "@/components/motion/SmoothScroll";

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
  const { scrollTo } = useLenis();

  // Scroll-aware navbar styling
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
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
      { rootMargin: "-35% 0px -45% 0px", threshold: [0.1, 0.5, 1] }
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

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      scrollTo(href, { offset: -70, duration: 1.3 });
      history.pushState(null, "", href);
      setOpen(false);
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-6 sm:pt-4"
      >
        <nav
          className={cn(
            "relative flex w-full max-w-5xl items-center justify-between gap-4 rounded-full px-3.5 py-2 sm:px-5 sm:py-2.5",
            "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            scrolled
              ? "border border-white/[0.12] bg-[#000000]/70 backdrop-blur-2xl shadow-[0_16px_40px_-12px_rgba(0,0,0,0.8),0_0_20px_rgba(255,255,255,0.03)]"
              : "border border-white/[0.05] bg-[#000000]/30 backdrop-blur-md"
          )}
        >
          {/* Top gloss highlight on navbar */}
          <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Apple-style minimalist logo */}
          <Link
            href="/"
            className="group flex items-center pl-1 focus-ring rounded-full transition-transform duration-300 hover:scale-[1.03]"
            aria-label={`${siteConfig.name} home`}
          >
            <Image
              src="/logo.svg"
              alt="LCB — LinkedIn Community Bangladesh"
              width={80}
              height={24}
              priority
              className="h-6 w-auto transition-opacity duration-300 group-hover:opacity-90"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => {
              const isExternal = item.href.startsWith("http");
              const isActive = !isExternal && active === item.href;
              const linkCls = cn(
                "relative rounded-full px-3.5 py-1.5 text-[13px] font-medium tracking-tight transition-all duration-300 focus-ring",
                isActive
                  ? "text-white"
                  : "text-white/60 hover:text-white hover:bg-white/[0.06]"
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
                    <a
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className={linkCls}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="navbar-active-pill"
                          className="absolute inset-0 -z-10 rounded-full bg-white/[0.12] shadow-[0_0_12px_rgba(255,255,255,0.08)]"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      {item.label}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2">
            <SearchModal />

            {/* Apple-grade Join Button */}
            <a
              href={siteConfig.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative hidden sm:inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-white px-4 text-xs font-semibold text-black shadow-[0_0_20px_rgba(255,255,255,0.25)] transition-all duration-300 hover:bg-white/90 hover:scale-[1.02] active:scale-[0.97]"
            >
              <span>Join LCB</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2.5} />
            </a>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white backdrop-blur-lg transition-transform duration-200 active:scale-95 md:hidden focus-ring"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              <AnimatePresence mode="wait" initial={false}>
                {open ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-4 w-4" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
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

      {/* Apple-style Fullscreen Mobile Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-black/90 md:hidden flex flex-col justify-between p-8 pt-24"
          >
            <motion.ul
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              exit={{ y: 20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-6"
            >
              {navigation.map((item, i) => {
                const isExternal = item.href.startsWith("http");
                return (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {isExternal ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setOpen(false)}
                        className="font-display text-3xl font-semibold tracking-tight text-white/80 hover:text-white transition-colors flex items-center justify-between"
                      >
                        <span>{item.label}</span>
                        <ArrowUpRight className="h-5 w-5 text-white/40" />
                      </a>
                    ) : (
                      <a
                        href={item.href}
                        onClick={(e) => handleNavClick(e, item.href)}
                        className="font-display text-3xl font-semibold tracking-tight text-white/80 hover:text-white transition-colors"
                      >
                        {item.label}
                      </a>
                    )}
                  </motion.li>
                );
              })}
            </motion.ul>

            {/* Mobile Footer CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="space-y-6 pt-6 border-t border-white/10"
            >
              <a
                href={siteConfig.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-black shadow-[0_0_24px_rgba(255,255,255,0.2)] active:scale-95 transition-transform"
              >
                <span>Join LCB on LinkedIn</span>
                <ArrowUpRight className="h-4 w-4" />
              </a>

              <div className="flex items-center justify-center gap-4">
                {mobileSocials.map(({ label, href, Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    onClick={() => setOpen(false)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/60 transition-colors hover:text-white hover:border-white/30"
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
