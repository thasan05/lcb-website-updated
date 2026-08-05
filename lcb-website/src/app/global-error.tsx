"use client";

/**
 * Last-resort boundary for errors thrown in the root layout itself, where
 * error.tsx cannot render because the layout it lives inside has failed.
 * It must supply its own <html>/<body>, and cannot rely on the app's fonts or
 * providers — hence the inline styles.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          background: "#040614",
          color: "#fff",
          fontFamily: "system-ui, -apple-system, sans-serif",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Something went wrong</h1>
        <p style={{ margin: 0, maxWidth: "28rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.45)" }}>
          The page failed to load. Please try again.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "0.5rem",
            border: 0,
            borderRadius: "9999px",
            background: "#0A66C2",
            color: "#fff",
            padding: "0.625rem 1.25rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        {error.digest && (
          <p style={{ marginTop: "1.5rem", fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>
            Reference: {error.digest}
          </p>
        )}
      </body>
    </html>
  );
}
