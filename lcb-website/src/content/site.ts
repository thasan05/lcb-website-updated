export const siteConfig = {
  name: "LinkedIn Community BD",
  shortName: "LCB",
  tagline: "Bangladesh's First LinkedIn-Based Professional Community",
  description:
    "Empowering students, creators, developers, founders, and future leaders across Bangladesh through the nation's premier LinkedIn-based professional growth movement.",
  url: "https://linkedincommunitybangladesh.com",
  ogImage: "/og.png",

  // Public-facing socials (from user-provided links)
  socials: {
    facebookGroup:    "https://www.facebook.com/groups/564603970411433",
    facebookPage:     "https://www.facebook.com/LCB.Linkedin",
    linkedin:         "https://www.linkedin.com/company/linkedin-community-bangladesh-lcb",
    instagram:        "https://www.instagram.com/linkedincommunitybangladesh",
    // LCB Official Groups
    linkedinGroup:    "https://www.linkedin.com/groups/14042318",
    facebookGroupAlt: "https://www.facebook.com/share/g/17ZZUjsGrX/",
    // JIVON — Jobs, Internships, Vacancies, Opportunities & Networking
    jivonLinkedin:    "https://www.linkedin.com/groups/10364216",
    jivonFacebook:    "https://www.facebook.com/share/g/1GNDFT124Q/",
  },

  contact: {
    email: "linkedincommunitybangladesh@gmail.com",
    location: "Dhaka, Bangladesh",
  },

  // ── Campus Lead Applications ────────────────────────────────────────────
  //
  // CLOSED (default):
  //   open: false   →  button shows "applications closed" modal
  //
  // OPEN:
  //   1. Paste your Google Form URL into  formUrl
  //   2. Set  open: true
  //   →  button links directly to the form
  //
  // Campus Lead applications
  applications: {
    open: false,
    formUrl: "", // e.g. "https://forms.gle/xxxxxxx"
  },

  // Central Team applications — same toggle pattern
  centralApplications: {
    open: false,
    formUrl: "", // e.g. "https://forms.gle/xxxxxxx"
  },
} as const;

export const navigation = [
  { label: "About",    href: "#story"   },
  { label: "Events",   href: "#events"  },
  { label: "Team",     href: "#team"    },
  { label: "Gallery",  href: "#gallery" },
  { label: "Newsroom", href: "#news"    },
] as const;

export type SiteConfig = typeof siteConfig;
