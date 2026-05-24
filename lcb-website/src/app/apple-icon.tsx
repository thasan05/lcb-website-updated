import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: "linear-gradient(135deg, #0a66c2 0%, #0d4f9e 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#ffffff",
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: "-2px",
            fontFamily: "sans-serif",
            lineHeight: 1,
          }}
        >
          LCB
        </span>
      </div>
    ),
    { ...size }
  );
}
