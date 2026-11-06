"use client";

import { useState, useEffect } from "react";
import { Check, Copy, Link2, Share2 } from "lucide-react";
import { formatBroadDescription, formatShareMessage } from "@/lib/news-metadata";

interface Props {
  url: string;
  title: string;
  category?: string;
  dateLabel?: string;
  summary?: string;
}

export function NewsShareButtons({ url, title, category, dateLabel, summary }: Props) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPreview, setCopiedPreview] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setCanNativeShare(true);
    }
  }, []);

  const broadDesc = formatBroadDescription(summary, 280);

  const formattedShareMsg = formatShareMessage({
    title,
    category,
    dateLabel,
    summary,
    url,
  });

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: `${title}\n\n${broadDesc}`,
          url,
        });
      } catch {
        // User dismissed share sheet
      }
    }
  };

  const copyOnlyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback
    }
  };

  const copyRichPreview = async () => {
    try {
      await navigator.clipboard.writeText(formattedShareMsg);
      setCopiedPreview(true);
      setTimeout(() => setCopiedPreview(false), 2200);
    } catch {
      // fallback
    }
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  // Important for phones: putting url first forces WhatsApp mobile to unfurl the large preview card
  const metaLine = [category ? `🏷️ ${category}` : "", dateLabel ? `🗓️ ${dateLabel}` : ""]
    .filter(Boolean)
    .join(" • ");
  const whatsappText = encodeURIComponent(
    `${url}\n\n*${title}*${metaLine ? `\n${metaLine}` : ""}\n\n${broadDesc}`
  );
  const telegramText = encodeURIComponent(`*${title}*\n${broadDesc}`);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs uppercase tracking-wider text-white/35 mr-1 hidden sm:inline">
        Share:
      </span>

      {/* Native Phone Share Sheet (iOS / Android) */}
      {canNativeShare && (
        <button
          type="button"
          onClick={handleNativeShare}
          aria-label="Share via phone"
          title="Share via device menu"
          className="flex h-9 items-center gap-1.5 rounded-xl border border-brand-400/40 bg-brand-500/20 px-3 text-xs font-medium text-brand-200 transition hover:bg-brand-500/30 hover:text-white"
        >
          <Share2 className="h-4 w-4 text-brand-300" />
          <span>Share</span>
        </button>
      )}

      {/* WhatsApp (URL-first triggers mobile link preview unfurl immediately) */}
      <a
        href={`https://api.whatsapp.com/send?text=${whatsappText}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share story on WhatsApp"
        title="Share with detailed preview on WhatsApp"
        className="flex h-9 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-xs font-medium text-white/75 transition hover:border-[#25D366]/40 hover:bg-[#25D366]/15 hover:text-[#25D366]"
      >
        <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
        <span>WhatsApp</span>
      </a>

      {/* Telegram */}
      <a
        href={`https://t.me/share/url?url=${encodedUrl}&text=${telegramText}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Telegram"
        title="Share on Telegram"
        className="flex h-9 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-xs font-medium text-white/75 transition hover:border-[#229ED9]/40 hover:bg-[#229ED9]/15 hover:text-[#229ED9]"
      >
        <TelegramIcon className="h-4 w-4 text-[#229ED9]" />
        <span className="hidden sm:inline">Telegram</span>
      </a>

      {/* LinkedIn */}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
        className="flex h-9 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-xs font-medium text-white/75 transition hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/15 hover:text-[#0A66C2]"
      >
        <LinkedInIcon className="h-4 w-4" />
        <span className="hidden sm:inline">LinkedIn</span>
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        title="Share on Facebook"
        className="flex h-9 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-xs font-medium text-white/75 transition hover:border-[#1877F2]/40 hover:bg-[#1877F2]/15 hover:text-[#1877F2]"
      >
        <FacebookIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Facebook</span>
      </a>

      {/* X / Twitter */}
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        title="Share on X"
        className="flex h-9 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-xs font-medium text-white/75 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
      >
        <XIcon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">X</span>
      </a>

      {/* Copy Direct Link */}
      <button
        type="button"
        onClick={copyOnlyLink}
        aria-label="Copy link"
        title={copiedLink ? "Link copied!" : "Copy link"}
        className="flex h-9 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-xs font-medium text-white/75 transition hover:border-brand-400/40 hover:bg-brand-500/15 hover:text-white"
      >
        {copiedLink ? (
          <>
            <Check className="h-4 w-4 text-emerald-400" />
            <span className="text-emerald-400">Copied!</span>
          </>
        ) : (
          <>
            <Link2 className="h-4 w-4" />
            <span>Copy link</span>
          </>
        )}
      </button>

      {/* Copy Rich Story Preview Text */}
      <button
        type="button"
        onClick={copyRichPreview}
        aria-label="Copy full story preview"
        title={copiedPreview ? "Story preview copied to clipboard!" : "Copy detailed preview text"}
        className="hidden md:inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-xs font-medium text-white/60 transition hover:border-brand-400/30 hover:bg-white/[0.06] hover:text-brand-300"
      >
        {copiedPreview ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-emerald-400">Preview copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            <span>Copy preview</span>
          </>
        )}
      </button>
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.942z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
