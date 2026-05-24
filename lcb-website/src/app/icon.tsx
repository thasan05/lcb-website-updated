import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "linear-gradient(135deg, #0a66c2 0%, #0d4f9e 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#ffffff",
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: "-0.5px",
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
