import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        sm: "1.5rem",
        lg: "2rem",
        xl: "3rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1200px",
        "2xl": "1320px",
      },
    },
    extend: {
      colors: {
        // Foundation
        ink: {
          0: "#000000",
          50: "#02030A",
          100: "#040614",
          200: "#070A1F",
          300: "#0B0F2A",
          400: "#101637",
          500: "#161E48",
          600: "#1F2A5E",
        },
        // LinkedIn Blue spectrum
        brand: {
          50: "#E8F2FD",
          100: "#C8DFFA",
          200: "#8BBEF3",
          300: "#4F9CEB",
          400: "#2A82D9",
          500: "#0A66C2", // primary
          600: "#0858A8",
          700: "#06497E",
          800: "#053A66",
          900: "#042C4D",
        },
        // Electric cyan accent
        cyan: {
          400: "#22D3EE",
          500: "#06B6D4",
        },
        // Soft indigo
        indigo: {
          400: "#818CF8",
          500: "#6366F1",
        },
      },
      fontFamily: {
        sans:    ["var(--font-geist)", "system-ui", "sans-serif"],
        display: ["var(--font-jakarta)", "var(--font-geist)", "system-ui", "sans-serif"],
        serif:   ["var(--font-instrument)", "Georgia", "serif"],
        mono:    ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Fluid editorial scale
        "display-xl": ["clamp(2.8rem, 7.5vw, 7rem)",  { lineHeight: "0.96", letterSpacing: "-0.035em" }],
        "display-lg": ["clamp(2.2rem, 5.5vw, 5rem)",  { lineHeight: "0.98", letterSpacing: "-0.03em"  }],
        "display-md": ["clamp(2rem, 4.5vw, 4rem)", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
        "display-sm": ["clamp(1.5rem, 3vw, 2.5rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
      },
      spacing: {
        "section": "clamp(5rem, 10vw, 9rem)",
        "section-sm": "clamp(3rem, 6vw, 5rem)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
        "radial-fade": "radial-gradient(ellipse at center, var(--tw-gradient-stops))",
        "noise":
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(10, 102, 194, 0.4)",
        "glow-lg": "0 0 80px -15px rgba(10, 102, 194, 0.5)",
        "inner-glow": "inset 0 1px 0 0 rgba(255,255,255,0.06)",
      },
      animation: {
        "float": "float 18s ease-in-out infinite",
        "float-slow": "float 26s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "pulse-glow": "pulseGlow 4s ease-in-out infinite",
        "marquee": "marquee 40s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -30px) scale(1.05)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.97)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.7" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
