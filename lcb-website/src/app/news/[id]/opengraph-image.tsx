import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";
import { kvGetCachedOr } from "@/lib/kv-cached";
import { news as staticNews, type NewsItem } from "@/content/news";
import { CATEGORY_COLORS, formatBroadDescription } from "@/lib/news-metadata";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";
export const alt = "LCB Newsroom Story Preview";

export async function generateStaticParams() {
  return staticNews.map((n) => ({ id: n.id }));
}

async function getNewsItem(id: string): Promise<NewsItem | null> {
  try {
    const live = await kvGetCachedOr<NewsItem[] | null>("data:news", null);
    if (live && live.length > 0) {
      const found = live.find((n) => n.id === id && n.published !== false);
      if (found) return found;
    }
  } catch {
    // fallback
  }
  return staticNews.find((n) => n.id === id && n.published !== false) ?? null;
}

/**
 * Loads local or remote story images into a lightweight base64 payload.
 */
async function getImageDataUri(imagePath?: string): Promise<string | null> {
  if (!imagePath) return null;
  if (imagePath.endsWith(".svg")) return null;

  try {
    const clean = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
    const fullPath = path.join(process.cwd(), "public", clean);
    if (fs.existsSync(fullPath)) {
      const stat = fs.statSync(fullPath);
      if (stat.size <= 256 * 1024) {
        const buf = fs.readFileSync(fullPath);
        const ext = path.extname(fullPath).toLowerCase();
        const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
        return `data:${mime};base64,${buf.toString("base64")}`;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export default async function NewsOGImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getNewsItem(id);

  if (!item) {
    return new ImageResponse(
      (
        <div
          style={{
            width: 1200,
            height: 630,
            background: "linear-gradient(135deg, #040614 0%, #080d24 60%, #040614 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "sans-serif",
            color: "#ffffff",
          }}
        >
          <div style={{ fontSize: 48, fontWeight: 800 }}>LCB Newsroom</div>
          <div style={{ fontSize: 24, color: "rgba(255,255,255,0.6)", marginTop: 12 }}>
            Story Not Found
          </div>
        </div>
      ),
      { ...size }
    );
  }

  const categoryStyle = CATEGORY_COLORS[item.category] ?? {
    bg: "rgba(59, 130, 246, 0.22)",
    border: "rgba(59, 130, 246, 0.55)",
    text: "#93c5fd",
    dot: "#3b82f6",
  };

  const imageSrc = await getImageDataUri(item.image);
  const broadDesc = formatBroadDescription(item.summary, 190);

  // Dynamic font sizing based on headline length to guarantee optimal presentation
  const titleFontSize =
    item.title.length > 90 ? 32 : item.title.length > 60 ? 36 : 42;

  const rawRes = new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "linear-gradient(135deg, #040614 0%, #080d26 55%, #030512 100%)",
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          justifyContent: "space-between",
          padding: "44px 50px",
          position: "relative",
          fontFamily: "sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Ambient background glow accents */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -80,
            width: 540,
            height: 540,
            background: "radial-gradient(circle, rgba(10, 102, 194, 0.32) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            right: 380,
            width: 440,
            height: 440,
            background: "radial-gradient(circle, rgba(6, 182, 212, 0.18) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Left Column: Brand, Category, Headline & Broader Description */}
        <div
          style={{
            width: imageSrc ? 640 : 1080,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            paddingRight: imageSrc ? 24 : 0,
          }}
        >
          {/* Top Row: LCB Logo Emblem + Newsroom Label + Category Pill + Date */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            {/* LCB Monogram Emblem */}
            <div
              style={{
                width: 44,
                height: 44,
                background: "linear-gradient(135deg, #0a66c2 0%, #0284c7 100%)",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: "-0.5px",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              LCB
            </div>

            {/* Newsroom Tag */}
            <div
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.7)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              NEWSROOM
            </div>

            {/* Category Pill with dynamic theme */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 999,
                background: categoryStyle.bg,
                border: `1px solid ${categoryStyle.border}`,
                color: categoryStyle.text,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: categoryStyle.dot,
                }}
              />
              {item.category}
            </div>

            {/* Date */}
            <span
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: "0.04em",
                marginLeft: 4,
              }}
            >
              {item.dateLabel}
            </span>
          </div>

          {/* Center: Headline & Rich Excerpt */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              marginTop: 18,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                fontSize: titleFontSize,
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.16,
                letterSpacing: "-0.8px",
              }}
            >
              {item.title}
            </div>

            <div
              style={{
                fontSize: 17,
                lineHeight: 1.45,
                color: "rgba(226, 232, 240, 0.72)",
              }}
            >
              {broadDesc}
            </div>
          </div>

          {/* Bottom Row: Official Community Tagline & Domain */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              paddingTop: 16,
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#10b981",
              }}
            />
            <span
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
            >
              LinkedIn Community Bangladesh
            </span>
            <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
            <span
              style={{
                color: "rgba(79, 156, 235, 0.9)",
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: "0.04em",
              }}
            >
              linkedincommunitybangladesh.com
            </span>
          </div>
        </div>

        {/* Right Column: Hero Cover Photo Frame */}
        {imageSrc ? (
          <div
            style={{
              width: 440,
              height: 542,
              borderRadius: 24,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.03)",
              display: "flex",
              position: "relative",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt={item.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            {/* Soft subtle gradient border at bottom of photo */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(4,6,20,0.55) 0%, transparent 40%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 16,
                right: 16,
                padding: "6px 12px",
                borderRadius: 8,
                background: "rgba(4,6,20,0.75)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.75)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              LCB Official
            </div>
          </div>
        ) : (
          <div
            style={{
              width: 440,
              height: 542,
              borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "linear-gradient(135deg, rgba(10,102,194,0.15) 0%, rgba(6,182,212,0.06) 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: 28,
                background: "linear-gradient(135deg, #0a66c2 0%, #0d4f9e 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: 36,
                fontWeight: 800,
              }}
            >
              LCB
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 14,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Official Press Release
            </div>
          </div>
        )}
      </div>
    ),
    { ...size }
  );

  return rawRes;
}
