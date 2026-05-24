"use client";

import type { ReactNode } from "react";

type Word = { text: string; italic?: boolean; gradient?: boolean };

type Props = {
  /** Array of word groups — supports italic accent words for serif moments */
  words: (string | Word)[];
  className?: string;
  /** Delay before the first word reveals (seconds) */
  delay?: number;
  /** Stagger between each word (seconds) */
  stagger?: number;
  as?: "h1" | "h2" | "p" | "div";
};

/**
 * RevealText — splits content into per-word spans, each animating in with
 * a blur-to-sharp + rise. Editorial typography is a per-word concern,
 * so we control the unit precisely.
 */
export function RevealText({
  words,
  className,
  delay = 0.1,
  stagger = 0.05,
  as: Tag = "h1",
}: Props) {
  return (
    <Tag className={`word-reveal ${className ?? ""}`}>
      {words.map((w, i) => {
        const word = typeof w === "string" ? { text: w } : w;
        const isLineBreak = word.text === "\n";

        if (isLineBreak) {
          return <br key={`br-${i}`} className="hidden sm:inline" aria-hidden />;
        }

        const content: ReactNode = word.italic ? (
          <span className="serif-italic text-white/95">{word.text}</span>
        ) : (
          word.text
        );

        return (
          <span
            key={`w-${i}`}
            style={{ animationDelay: `${delay + i * stagger}s` }}
          >
            {content}
            {/* Preserve word spacing */}
            {i < words.length - 1 && !isLineBreak ? " " : ""}
          </span>
        );
      })}
    </Tag>
  );
}
