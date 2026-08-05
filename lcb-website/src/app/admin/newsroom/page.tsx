"use client";

import { useEffect, useState, useCallback } from "react";
import type { NewsItem, NewsCategory } from "@/content/news";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { errorFromResponse } from "@/lib/admin-error";

const CATEGORIES: NewsCategory[] = ["Announcement", "Event", "Milestone", "Partnership", "Spotlight"];

const EMPTY_ITEM: Omit<NewsItem, "id"> = {
  title: "", summary: "", date: "", dateLabel: "", category: "Announcement",
  image: "", href: "", featured: false, published: true,
  social: { linkedin: "", facebook: "", instagram: "" },
};

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function formatDateLabel(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

const CATEGORY_COLORS: Record<NewsCategory, string> = {
  Announcement: "bg-blue-500/15 text-blue-300",
  Event:        "bg-purple-500/15 text-purple-300",
  Milestone:    "bg-amber-500/15 text-amber-300",
  Partnership:  "bg-emerald-500/15 text-emerald-300",
  Spotlight:    "bg-pink-500/15 text-pink-300",
};

export default function NewsroomAdminPage() {
  const [items,        setItems]        = useState<NewsItem[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [editingItem,  setEditingItem]  = useState<NewsItem | null>(null);
  const [uploading,    setUploading]    = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [deleting,     setDeleting]     = useState<string | null>(null);
  const [error,        setError]        = useState("");
  const [filter,       setFilter]       = useState<NewsCategory | "All">("All");
  const [form,         setForm]         = useState<Omit<NewsItem, "id"> & { id?: string }>(EMPTY_ITEM);

  // Bulk selection
  const [selected,    setSelected]    = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/news");
    setItems(await res.json());
    setLoading(false);
    setSelected(new Set());
  }, []);

  useEffect(() => { load(); }, [load]);

  function openNew() {
    setEditingItem(null);
    setForm({ ...EMPTY_ITEM, social: { linkedin: "", facebook: "", instagram: "" } });
    setError(""); setShowForm(true);
  }
  function openEdit(item: NewsItem) {
    setEditingItem(item);
    setForm({ ...item, social: { linkedin: item.social?.linkedin ?? "", facebook: item.social?.facebook ?? "", instagram: item.social?.instagram ?? "" } });
    setError(""); setShowForm(true);
  }
  function closeForm() { setShowForm(false); setEditingItem(null); setError(""); }

  async function handleImageUpload(file: File) {
    setUploading(true);
    try { const url = await uploadToCloudinary(file); setForm((f) => ({ ...f, image: url })); }
    catch (err) { setError("Upload failed: " + (err as Error).message); }
    finally { setUploading(false); }
  }

  async function handleSave() {
    if (!form.title || !form.date || !form.image || !form.summary) {
      setError("Title, summary, date, and image are required."); return;
    }
    setSaving(true); setError("");
    try {
      const social = {
        ...(form.social?.linkedin  ? { linkedin:  form.social.linkedin  } : {}),
        ...(form.social?.facebook  ? { facebook:  form.social.facebook  } : {}),
        ...(form.social?.instagram ? { instagram: form.social.instagram } : {}),
      };
      const payload: NewsItem = {
        ...form,
        id:        form.id || slugify(form.title) || `news-${Date.now()}`,
        dateLabel: form.dateLabel || formatDateLabel(form.date),
        href:      form.href || undefined,
        social:    Object.keys(social).length > 0 ? social : undefined,
      } as NewsItem;
      const res = await fetch("/api/admin/news", { method: editingItem ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(await errorFromResponse(res));
      await load(); closeForm();
    } catch (e) { setError((e as Error).message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this news item?")) return;
    setDeleting(id);
    await fetch("/api/admin/news", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    await load(); setDeleting(null);
  }

  async function toggleFeatured(item: NewsItem) {
    await fetch("/api/admin/news", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...item, featured: !item.featured }) });
    await load();
  }

  // ── Bulk actions ──────────────────────────────────────────────────────────
  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }
  function selectAll() { setSelected(new Set(items.map((i) => i.id))); }
  function clearSelection() { setSelected(new Set()); }

  async function bulkSetPublished(published: boolean) {
    if (selected.size === 0) return;
    setBulkLoading(true);
    await Promise.all(
      items.filter((i) => selected.has(i.id)).map((i) =>
        fetch("/api/admin/news", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...i, published }) })
      )
    );
    await load(); setBulkLoading(false);
  }

  async function bulkDelete() {
    if (selected.size === 0 || !confirm(`Delete ${selected.size} item(s)?`)) return;
    setBulkLoading(true);
    await Promise.all([...selected].map((id) =>
      fetch("/api/admin/news", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    ));
    await load(); setBulkLoading(false);
  }

  const filtered = filter === "All" ? items : items.filter((i) => i.category === filter);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Newsroom</h1>
          <p className="mt-1 text-sm text-white/40">{items.length} items total</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 rounded-xl border border-[#4F9CEB]/40 bg-[#4F9CEB] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#5BAAF0]">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add News
        </button>
      </div>

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(["All", ...CATEGORIES] as const).map((cat) => (
          <button key={cat} onClick={() => setFilter(cat as NewsCategory | "All")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${filter === cat ? "bg-[#4F9CEB] text-white" : "bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white"}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-brand-400/20 bg-brand-500/10 px-4 py-3">
          <span className="text-sm font-medium text-white">{selected.size} selected</span>
          <div className="flex flex-1 items-center gap-2">
            <button onClick={() => bulkSetPublished(true)} disabled={bulkLoading} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-50">Publish</button>
            <button onClick={() => bulkSetPublished(false)} disabled={bulkLoading} className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-50">Unpublish</button>
            <button onClick={bulkDelete} disabled={bulkLoading} className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50">Delete</button>
          </div>
          <button onClick={clearSelection} className="text-xs text-white/40 hover:text-white">Clear</button>
        </div>
      )}

      {items.length > 0 && (
        <div className="flex items-center gap-3">
          <button onClick={selectAll} className="text-xs text-white/40 hover:text-white">Select all</button>
          {selected.size > 0 && <button onClick={clearSelection} className="text-xs text-white/40 hover:text-white">Deselect all</button>}
        </div>
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-[#4F9CEB]" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="rounded-xl border border-white/[0.05] bg-white/[0.02] py-10 text-center text-sm text-white/25">No items in this category</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div key={item.id} className={`flex items-center gap-3 rounded-xl border bg-white/[0.03] px-4 py-3 transition-all ${selected.has(item.id) ? "border-brand-400/30 bg-brand-500/[0.05]" : "border-white/[0.07]"}`}>
              <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)}
                className="h-4 w-4 shrink-0 cursor-pointer rounded border-white/20 bg-white/5 accent-[#4F9CEB]" />
              <button onClick={() => toggleFeatured(item)} title={item.featured ? "Unset featured" : "Set as featured"}
                className={`shrink-0 transition ${item.featured ? "text-amber-400" : "text-white/20 hover:text-white/50"}`}>
                <svg className="h-4 w-4" fill={item.featured ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt={item.title} className="h-10 w-10 shrink-0 rounded-lg object-cover opacity-70" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-white">{item.title}</p>
                  {item.published === false && <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-400">Draft</span>}
                </div>
                <p className="text-xs text-white/35">{item.dateLabel}</p>
              </div>
              <span className={`hidden shrink-0 rounded-full px-2 py-0.5 text-xs font-medium sm:block ${CATEGORY_COLORS[item.category]}`}>{item.category}</span>
              <div className="flex shrink-0 items-center gap-1">
                <button onClick={() => openEdit(item)} className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/[0.06] hover:text-white">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id} className="rounded-lg p-1.5 text-white/40 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-in form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative ml-auto flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-white/[0.08] bg-[#0d0d14]">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <h2 className="font-semibold text-white">{editingItem ? "Edit News Item" : "New News Item"}</h2>
              <button onClick={closeForm} className="text-white/40 hover:text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 space-y-5 p-6">
              <Field label="Title *">
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="News headline" className={inputCls} />
              </Field>

              <Field label="Summary *">
                <RichTextEditor
                  value={form.summary}
                  onChange={(html) => setForm({ ...form, summary: html })}
                  placeholder="Short summary shown in the newsroom"
                  minHeight={120}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Date *">
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value, dateLabel: formatDateLabel(e.target.value) })} className={inputCls} />
                </Field>
                <Field label="Category">
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as NewsCategory })} className={inputCls}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="External link (optional)">
                <input type="url" value={form.href ?? ""} onChange={(e) => setForm({ ...form, href: e.target.value })} placeholder="https://..." className={inputCls} />
              </Field>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">Social Links (optional)</p>
                <div className="space-y-2">
                  <input type="url" value={form.social?.linkedin ?? ""} onChange={(e) => setForm({ ...form, social: { ...form.social, linkedin: e.target.value } })} placeholder="LinkedIn post URL" className={inputCls} />
                  <input type="url" value={form.social?.facebook ?? ""} onChange={(e) => setForm({ ...form, social: { ...form.social, facebook: e.target.value } })} placeholder="Facebook post URL" className={inputCls} />
                  <input type="url" value={form.social?.instagram ?? ""} onChange={(e) => setForm({ ...form, social: { ...form.social, instagram: e.target.value } })} placeholder="Instagram post URL" className={inputCls} />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                <input type="checkbox" checked={form.published !== false} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="rounded border-white/20 bg-white/5 accent-[#4F9CEB]" />
                <div>
                  <p className="text-sm text-white">Published</p>
                  <p className="text-xs text-white/35">Uncheck to save as draft — hidden from public site.</p>
                </div>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                <input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded border-white/20 bg-white/5 accent-[#4F9CEB]" />
                <div>
                  <p className="text-sm text-white">Featured item</p>
                  <p className="text-xs text-white/35">Shows large at the top of the Newsroom. Only one item can be featured at a time.</p>
                </div>
              </label>

              <Field label="Image *">
                <ImageUploader value={form.image} uploading={uploading} onChange={(url) => setForm({ ...form, image: url })} onFile={handleImageUpload} />
              </Field>

              {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
            </div>

            <div className="border-t border-white/[0.06] p-6">
              <button onClick={handleSave} disabled={saving} className="w-full rounded-xl border border-[#4F9CEB]/40 bg-[#4F9CEB] py-3 text-sm font-medium text-white transition-all hover:bg-[#5BAAF0] disabled:opacity-50">
                {saving ? "Saving…" : editingItem ? "Save Changes" : "Add News Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">{label}</label>
      {children}
    </div>
  );
}

function ImageUploader({ value, uploading, onChange, onFile }: { value: string; uploading: boolean; onChange: (url: string) => void; onFile: (file: File) => void }) {
  return (
    <div className="space-y-2">
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Paste image URL or upload below" className={inputCls} />
      <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] px-4 py-3 text-sm text-white/40 transition hover:border-[#4F9CEB]/40 hover:text-white/60">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        {uploading ? "Uploading…" : "Upload image (max 5 MB)"}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) onFile(e.target.files[0]); }} />
      </label>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="Preview" className="h-24 w-full rounded-xl object-cover opacity-80" />
      )}
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-[#4F9CEB]/50 focus:ring-1 focus:ring-[#4F9CEB]/30";
