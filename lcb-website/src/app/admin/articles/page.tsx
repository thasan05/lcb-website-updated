"use client";

import { useEffect, useState, useCallback } from "react";
import type { Article } from "@/content/articles";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

type FormState = Omit<Article, "id"> & { id?: string };

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
function formatDateLabel(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

const EMPTY_FORM: FormState = {
  title: "",
  excerpt: "",
  content: "",
  authorName: "",
  authorDesignation: "",
  authorCompany: "",
  authorPhoto: "",
  date: "",
  dateLabel: "",
  coverImage: "",
  tags: [],
  published: true,
  featured: false,
};

export default function ArticlesAdminPage() {
  const [items,        setItems]        = useState<Article[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [editingItem,  setEditingItem]  = useState<Article | null>(null);
  const [uploading,    setUploading]    = useState<"cover" | "author" | null>(null);
  const [saving,       setSaving]       = useState(false);
  const [deleting,     setDeleting]     = useState<string | null>(null);
  const [error,        setError]        = useState("");
  const [form,         setForm]         = useState<FormState>(EMPTY_FORM);
  const [tagsInput,    setTagsInput]    = useState("");

  // Bulk selection
  const [selected,    setSelected]    = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/articles");
    setItems(await res.json());
    setLoading(false);
    setSelected(new Set());
  }, []);

  useEffect(() => { load(); }, [load]);

  function openNew() {
    setEditingItem(null);
    setForm({ ...EMPTY_FORM });
    setTagsInput("");
    setError("");
    setShowForm(true);
  }
  function openEdit(item: Article) {
    setEditingItem(item);
    setForm({ ...item });
    setTagsInput((item.tags ?? []).join(", "));
    setError("");
    setShowForm(true);
  }
  function closeForm() { setShowForm(false); setEditingItem(null); setError(""); }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleImageUpload(field: "coverImage" | "authorPhoto") {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(field === "coverImage" ? "cover" : "author");
      try {
        const url = await uploadToCloudinary(file);
        setField(field, url);
      } catch (err) {
        setError("Upload failed: " + (err as Error).message);
      } finally {
        setUploading(null);
      }
    };
    input.click();
  }

  async function handleSave() {
    if (!form.title || !form.date || !form.excerpt || !form.content || !form.authorName || !form.authorDesignation) {
      setError("Title, excerpt, content, author name, designation, and date are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const id = editingItem?.id ?? slugify(form.title) + "-" + Date.now();
      const parsedTags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const payload: Article = {
        ...form,
        id,
        dateLabel: form.dateLabel || formatDateLabel(form.date),
        tags: parsedTags.length > 0 ? parsedTags : undefined,
        authorCompany: form.authorCompany || undefined,
        authorPhoto: form.authorPhoto || undefined,
        coverImage: form.coverImage || undefined,
        featured: form.featured ?? false,
      };
      const method = editingItem ? "PUT" : "POST";
      const res = await fetch("/api/admin/articles", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Save failed");
      }
      closeForm();
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this article?")) return;
    setDeleting(id);
    try {
      await fetch("/api/admin/articles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await load();
    } finally {
      setDeleting(null);
    }
  }

  async function handleBulk(action: "publish" | "unpublish" | "delete") {
    if (selected.size === 0) return;
    if (action === "delete" && !confirm(`Delete ${selected.size} article(s)?`)) return;
    setBulkLoading(true);
    try {
      await fetch("/api/admin/articles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids: [...selected] }),
      });
      await load();
    } finally {
      setBulkLoading(false);
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }
  function toggleAll() {
    setSelected((prev) =>
      prev.size === items.length ? new Set() : new Set(items.map((i) => i.id))
    );
  }

  const inputCls =
    "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-brand-400/40 focus:bg-white/[0.06]";
  const labelCls = "block text-xs font-medium uppercase tracking-wider text-white/40 mb-1.5";

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Forum Articles</h1>
          <p className="mt-1 text-sm text-white/40">
            Thought leadership articles from community members
          </p>
        </div>
        <button
          onClick={openNew}
          className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          + New Article
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl border border-white/[0.10] bg-white/[0.03] p-6 space-y-5">
          <h2 className="text-base font-semibold text-white">
            {editingItem ? "Edit Article" : "New Article"}
          </h2>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className={labelCls}>Title *</label>
            <input
              className={inputCls}
              placeholder="Article title…"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className={labelCls}>Excerpt * (short preview)</label>
            <textarea
              className={inputCls + " resize-none"}
              rows={3}
              placeholder="1–3 sentence summary shown on the card…"
              value={form.excerpt}
              onChange={(e) => setField("excerpt", e.target.value)}
            />
          </div>

          {/* Content */}
          <div>
            <label className={labelCls}>Content * (full article)</label>
            <RichTextEditor
              value={form.content}
              onChange={(v) => setField("content", v)}
              placeholder="Write the full article here…"
              minHeight={280}
            />
          </div>

          {/* Author row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Author Name *</label>
              <input
                className={inputCls}
                placeholder="e.g. Tanvir Ahmed"
                value={form.authorName}
                onChange={(e) => setField("authorName", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Designation *</label>
              <input
                className={inputCls}
                placeholder="e.g. Head of Growth at XYZ Corp"
                value={form.authorDesignation}
                onChange={(e) => setField("authorDesignation", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Company (optional)</label>
              <input
                className={inputCls}
                placeholder="e.g. XYZ Corporation"
                value={form.authorCompany ?? ""}
                onChange={(e) => setField("authorCompany", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Author Photo</label>
              <div className="flex gap-2">
                <input
                  className={inputCls + " flex-1"}
                  placeholder="https://… or upload →"
                  value={form.authorPhoto ?? ""}
                  onChange={(e) => setField("authorPhoto", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => handleImageUpload("authorPhoto")}
                  disabled={uploading === "author"}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-xs text-white/60 transition hover:border-brand-400/30 hover:text-white disabled:opacity-50"
                >
                  {uploading === "author" ? "…" : "Upload"}
                </button>
              </div>
            </div>
          </div>

          {/* Date + Cover */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Date *</label>
              <input
                type="date"
                className={inputCls}
                value={form.date}
                onChange={(e) => {
                  setField("date", e.target.value);
                  setField("dateLabel", formatDateLabel(e.target.value));
                }}
              />
            </div>
            <div>
              <label className={labelCls}>Cover Image (optional)</label>
              <div className="flex gap-2">
                <input
                  className={inputCls + " flex-1"}
                  placeholder="https://… or upload →"
                  value={form.coverImage ?? ""}
                  onChange={(e) => setField("coverImage", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => handleImageUpload("coverImage")}
                  disabled={uploading === "cover"}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-xs text-white/60 transition hover:border-brand-400/30 hover:text-white disabled:opacity-50"
                >
                  {uploading === "cover" ? "…" : "Upload"}
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className={labelCls}>Tags (comma-separated, optional)</label>
            <input
              className={inputCls}
              placeholder="Career, Leadership, LinkedIn Tips"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6">
            {(["published", "featured"] as const).map((key) => (
              <label key={key} className="flex cursor-pointer items-center gap-2.5">
                <div
                  onClick={() => setField(key, !form[key])}
                  className={`relative h-5 w-9 rounded-full transition-colors ${
                    form[key] ? "bg-brand-500" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      form[key] ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </div>
                <span className="text-sm capitalize text-white/70">{key}</span>
              </label>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
            >
              {saving ? "Saving…" : editingItem ? "Update" : "Publish"}
            </button>
            <button
              onClick={closeForm}
              className="rounded-xl border border-white/[0.08] px-5 py-2.5 text-sm text-white/60 transition hover:border-white/20 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
          <span className="text-sm text-white/60">{selected.size} selected</span>
          <button
            onClick={() => handleBulk("publish")}
            disabled={bulkLoading}
            className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/25 disabled:opacity-50"
          >
            Publish
          </button>
          <button
            onClick={() => handleBulk("unpublish")}
            disabled={bulkLoading}
            className="rounded-lg bg-amber-500/15 px-3 py-1.5 text-xs font-medium text-amber-300 transition hover:bg-amber-500/25 disabled:opacity-50"
          >
            Unpublish
          </button>
          <button
            onClick={() => handleBulk("delete")}
            disabled={bulkLoading}
            className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/25 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <p className="text-sm text-white/40">Loading articles…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] py-16 text-center">
          <p className="text-white/30">No articles yet. Add the first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Select all */}
          <label className="flex cursor-pointer items-center gap-2 text-xs text-white/40">
            <input
              type="checkbox"
              checked={selected.size === items.length && items.length > 0}
              onChange={toggleAll}
              className="rounded"
            />
            Select all ({items.length})
          </label>

          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:border-white/[0.10]"
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selected.has(item.id)}
                onChange={() => toggleSelect(item.id)}
                className="mt-1 rounded"
              />

              {/* Cover thumb */}
              {item.coverImage && (
                <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.coverImage} alt="" className="h-full w-full object-cover" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-medium text-white">{item.title}</span>
                  {item.featured && (
                    <span className="rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-bold text-brand-300">
                      FEATURED
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      item.published
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-white/10 text-white/40"
                    }`}
                  >
                    {item.published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-white/40">
                  {item.authorName} · {item.authorDesignation}
                  {item.authorCompany && ` · ${item.authorCompany}`}
                  {" · "}
                  {item.dateLabel}
                </p>
                {item.tags && item.tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.tags.map((t) => (
                      <span key={t} className="rounded-full bg-white/[0.05] px-2 py-px text-[10px] text-white/40">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => openEdit(item)}
                  className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-white/60 transition hover:border-white/20 hover:text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting === item.id}
                  className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-400 transition hover:border-red-500/40 hover:bg-red-500/10 disabled:opacity-50"
                >
                  {deleting === item.id ? "…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
