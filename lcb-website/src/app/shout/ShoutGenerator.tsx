"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Sparkles, RefreshCw, Check, Share2 } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface CardData {
  toName: string;
  toTitle: string;
  message: string;
  fromName: string;
  fromTitle: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/* ------------------------------------------------------------------ */
/*  Milestones data                                                     */
/* ------------------------------------------------------------------ */

const MILESTONES = [
  { value: "24K+", label: "Lives Impacted" },
  { value: "40+",  label: "Campus Leads" },
  { value: "120+", label: "Sessions Hosted" },
  { value: "1st",  label: "In Bangladesh" },
];

/* ------------------------------------------------------------------ */
/*  Canvas card renderer                                                */
/* ------------------------------------------------------------------ */

function drawCard(canvas: HTMLCanvasElement, data: CardData, date: string) {
  const W = 1680, H = 944;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const s = W / 840; // = 2

  // ── Background ──────────────────────────────────────────────────────
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, "#04060e");
  bgGrad.addColorStop(0.5, "#080d20");
  bgGrad.addColorStop(1, "#04060e");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // ── Ambient orbs ────────────────────────────────────────────────────
  const orbs: { x: number; y: number; r: number; rgb: [number,number,number]; a: number }[] = [
    { x: -60*s,            y: -80*s,            r: 400*s, rgb: [10, 102, 194], a: 0.55 },
    { x: (840+60)*s,       y: H*0.30+(360*s)/2, r: 360*s, rgb: [34, 211, 238], a: 0.30 },
    { x: 840*0.35*s+160*s, y: H+60*s,           r: 320*s, rgb: [99, 102, 241], a: 0.28 },
  ];
  for (const o of orbs) {
    const rad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
    rad.addColorStop(0, `rgba(${o.rgb[0]},${o.rgb[1]},${o.rgb[2]},${o.a})`);
    rad.addColorStop(0.55, `rgba(${o.rgb[0]},${o.rgb[1]},${o.rgb[2]},0.04)`);
    rad.addColorStop(1, "transparent");
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, W, H);
  }

  // ── Grid ────────────────────────────────────────────────────────────
  const cell = 40*s;
  ctx.strokeStyle = "rgba(255,255,255,0.025)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += cell) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y = 0; y <= H; y += cell) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // ── Top-left: "LCB Appreciation Corner" text (no icon) ──────────────
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = `600 ${13*s}px Inter, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("LCB Appreciation Corner", 44*s, (32+16)*s);

  // ── Top-right: LCB three-block logo + subtitle ──────────────────────
  {
    const bs = 20*s;          // block size
    const gap = 3*s;          // gap between blocks
    const totalW = bs*3 + gap*2;
    const startX = W - 44*s - totalW;
    const startY = 28*s;
    ["L","C","B"].forEach((letter, i) => {
      const bx = startX + i*(bs+gap);
      roundRect(ctx, bx, startY, bs, bs, 5*s);
      const bg = ctx.createLinearGradient(bx, startY, bx, startY+bs);
      bg.addColorStop(0, "#0a66c2");
      bg.addColorStop(1, "#0d5aa7");
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = `900 ${11*s}px Arial Black, Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(letter, bx+bs/2, startY+bs/2);
    });
    // Subtitle below logo
    ctx.fillStyle = "rgba(255,255,255,0.38)";
    ctx.font = `500 ${8*s}px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.letterSpacing = "0.08em";
    ctx.fillText("LinkedIn Community Bangladesh", startX + totalW/2, startY + bs + 5*s);
    ctx.letterSpacing = "0";
  }

  // ── "a big shout out to" label ───────────────────────────────────────
  ctx.fillStyle = "rgba(255,255,255,0.40)";
  ctx.font = `400 ${12*s}px Inter, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("A big shout out to", 44*s, 92*s);

  // ── Recipient name ───────────────────────────────────────────────────
  const nameText = data.toName || "Name Here";
  ctx.font = `800 ${42*s}px Inter, sans-serif`;
  const nameGrad = ctx.createLinearGradient(44*s, 0, 500*s, 0);
  nameGrad.addColorStop(0, "#ffffff");
  nameGrad.addColorStop(1, "rgba(255,255,255,0.8)");
  ctx.fillStyle = nameGrad;
  ctx.textBaseline = "top";
  ctx.fillText(nameText, 44*s, 112*s);

  // ── Recipient title ─────────────────────────────────────────────────
  let msgTop = 182*s;
  if (data.toTitle) {
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = `400 ${14*s}px Inter, sans-serif`;
    ctx.textBaseline = "top";
    ctx.fillText(data.toTitle, 44*s, 168*s);
    msgTop = 202*s;
  }

  // ── Message (always in quotes) ───────────────────────────────────────
  const rawMsg = data.message || "Your outstanding contribution to the community has inspired everyone around you.";
  const msgText = `“${rawMsg}”`;
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.font = `400 ${16*s}px Inter, sans-serif`;
  ctx.textBaseline = "top";
  const lines = wrapText(ctx, msgText, 560*s);
  const lineH = 16*s*1.65;
  lines.slice(0, 4).forEach((l, i) => ctx.fillText(l, 44*s, msgTop + i*lineH));

  // ── Milestones — footer copyright style, single centred line ────────
  const msText = MILESTONES.map((m) => `${m.value} ${m.label}`).join("   ·   ");
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.font = `400 ${9*s}px Inter, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(msText, W / 2, H - 12*s);

  // ── Recognised by ───────────────────────────────────────────────────
  const bottomY = H - 54*s;
  ctx.fillStyle = "rgba(255,255,255,0.30)";
  ctx.font = `700 ${10*s}px Inter, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillText("RECOGNISED BY", 44*s, bottomY - 22*s);

  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.font = `700 ${15*s}px Inter, sans-serif`;
  ctx.textBaseline = "bottom";
  ctx.fillText(data.fromName || "Sender Name", 44*s, bottomY - 2*s);

  if (data.fromTitle) {
    ctx.fillStyle = "rgba(255,255,255,0.40)";
    ctx.font = `400 ${12*s}px Inter, sans-serif`;
    ctx.textBaseline = "top";
    ctx.fillText(data.fromTitle, 44*s, bottomY + 4*s);
  }

  // ── Date + domain (bottom right) ─────────────────────────────────────
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.30)";
  ctx.font = `400 ${11*s}px Inter, sans-serif`;
  ctx.textBaseline = "bottom";
  ctx.fillText(date, W - 44*s, bottomY - 16*s);
  ctx.fillStyle = "rgba(255,255,255,0.20)";
  ctx.fillText("linkedincommunitybangladesh.com", W - 44*s, bottomY);

  // ── Bottom accent line ───────────────────────────────────────────────
  const lineGrad = ctx.createLinearGradient(0, 0, W, 0);
  lineGrad.addColorStop(0, "#0a66c2");
  lineGrad.addColorStop(0.5, "#22d3ee");
  lineGrad.addColorStop(1, "#6366f1");
  ctx.fillStyle = lineGrad;
  ctx.fillRect(0, H-6, W, 6);
}

