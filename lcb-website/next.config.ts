import type { NextConfig } from "next";

// ── Content Security Policy ───────────────────────────────────────────────────
// next/font/google self-hosts fonts at build time → no external font CDN needed.
// @vercel/analytics connects to va.vercel-insights.com.
// Admin direct-uploads go to api.cloudinary.com.
const CSP = [
  "default-src 'self'",
  // Next.js App Router inlines hydration scripts — unsafe-inline required
  // until nonce-based CSP is wired through middleware (future hardening).
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  [
    "img-src 'self' data: blob:",
    "https://res.cloudinary.com",
    "https://media.licdn.com",
    "https://images.unsplash.com",
  ].join(" "),
  "font-src 'self' data:",
  [
    "connect-src 'self'",
    "https://api.cloudinary.com",
    "https://va.vercel-insights.com",
  ].join(" "),
  "frame-src 'self' https://res.cloudinary.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  // Prevent browsers inferring MIME types (MIME-sniffing attacks)
  { key: "X-Content-Type-Options",    value: "nosniff" },
  // Clickjacking protection (belt + CSP frame-ancestors suspenders)
  { key: "X-Frame-Options",           value: "DENY" },
  // Disable legacy XSS filter (can be weaponised in older IE/Edge)
  { key: "X-XSS-Protection",         value: "0" },
  // Control referrer header leakage
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  // Disable unused platform APIs
  {
    key:   "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Force HTTPS for 2 years, include subdomains, submit to preload list
  {
    key:   "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Full CSP
  { key: "Content-Security-Policy",   value: CSP },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: "/",
        destination: "/shout",
        has: [{ type: "host", value: "shout.linkedincommunitybangladesh.com" }],
      },
      {
        source: "/og.png",
        destination: "/opengraph-image",
      },
      {
        source: "/news/:id/og.jpg",
        destination: "/news/:id/opengraph-image",
      },
      {
        source: "/news/:id/opengraph-image.jpg",
        destination: "/news/:id/opengraph-image",
      },
    ];
  },

  async headers() {
    return [
      {
        // Apply security headers to every route
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // RFC 8288 Link headers for agent discovery on the homepage
        source: "/",
        headers: [
          {
            key: "Link",
            value: [
              '</.well-known/api-catalog>; rel="api-catalog"',
              '</sitemap.xml>; rel="sitemap"',
              '</.well-known/agent-skills/index.json>; rel="https://agentskills.io/rels/skills-index"',
            ].join(", "),
          },
        ],
      },
      {
        // PDF proxy — must be embeddable in same-origin iframe on magazine reader.
        // Override X-Frame-Options and frame-ancestors so the iframe can load it.
        source: "/api/magazine/:id/pdf",
        headers: [
          { key: "X-Frame-Options",           value: "SAMEORIGIN" },
          { key: "Content-Security-Policy",   value: "frame-ancestors 'self'" },
        ],
      },
      {
        // /card serves a standalone HTML page that loads fonts from Google CDN
        // Override CSP to permit fonts.googleapis.com + fonts.gstatic.com
        source: "/card",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob:",
              "font-src 'self' data: https://fonts.gstatic.com",
              [
                "connect-src 'self'",
                "https://fonts.googleapis.com",
                "https://fonts.gstatic.com",
              ].join(" "),
              "frame-src 'self' https://res.cloudinary.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },

  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "media.licdn.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react"],
  },
  outputFileTracingIncludes: {
    "/**": ["./src/content/data/**/*.json", "./src/data/**/*.json"],
    "/card": ["./src/app/card/studio.html"],
  },
  outputFileTracingExcludes: {
    "**/*": [
      "node_modules/sharp/**/*",
      "node_modules/@img/**/*",
    ],
  },
};

export default nextConfig;
