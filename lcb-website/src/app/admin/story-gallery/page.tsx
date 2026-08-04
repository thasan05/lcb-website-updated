"use client";

import { useEffect, useState, useCallback } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";

type GalleryItem = {
  id: string;
  src: string;
  srcs?: string[];
  alt: string;
  caption?: string;
  span?: "tall" | "wide" | "square" | "feature";
};

const SLOT_LABELS: Record<string, { label: string; number: string; hint: string }> = {
  feature: { label: "Featured (Hero)",   number: "01",  hint: "Full-width top card. Cycles through all photos." },
  tall:    { label: "Voices (Tall)",     number: "02",  hint: "Portrait-ratio left card." },
  wide:    { label: "Gathering (Wide)",  number: "03",  hint: "Wide centre card." },
  square:  { label: "Leadership (Square)", number: "04", hint: "Square bottom-left card." },
};

// Second "wide" card is slot g5 (Learning)
const SLOT_LABEL_BY_ID: Record<string, { label: string; number: string; hint: string }> = {
  g5: { label: "Learning (Wide)", number: "05", hint: "Wide bottom-right card." },
};

export default function StoryGalleryAdminPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState<GalleryItem | null>(null);
  const [newUrl, setNewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/story-gallery");
    setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openEdit(item: GalleryItem) {
    setEditing(item);
    setForm({ ...item, srcs: [...(item.srcs ?? [item.src])] });
    setNewUrl("");
    setError("");
    setSaved(false);
  }

  function closeEdit() { setEditing(null); setForm(null); setError(""); }

  function removeSrc(idx: number) {
    if (!form) return;
    const srcs = form.srcs!.filter((_, i) => i !== idx);
    setForm({ ...form, srcs, src: srcs[0] ?? "" });
  }

  function moveSrc(idx: number, dir: -1 | 1) {
    if (!form) return;
    const srcs = [...form.srcs!];
    const swap = idx + dir;
    if (swap < 0 || swap >= srcs.length) return;
    [srcs[idx], srcs[swap]] = [srcs[swap], srcs[idx]];
    setForm({ ...form, srcs, src: srcs[0] ?? "" });
  }

  function addUrl() {
    if (!form || !newUrl.trim()) return;
    const srcs = [...(form.srcs ?? []), newUrl.trim()];
    setForm({ ...form, srcs, src: srcs[0] });
    setNewUrl("");
  }

  async function handleUpload(files: FileList) {
    if (!form) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const url = await uploadToCloudinary(file);
        urls.push(url);
      } catch (err) { setError("Upload failed: " + (err as Error).message); }
    }
    if (urls.length) {
      const srcs = [...(form.srcs ?? []), ...urls];
      setForm({ ...form, srcs, src: srcs[0] });
    }
    setUploading(false);
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true); setError("");
    try {
      const payload: GalleryItem = {
        ...form,
        src: form.srcs?.[0] ?? form.src,
        srcs: form.srcs?.length ? form.srcs : undefined,
      };
      const res = await fetch("/api/admin/story-gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      await load();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      closeEdit();
    } catch { setError("Save failed. Try again."); }
    finally { setSaving(false); }
  }

  function slotMeta(item: GalleryItem) {
    return SLOT_LABEL_BY_ID[item.id] ?? SLOT_LABELS[item.span ?? ""] ?? { label: item.span ?? item.id, number: "—", hint: "" };
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-[#4F9CEB]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Story Gallery</h1>
        <p className="mt-1 text-sm text-white/40">
          5 fixed bento-grid slots in the About/Story section. Each slot cycles through its photos automatically.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const meta = slotMeta(item);
          const photoCount = item.srcs?.length ?? 1;
          return (
            <div key={item.id} className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
              {/* Preview strip */}
              <div className="flex shrink-0 gap-1">
                {(item.srcs ?? [item.src]).slice(0, 4).map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={src} alt={item.caption ?? meta.label} className="h-12 w-16 rounded-lg object-cover opacity-80" />
                ))}
                {photoCount > 4 && (
                  <div className="flex h-12 w-16 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-xs text-white/40">
                    +{photoCount - 4}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#4F9CEB]/15 px-2 py-0.5 text-[10px] font-medium text-[#4F9CEB]">
                    {meta.number}
                  </span>
                  <p className="text-sm font-medium text-white">{meta.label}</p>
                </div>
                <p className="mt-0.5 truncate text-xs text-white/40">
                  {item.caption ?? "(no caption)"} · {photoCount} photo{photoCount !== 1 ? "s" : ""}
                </p>
              </div>

              <button
                onClick={() => openEdit(item)}
                className="shrink-0 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-white/60 transition hover:bg-white/[0.08] hover:text-white"
              >
                Edit
              </button>
            </div>
          );
        })}
      </div>

      {/* Edit panel */}
      {editing && form && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeEdit} />
          <div className="relative ml-auto flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-white/[0.08] bg-[#0d0d14]">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <div>
                <h2 className="font-semibold text-white">{slotMeta(editing).label}</h2>
                <p className="text-xs text-white/35">{slotMeta(editing).hint}</p>
              </div>
              <button onClick={closeEdit} className="text-white/40 hover:text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 space-y-6 p-6">
              {/* Caption + Alt */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Caption</label>
                  <input type="text" value={form.caption ?? ""} onChange={(e) => setForm({ ...form, caption: e.target.value })} placeholder="Shown on card" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Alt text</label>
                  <input type="text" value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} placeholder="Accessibility description" className={inputCls} />
                </div>
              </div>

              {/* Photo slideshow manager */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-white/40">
                    Slideshow Photos ({form.srcs?.length ?? 0})
                  </p>
                  <span className="text-xs text-white/25">First photo = displayed by default</span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {(form.srcs ?? []).map((src, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={form.alt || `Slideshow photo ${i + 1}`} className="h-10 w-16 shrink-0 rounded-lg object-cover opacity-80" />
                      <p className="min-w-0 flex-1 truncate text-xs text-white/40">{src}</p>
                      {i === 0 && (
                        <span className="shrink-0 rounded-full bg-[#4F9CEB]/15 px-1.5 py-0.5 text-[10px] text-[#4F9CEB]">default</span>
                      )}
                      <div className="flex shrink-0 items-center gap-0.5">
                        <button onClick={() => moveSrc(i, -1)} disabled={i === 0} className="rounded p-1 text-white/30 hover:text-white disabled:opacity-20">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                        </button>
                        <button onClick={() => moveSrc(i, 1)} disabled={i === (form.srcs?.length ?? 1) - 1} className="rounded p-1 text-white/30 hover:text-white disabled:opacity-20">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        <button onClick={() => removeSrc(i)} className="rounded p-1 text-white/30 hover:text-red-400">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add by URL */}
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addUrl()}
                    placeholder="Paste image URL and press Enter"
                    className={inputCls}
                  />
                  <button onClick={addUrl} disabled={!newUrl.trim()} className="shrink-0 rounded-xl border border-[#4F9CEB]/30 bg-[#4F9CEB]/15 px-3 text-sm text-[#4F9CEB] transition hover:bg-[#4F9CEB]/25 disabled:opacity-30">
                    Add
                  </button>
                </div>

                {/* Upload files */}
                <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/[0.10] bg-white/[0.02] px-4 py-3 text-sm text-white/40 transition hover:border-[#4F9CEB]/40 hover:text-white/60">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  {uploading ? "Uploading…" : "Upload photos (select multiple)"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => { if (e.target.files?.length) handleUpload(e.target.files); }}
                  />
                </label>
              </div>

              {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
            </div>

            <div className="border-t border-white/[0.06] p-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-xl border border-[#4F9CEB]/40 bg-[#4F9CEB] py-3 text-sm font-medium text-white transition hover:bg-[#5BAAF0] disabled:opacity-50"
              >
                {saving ? "Saving…" : saved ? "✓ Saved" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-[#4F9CEB]/50 focus:ring-1 focus:ring-[#4F9CEB]/30";