/* ------------------------------------------------------------------ */
/*  Card Preview (DOM — live preview only)                             */
/* ------------------------------------------------------------------ */

function CardPreview({ data, date }: { data: CardData; date: string }) {
  const displayMsg = `“${data.message || "Your outstanding contribution to the community has inspired everyone around you."}”`;

  return (
    <div style={{ width:840, height:472, background:"linear-gradient(135deg, #04060e 0%, #080d20 50%, #04060e 100%)", borderRadius:24, position:"relative", overflow:"hidden", fontFamily:"var(--font-geist),'Geist','Inter',sans-serif", flexShrink:0 }}>
      {/* Orbs */}
      <div style={{ position:"absolute", top:-80, left:-60, width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(10,102,194,0.55) 0%, rgba(10,102,194,0.08) 55%, transparent 75%)", filter:"blur(60px)" }} />
      <div style={{ position:"absolute", top:"30%", right:-60, width:360, height:360, borderRadius:"50%", background:"radial-gradient(circle, rgba(34,211,238,0.30) 0%, rgba(34,211,238,0.04) 55%, transparent 75%)", filter:"blur(55px)" }} />
      <div style={{ position:"absolute", bottom:-60, left:"35%", width:320, height:320, borderRadius:"50%", background:"radial-gradient(circle, rgba(99,102,241,0.28) 0%, rgba(99,102,241,0.04) 55%, transparent 75%)", filter:"blur(50px)" }} />
      {/* Grid */}
      <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize:"40px 40px" }} />

      {/* Top-left: "LCB Appreciation Corner" — no icon */}
      <div style={{ position:"absolute", top:32, left:44, display:"flex", alignItems:"center" }}>
        <span style={{ color:"rgba(255,255,255,0.9)", fontSize:13, fontWeight:600, letterSpacing:"0.04em" }}>LCB Appreciation Corner</span>
      </div>

      {/* Top-right: LCB logo + subtitle */}
      <div style={{ position:"absolute", top:28, right:44, display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
        {/* LCB three-block logo */}
        <div style={{ display:"flex", gap:3 }}>
          {["L","C","B"].map((letter) => (
            <div key={letter} style={{ width:20, height:20, borderRadius:5, background:"linear-gradient(160deg, #0a66c2 0%, #0d5aa7 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color:"#fff", fontFamily:"Arial Black, Arial, sans-serif", boxShadow:"0 1px 4px rgba(10,102,194,0.5)" }}>{letter}</div>
          ))}
        </div>
        <span style={{ fontSize:8, fontWeight:500, color:"rgba(255,255,255,0.40)", letterSpacing:"0.08em", textTransform:"uppercase", whiteSpace:"nowrap" }}>LinkedIn Community Bangladesh</span>
      </div>

      {/* "a big shout out to" label */}
      <div style={{ position:"absolute", top:92, left:44, fontSize:12, fontWeight:400, letterSpacing:"0.04em", color:"rgba(255,255,255,0.40)" }}>A big shout out to</div>

      {/* Recipient name */}
      <div style={{ position:"absolute", top:112, left:44, right:44, fontSize:42, fontWeight:800, color:"#ffffff", lineHeight:1.1, letterSpacing:"-1.5px", background:"linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0.80) 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
        {data.toName || "Name Here"}
      </div>

      {/* Recipient title */}
      {data.toTitle && (
        <div style={{ position:"absolute", top:168, left:44, fontSize:14, color:"rgba(255,255,255,0.45)", fontWeight:400 }}>{data.toTitle}</div>
      )}

      {/* Message in quotes */}
      <div style={{ position:"absolute", top:data.toTitle ? 202 : 182, left:44, right:44, fontSize:16, lineHeight:1.65, color:"rgba(255,255,255,0.72)", fontWeight:400, maxWidth:560 }}>
        {displayMsg}
      </div>

      {/* Milestones — footer copyright style, single line */}
      <div style={{ position:"absolute", bottom:10, left:0, right:0, textAlign:"center", fontSize:9, fontWeight:400, color:"rgba(255,255,255,0.22)", letterSpacing:"0.06em" }}>
        {MILESTONES.map((m, i) => (
          <span key={m.value}>{i > 0 && <span style={{ margin:"0 6px", opacity:0.4 }}>·</span>}<span style={{ fontWeight:600 }}>{m.value}</span> {m.label}</span>
        ))}
      </div>

      {/* Bottom row */}
      <div style={{ position:"absolute", bottom:54, left:44, right:44, display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(255,255,255,0.30)", marginBottom:4 }}>Recognised by</div>
          <div style={{ fontSize:15, fontWeight:700, color:"rgba(255,255,255,0.88)" }}>{data.fromName || "Sender Name"}</div>
          {data.fromTitle && <div style={{ fontSize:12, color:"rgba(255,255,255,0.40)", marginTop:2 }}>{data.fromTitle}</div>}
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.30)", letterSpacing:"0.04em" }}>{date}</div>
          <div style={{ marginTop:6, fontSize:11, color:"rgba(255,255,255,0.20)", letterSpacing:"0.08em" }}>linkedincommunitybangladesh.com</div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, background:"linear-gradient(90deg, #0a66c2 0%, #22d3ee 50%, #6366f1 100%)" }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Generator                                                      */
/* ------------------------------------------------------------------ */

export function ShoutGenerator() {
  const [downloaded, setDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [date, setDate] = useState("");

  // ── Responsive preview scaling ──────────────────────────────────────────
  const previewRef  = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      setPreviewScale(Math.min(1, entry.contentRect.width / 840));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    setDate(new Date().toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" }));
  }, []);

  const [data, setData] = useState<CardData>({ toName:"", toTitle:"", message:"", fromName:"", fromTitle:"" });
  const set = <K extends keyof CardData>(key: K, val: CardData[K]) => setData((d) => ({ ...d, [key]: val }));

  const handleDownload = () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      drawCard(canvas, data, date);
      const link = document.createElement("a");
      link.download = `lcb-shoutout-${data.toName.replace(/\s+/g, "-").toLowerCase() || "card"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    } finally {
      setDownloading(false);
    }
  };

  const handleReset = () => setData({ toName:"", toTitle:"", message:"", fromName:"", fromTitle:"" });
  const isReady = data.toName.trim() && data.message.trim() && data.fromName.trim();

  // ── Mobile Web Share API ────────────────────────────────────────────────
  const handleShare = async () => {
    if (!isReady) return;
    const canvas = document.createElement("canvas");
    drawCard(canvas, data, date);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const fname = `lcb-shoutout-${(data.toName || "card").replace(/\s+/g,"-").toLowerCase()}.png`;
      const file  = new File([blob], fname, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `LCB Shout Out — ${data.toName}`,
            text:  `A shout out to ${data.toName} from ${data.fromName}! #LinkedInCommunityBangladesh`,
          });
          return;
        } catch {}
      }
      // Fallback — same as download
      const a = document.createElement("a");
      a.download = fname;
      a.href     = canvas.toDataURL("image/png");
      a.click();
    });
  };

  return (
    <div className="min-h-screen bg-[rgb(4,6,20)] text-white">
      {/* Mobile sticky back-nav */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[rgb(4,6,20)]/90 backdrop-blur-xl sm:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <a
            href="https://linkedincommunitybangladesh.com"
            className="flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to LCB
          </a>
          <span className="text-xs font-bold uppercase tracking-widest text-white/30">Shout Out</span>
        </div>
      </header>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full blur-[120px]" style={{ background:"radial-gradient(circle, rgba(10,102,194,0.35) 0%, transparent 70%)" }} />
        <div className="absolute -right-24 top-1/3 h-[500px] w-[500px] rounded-full blur-[110px]" style={{ background:"radial-gradient(circle, rgba(34,211,238,0.18) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full blur-[100px]" style={{ background:"radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage:"linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize:"48px 48px" }} />
      </div>

      <div className="relative z-10 mx-auto max-w-[1320px] px-4 py-10 sm:px-6 sm:py-12">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }} className="mb-12 flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/50">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-cyan-400/60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-cyan-400" />
            </span>
            LinkedIn Community Bangladesh
          </div>
          <h1 className="font-jakarta text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Shout{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage:"linear-gradient(90deg, #0a66c2 0%, #22d3ee 60%, #6366f1 100%)" }}>
              Someone Out
            </span>
          </h1>
          <p className="mt-4 max-w-md text-base text-white/50">
            Recognise a member who made a difference. Fill in the details, preview your card, and download it to share.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
          {/* Form — below preview on mobile, left on desktop */}
          <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.5, delay:0.1 }} className="flex flex-col gap-6 order-2 lg:order-1">
            {/* Recipient */}
            <fieldset className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
              <legend className="mb-4 px-1 text-xs font-semibold uppercase tracking-widest text-white/35">Recipient</legend>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/50">Full Name <span className="text-cyan-400">*</span></label>
                  <input type="text" value={data.toName} onChange={(e) => set("toName", e.target.value)} placeholder="e.g. Tanvir Hasan"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-base text-white placeholder-white/20 outline-none transition focus:border-[#0a66c2]/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-[#0a66c2]/20" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/50">Role / Title <span className="text-white/20">(optional)</span></label>
                  <input type="text" value={data.toTitle} onChange={(e) => set("toTitle", e.target.value)} placeholder="e.g. Campus Lead, AIUB"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-base text-white placeholder-white/20 outline-none transition focus:border-[#0a66c2]/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-[#0a66c2]/20" />
                </div>
              </div>
            </fieldset>

            {/* Message */}
            <fieldset className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
              <legend className="mb-4 px-1 text-xs font-semibold uppercase tracking-widest text-white/35">Message</legend>
              <textarea value={data.message} onChange={(e) => set("message", e.target.value)} rows={4} maxLength={240}
                placeholder="Your outstanding effort for ensuring business in critical time..."
                className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base text-white placeholder-white/20 outline-none transition focus:border-[#0a66c2]/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-[#0a66c2]/20" />
              <div className="mt-1.5 text-right text-[11px] text-white/20">{data.message.length}/240</div>
            </fieldset>

            {/* From */}
            <fieldset className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
              <legend className="mb-4 px-1 text-xs font-semibold uppercase tracking-widest text-white/35">From</legend>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/50">Your Name <span className="text-cyan-400">*</span></label>
                  <input type="text" value={data.fromName} onChange={(e) => set("fromName", e.target.value)} placeholder="e.g. Altaf Hossain Raju"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-base text-white placeholder-white/20 outline-none transition focus:border-[#0a66c2]/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-[#0a66c2]/20" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/50">Your Role / Title <span className="text-white/20">(optional)</span></label>
                  <input type="text" value={data.fromTitle} onChange={(e) => set("fromTitle", e.target.value)} placeholder="e.g. President, LCB"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-base text-white placeholder-white/20 outline-none transition focus:border-[#0a66c2]/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-[#0a66c2]/20" />
                </div>
              </div>
            </fieldset>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={handleReset}
                className="flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm font-medium text-white/60 transition hover:bg-white/[0.08] hover:text-white">
                <RefreshCw className="h-4 w-4" /> Reset
              </button>
              {/* Share — mobile primary action */}
              <button type="button" onClick={handleShare} disabled={!isReady}
                className="flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm font-medium text-white/60 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 sm:hidden">
                <Share2 className="h-4 w-4" /> Share
              </button>
              <button type="button" onClick={handleDownload} disabled={!isReady || downloading}
                className="group relative flex h-11 flex-1 items-center justify-center gap-2 overflow-hidden rounded-full text-sm font-semibold text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ background: isReady ? "linear-gradient(135deg, #0a66c2 0%, #22d3ee 100%)" : "rgba(255,255,255,0.06)" }}>
                <AnimatePresence mode="wait">
                  {downloaded ? (
                    <motion.span key="done" initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.8 }} className="flex items-center gap-2">
                      <Check className="h-4 w-4" /> Downloaded!
                    </motion.span>
                  ) : downloading ? (
                    <motion.span key="loading" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" /> Generating…
                    </motion.span>
                  ) : (
                    <motion.span key="idle" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="flex items-center gap-2">
                      <Download className="h-4 w-4" /> Download Card
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>

            {!isReady && <p className="text-center text-xs text-white/25">Fill in name, message, and sender to enable download.</p>}
          </motion.div>

          {/* Card Preview — shown first on mobile via order-1 */}
          <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.5, delay:0.15 }} className="flex flex-col gap-4 order-1 lg:order-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/30">
              <Sparkles className="h-3.5 w-3.5" /> Live Preview
            </div>
            {/* Responsive wrapper: scales the 840×472 card to fit any container */}
            <div ref={previewRef} className="w-full overflow-hidden rounded-2xl">
              <div style={{ position:"relative", height: Math.round(472 * previewScale) }}>
                <div style={{
                  position:"absolute", top:0, left:0,
                  width:840,
                  transformOrigin:"top left",
                  transform:`scale(${previewScale})`,
                }}>
                  <CardPreview data={data} date={date} />
                </div>
              </div>
            </div>
            <p className="text-xs text-white/25">Card exports at 1680 × 944 px — optimised for LinkedIn posts, emails, and banners.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
