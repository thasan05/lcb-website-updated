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
  "frame-src 'none'",
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
    ];
  },

  async headers() {
    return [
      {
        // Apply security headers to every route
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  images: {
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
  },
};

export default nextConfig;
