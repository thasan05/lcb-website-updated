import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "linear-gradient(135deg, #040614 0%, #080d24 60%, #040614 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "64px 72px",
          position: "relative",
          fontFamily: "sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Background glow blobs */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -80,
            width: 560,
            height: 560,
            background:
              "radial-gradient(circle, rgba(10,102,194,0.35) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            right: -60,
            width: 440,
            height: 440,
            background:
              "radial-gradient(circle, rgba(34,211,238,0.18) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Top: LCB badge + URL */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, zIndex: 1 }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: "linear-gradient(135deg, #0a66c2 0%, #0d4f9e 100%)",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 17,
              fontWeight: 800,
              letterSpacing: "-0.5px",
            }}
          >
            LCB
          </div>
          <span
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: 20,
              letterSpacing: "0.04em",
            }}
          >
            linkedincommunitybangladesh.com
          </span>
        </div>

        {/* Main headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 72,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.05,
              letterSpacing: "-2px",
              maxWidth: 900,
            }}
          >
            <span>Where Bangladesh&apos;s</span>
            <span>
              future leaders{" "}
              <span style={{ color: "#4f9ceb" }}>connect.</span>
            </span>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 32,
              marginTop: 8,
            }}
          >
            {["24K+ Members", "125+ Campus Leads", "250+ Career Sessions", "Nationwide"].map(
              (s, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 20,
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#4f9ceb",
                    }}
                  />
                  {s}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
