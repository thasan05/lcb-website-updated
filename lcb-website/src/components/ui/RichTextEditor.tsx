"use client";

import { useRef, useEffect, useCallback } from "react";
import { Bold, Italic, List, Link2, Heading2 } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
}

type ToolbarAction = "bold" | "italic" | "insertUnorderedList" | "createLink" | "formatBlock";

function execCmd(cmd: ToolbarAction, value?: string) {
  document.execCommand(cmd, false, value ?? undefined);
}

const BTN =
  "flex h-7 w-7 items-center justify-center rounded text-white/50 transition-all hover:bg-white/[0.10] hover:text-white";

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write here…",
  minHeight = 120,
  className = "",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isComposing = useRef(false);

  // Sync value → editor DOM on mount / external value change
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    // Only update DOM if content actually differs (avoids cursor jump)
    if (el.innerHTML !== value) {
      el.innerHTML = value ?? "";
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (!isComposing.current && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "b" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault(); execCmd("bold");
    }
    if (e.key === "i" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault(); execCmd("italic");
    }
  }

  function insertLink() {
    const url = prompt("Enter URL (https:// only):");
    if (!url) return;
    const lower = url.trim().toLowerCase();
    if (
      lower.startsWith("javascript:") ||
      lower.startsWith("vbscript:") ||
      lower.startsWith("data:")
    ) {
      alert("Invalid URL. Only https://, http://, or relative URLs are allowed.");
      return;
    }
    execCmd("createLink", url);
  }

  function insertHeading() {
    execCmd("formatBlock", "h3");
  }

  const isEmpty = !value || value === "<br>" || value === "";

  return (
    <div className={`relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04] ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 border-b border-white/[0.06] px-2 py-1.5">
        <button type="button" onClick={() => execCmd("bold")} className={BTN} title="Bold (Ctrl+B)">
          <Bold className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
        <button type="button" onClick={() => execCmd("italic")} className={BTN} title="Italic (Ctrl+I)">
          <Italic className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
        <button type="button" onClick={insertHeading} className={BTN} title="Heading">
          <Heading2 className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
        <div className="mx-1.5 h-4 w-px bg-white/[0.10]" />
        <button type="button" onClick={() => execCmd("insertUnorderedList")} className={BTN} title="Bullet list">
          <List className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
        <button type="button" onClick={insertLink} className={BTN} title="Insert link">
          <Link2 className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>

      {/* Editable area */}
      <div className="relative">
        {isEmpty && (
          <span className="pointer-events-none absolute left-3.5 top-2.5 text-sm text-white/20 select-none">
            {placeholder}
          </span>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => { isComposing.current = true; }}
          onCompositionEnd={() => {
            isComposing.current = false;
            handleInput();
          }}
          style={{ minHeight }}
          className="prose prose-invert prose-sm max-w-none px-3.5 py-2.5 text-sm text-white outline-none
            [&_b]:font-semibold [&_strong]:font-semibold
            [&_i]:italic [&_em]:italic
            [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1
            [&_ul]:ml-4 [&_ul]:list-disc [&_ul]:space-y-0.5
            [&_a]:text-brand-300 [&_a]:underline"
        />
      </div>
    </div>
  );
}

// ── Helper used on public site ──────────────────────────────────────────────
// Renders plain text OR HTML depending on content.
export function SafeHtml({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const isHtml = /<[a-z][\s\S]*>/i.test(html);
  if (!isHtml) {
    return <span className={className}>{html}</span>;
  }
  return (
    <div
      className={`prose prose-invert prose-sm max-w-none ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
