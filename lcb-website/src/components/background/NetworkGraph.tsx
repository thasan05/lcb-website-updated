"use client";

/**
 * NetworkGraph — an animated SVG constellation of connected nodes
 * that drifts subtly in the background.
 *
 * Visual metaphor for LinkedIn / professional networking.
 * Pure SVG + CSS, no canvas — performant, scalable, accessible.
 */
export function NetworkGraph({ className }: { className?: string }) {
  // Carefully composed node positions for a balanced, organic feel.
  // Each node has a drift offset that animates via CSS variables.
  const nodes = [
    { id: "a", x: 12,  y: 28, size: 4,   dx: 8,   dy: -10, delay: 0,   accent: "brand" },
    { id: "b", x: 28,  y: 16, size: 2.5, dx: -6,  dy: 8,   delay: 0.6, accent: "brand" },
    { id: "c", x: 44,  y: 36, size: 5,   dx: 10,  dy: -6,  delay: 1.2, accent: "cyan" },
    { id: "d", x: 60,  y: 12, size: 3,   dx: -8,  dy: 12,  delay: 0.3, accent: "brand" },
    { id: "e", x: 78,  y: 24, size: 4,   dx: 6,   dy: -8,  delay: 0.9, accent: "indigo" },
    { id: "f", x: 92,  y: 42, size: 2.5, dx: -10, dy: 6,   delay: 1.5, accent: "brand" },
    { id: "g", x: 18,  y: 56, size: 3,   dx: 8,   dy: 8,   delay: 0.4, accent: "brand" },
    { id: "h", x: 36,  y: 68, size: 4.5, dx: -6,  dy: -10, delay: 1.0, accent: "cyan" },
    { id: "i", x: 54,  y: 60, size: 2.5, dx: 10,  dy: 6,   delay: 0.2, accent: "brand" },
    { id: "j", x: 72,  y: 72, size: 4,   dx: -8,  dy: -8,  delay: 1.4, accent: "indigo" },
    { id: "k", x: 86,  y: 82, size: 3,   dx: 6,   dy: 10,  delay: 0.7, accent: "brand" },
    { id: "l", x: 24,  y: 86, size: 3.5, dx: -10, dy: -6,  delay: 1.1, accent: "cyan" },
  ];

  // Edges — selectively chosen to feel organic (not all-connected mesh)
  const edges: [string, string][] = [
    ["a", "b"], ["b", "c"], ["c", "d"], ["d", "e"], ["e", "f"],
    ["a", "g"], ["c", "g"], ["g", "h"], ["h", "i"], ["i", "j"],
    ["c", "i"], ["e", "j"], ["j", "k"], ["h", "l"], ["i", "k"],
    ["b", "d"], ["g", "l"], ["f", "k"],
  ];

  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  const accentColors = {
    brand: "rgba(79, 156, 235, 0.85)",
    cyan: "rgba(34, 211, 238, 0.85)",
    indigo: "rgba(129, 140, 248, 0.85)",
  };

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full opacity-[0.55]"
      >
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,1)" />
            <stop offset="40%" stopColor="rgba(255,255,255,0.6)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <linearGradient id="edgeFade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(79,156,235,0)" />
            <stop offset="50%" stopColor="rgba(79,156,235,0.25)" />
            <stop offset="100%" stopColor="rgba(79,156,235,0)" />
          </linearGradient>
        </defs>

        {/* Edges (lines first, behind nodes) */}
        {edges.map(([a, b], i) => {
          const na = nodeMap[a];
          const nb = nodeMap[b];
          if (!na || !nb) return null;
          return (
            <line
              key={`edge-${i}`}
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              stroke="url(#edgeFade)"
              strokeWidth="0.12"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

        {/* Node glows — large soft halos */}
        {nodes.map((n) => (
          <circle
            key={`glow-${n.id}`}
            cx={n.x}
            cy={n.y}
            r={n.size * 1.8}
            fill="url(#nodeGlow)"
            opacity="0.35"
            style={{
              transformOrigin: `${n.x}px ${n.y}px`,
              animation: `nodeDrift 12s ease-in-out ${n.delay}s infinite`,
              ["--drift-x" as string]: `${n.dx * 0.05}px`,
              ["--drift-y" as string]: `${n.dy * 0.05}px`,
            }}
          />
        ))}

        {/* Node dots (sharp centres) */}
        {nodes.map((n) => (
          <circle
            key={`dot-${n.id}`}
            cx={n.x}
            cy={n.y}
            r={n.size * 0.35}
            fill={accentColors[n.accent as keyof typeof accentColors]}
            className="node-pulse"
            style={{
              animationDelay: `${n.delay}s`,
              filter: "drop-shadow(0 0 2px rgba(79,156,235,0.8))",
            }}
          />
        ))}
      </svg>
    </div>
  );
}
