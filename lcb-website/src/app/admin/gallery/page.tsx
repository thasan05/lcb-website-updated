"use client";

import { useEffect, useState, useCallback, useRef, DragEvent } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";

type GalleryCategory = { id: string; label: string };
type GalleryImage = {
  id: string;
  src: string;
  category: string;
  alt: string;
  caption?: string;
};
type Manifest = {
  version: number;
  categories: GalleryCategory[];
  images: GalleryImage[];
};

// Staged file before upload
type StagedFile = {
  key: string;          // local temp key
  file: File;
  preview: string;      // object URL
  alt: string;
  caption: string;
  status: "pending" | "uploading" | "done" | "error";
  uploadedSrc?: string;
  errorMsg?: string;
};

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function altFromFilename(name: string) {
  return name
    .replace(/\.[^.]+$/, "")       // remove extension
    .replace(/[-_]+/g, " ")        // dashes/underscores → spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()); // Title Case
}

export default function GalleryAdminPage() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<string>("all");

  // Bulk select
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Drag-to-reorder
  const [reorderedImages, setReorderedImages] = useState<GalleryImage[]>([]);
  const [orderDirty, setOrderDirty] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Category editor
  const [showCatEditor, setShowCatEditor] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState("");
  const [catSaving, setCatSaving] = useState(false);

  // Edit existing image (single)
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [editForm, setEditForm] = useState<GalleryImage | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  // Bulk upload state
  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [batchCategory, setBatchCategory] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/gallery");
    const data: Manifest = await res.json();
    setManifest(data);
    setReorderedImages(data.images);
    setOrderDirty(false);
    setBatchCategory(data.categories[0]?.id ?? "events");
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Drag & drop handlers ────────────────────────────────────────────────────
  function onDragOver(e: DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }
  function onDragLeave() { setDragOver(false); }
  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    stageFiles(Array.from(e.dataTransfer.files));
  }
  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) stageFiles(Array.from(e.target.files));
    e.target.value = "";
  }

  function stageFiles(files: File[]) {
    const images = files.filter((f) => f.type.startsWith("image/"));
    const newItems: StagedFile[] = images.map((file) => ({
      key: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      alt: altFromFilename(file.name),
      caption: "",
      status: "pending",
    }));
    setStaged((prev) => [...prev, ...newItems]);
  }

  function removeStagedFile(key: string) {
    setStaged((prev) => {
      const item = prev.find((s) => s.key === key);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((s) => s.key !== key);
    });
  }

  function updateStaged(key: string, patch: Partial<StagedFile>) {
    setStaged((prev) => prev.map((s) => s.key === key ? { ...s, ...patch } : s));
  }

  async function uploadAll() {
    if (!staged.length || !manifest) return;
    setUploading(true);

    for (const item of staged) {
      if (item.status === "done") continue;
      updateStaged(item.key, { status: "uploading" });

      try {
        // 1. Upload directly to Cloudinary (bypasses Vercel 4.5 MB body limit)
        const url = await uploadToCloudinary(item.file);

        // 2. Add to manifest
        const image: GalleryImage = {
          id: `img-${slugify(item.alt) || "photo"}-${Date.now()}`,
          src: url,
          category: batchCategory,
          alt: item.alt || item.file.name,
          caption: item.caption || undefined,
        };
        await fetch("/api/admin/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(image),
        });

        updateStaged(item.key, { status: "done", uploadedSrc: url });
      } catch (err) {
        updateStaged(item.key, { status: "error", errorMsg: (err as Error).message });
      }
    }

    setUploading(false);
    await load();

    // Clear done items after brief delay
    setTimeout(() => {
      setStaged((prev) => {
        prev.filter((s) => s.status === "done").forEach((s) => URL.revokeObjectURL(s.preview));
        return prev.filter((s) => s.status !== "done");
      });
    }, 1200);
  }

  // ── Edit existing image ─────────────────────────────────────────────────────
  function openEdit(img: GalleryImage) {
    setEditingImage(img);
    setEditForm({ ...img });
  }
  function closeEdit() { setEditingImage(null); setEditForm(null); }

  async function saveEdit() {
    if (!editForm) return;
    setEditSaving(true);
    await fetch("/api/admin/gallery", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    await load();
    closeEdit();
    setEditSaving(false);
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    if (!confirm("Remove this photo from the gallery?")) return;
    setDeleting(id);
    await fetch("/api/admin/gallery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
    setDeleting(null);
  }

  // ── Category management ─────────────────────────────────────────────────────
  async function handleAddCategory() {
    if (!newCatLabel.trim() || !manifest) return;
    setCatSaving(true);
    const id = slugify(newCatLabel.trim());
    const updated = [...manifest.categories, { id, label: newCatLabel.trim() }];
    await fetch("/api/admin/gallery", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "categories", categories: updated }),
    });
    setNewCatLabel("");
    await load();
    setCatSaving(false);
  }

  async function handleDeleteCategory(id: string) {
    if (!manifest) return;
    if (!confirm(`Delete category "${id}"? Photos stay but lose their category filter.`)) return;
    const updated = manifest.categories.filter((c) => c.id !== id);
    await fetch("/api/admin/gallery", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "categories", categories: updated }),
    });
    await load();
  }

  // ── Drag-to-reorder helpers ─────────────────────────────────────────────────
  function handleReorderDragStart(id: string) {
    setDraggedId(id);
  }

  function handleReorderDragOver(e: DragEvent<HTMLDivElement>, targetId: string) {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    const from = reorderedImages.findIndex((i) => i.id === draggedId);
    const to   = reorderedImages.findIndex((i) => i.id === targetId);
    if (from === -1 || to === -1) return;
    const arr = [...reorderedImages];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    setReorderedImages(arr);
    setOrderDirty(true);
  }

  function handleReorderDragEnd() {
    setDraggedId(null);
  }

  async function saveOrder() {
    setSavingOrder(true);
    await fetch("/api/admin/gallery", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "reorder", images: reorderedImages }),
    });
    setOrderDirty(false);
    await load();
    setSavingOrder(false);
  }

  // ── Bulk select helpers ─────────────────────────────────────────────────────
  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectAll(ids: string[]) {
    setSelected(new Set(ids));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  async function handleBulkDelete() {
    if (!selected.size) return;
    if (!confirm(`Delete ${selected.size} photo${selected.size !== 1 ? "s" : ""}? This cannot be undone.`)) return;
    setBulkDeleting(true);
    await fetch("/api/admin/gallery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected) }),
    });
    clearSelection();
    await load();
    setBulkDeleting(false);
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading || !manifest) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-[#4F9CEB]" />
      </div>
    );
  }

  const allCats = [{ id: "all", label: "All" }, ...manifest.categories];
  // Use reorderedImages (drag-aware) for display; fall back to manifest on initial load
  const displayImages = reorderedImages.length ? reorderedImages : manifest.images;
  const filtered =
    filterCat === "all"
      ? displayImages
      : displayImages.filter((img) => img.category === filterCat);

  const pendingCount = staged.filter((s) => s.status === "pending" || s.status === "error").length;
  const doneCount = staged.filter((s) => s.status === "done").length;

  return (
    <div className="max-w-5xl space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gallery</h1>
          <p className="mt-1 text-sm text-white/40">
            {manifest.images.length} photos · {manifest.categories.length} categories
          </p>
        </div>
        <button
          onClick={() => setShowCatEditor(!showCatEditor)}
          className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-white/60 transition hover:bg-white/[0.07] hover:text-white"
        >
          Categories
        </button>
      </div>

      {/* ── Category editor ── */}
      {showCatEditor && (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-4">
          <p className="text-sm font-medium text-white">Manage Categories</p>
          <div className="flex flex-wrap gap-2">
            {manifest.categories.map((cat) => (
              <span
                key={cat.id}
                className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs text-white/70"
              >
                {cat.label}
                <button onClick={() => handleDeleteCategory(cat.id)} className="ml-0.5 text-white/30 hover:text-red-400 transition">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCatLabel}
              onChange={(e) => setNewCatLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              placeholder="New category name"
              className={inputCls}
            />
            <button
              onClick={handleAddCategory}
              disabled={catSaving || !newCatLabel.trim()}
              className="rounded-xl border border-[#4F9CEB]/40 bg-[#4F9CEB]/20 px-4 py-2 text-sm text-[#4F9CEB] transition hover:bg-[#4F9CEB]/30 disabled:opacity-40"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* ── Drop zone ── */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all ${
          dragOver
            ? "border-[#4F9CEB] bg-[#4F9CEB]/10"
            : "border-white/[0.10] bg-white/[0.02] hover:border-white/[0.18] hover:bg-white/[0.04]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={onFileInput}
        />
        <svg className="mx-auto mb-3 h-8 w-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <p className="text-sm font-medium text-white/60">
          {dragOver ? "Drop photos here" : "Drop photos here or click to select"}
        </p>
        <p className="mt-1 text-xs text-white/30">Select multiple files at once · JPEG, PNG, WebP · max 5 MB each</p>
      </div>

      {/* ── Staged files queue ── */}
      {staged.length > 0 && (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white">
              {staged.length} photo{staged.length !== 1 ? "s" : ""} queued
              {doneCount > 0 && <span className="ml-2 text-emerald-400">· {doneCount} uploaded</span>}
            </p>
            <button
              onClick={() => {
                staged.forEach((s) => URL.revokeObjectURL(s.preview));
                setStaged([]);
              }}
              className="text-xs text-white/30 hover:text-white/60 transition"
            >
              Clear all
            </button>
          </div>

          {/* Shared category for batch */}
          <div className="flex items-center gap-3">
            <label className="text-xs text-white/40 shrink-0">Category for all:</label>
            <select
              value={batchCategory}
              onChange={(e) => setBatchCategory(e.target.value)}
              className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-[#4F9CEB]/50"
            >
              {manifest.categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Staged grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {staged.map((item) => (
              <div key={item.key} className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02]">
                {/* Thumbnail */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.preview} alt={item.alt} className="aspect-[4/3] w-full object-cover opacity-80" />

                {/* Status overlay */}
                {item.status === "uploading" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  </div>
                )}
                {item.status === "done" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-emerald-900/60">
                    <svg className="h-6 w-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {item.status === "error" && (
                  <div className="absolute inset-x-0 top-0 bg-red-500/80 px-2 py-1 text-[10px] text-white">
                    {item.errorMsg ?? "Error"}
                  </div>
                )}

                {/* Remove (pending only) */}
                {(item.status === "pending" || item.status === "error") && (
                  <button
                    onClick={() => removeStagedFile(item.key)}
                    className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white/70 hover:text-white text-xs"
                  >
                    ×
                  </button>
                )}

                {/* Alt text input */}
                {item.status !== "done" && (
                  <div className="p-2 space-y-1">
                    <input
                      type="text"
                      value={item.alt}
                      onChange={(e) => updateStaged(item.key, { alt: e.target.value })}
                      placeholder="Alt text"
                      className="w-full rounded-lg border border-white/[0.06] bg-white/[0.04] px-2 py-1 text-[11px] text-white placeholder-white/20 outline-none focus:border-[#4F9CEB]/40"
                    />
                    <input
                      type="text"
                      value={item.caption}
                      onChange={(e) => updateStaged(item.key, { caption: e.target.value })}
                      placeholder="Caption (optional)"
                      className="w-full rounded-lg border border-white/[0.06] bg-white/[0.04] px-2 py-1 text-[11px] text-white placeholder-white/20 outline-none focus:border-[#4F9CEB]/40"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Upload button */}
          {pendingCount > 0 && (
            <button
              onClick={uploadAll}
              disabled={uploading}
              className="w-full rounded-xl border border-[#4F9CEB]/40 bg-[#4F9CEB] py-3 text-sm font-medium text-white transition hover:bg-[#5BAAF0] disabled:opacity-50"
            >
              {uploading
                ? `Uploading… (${staged.filter((s) => s.status === "done").length}/${staged.length})`
                : `Upload ${pendingCount} photo${pendingCount !== 1 ? "s" : ""} to Gallery`}
            </button>
          )}
        </div>
      )}

      {/* ── Category filter tabs + bulk toolbar ── */}
      <div className="flex flex-wrap items-center gap-2">
        {allCats.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setFilterCat(cat.id); clearSelection(); }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              filterCat === cat.id
                ? "bg-[#4F9CEB] text-white"
                : "bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white"
            }`}
          >
            {cat.label}
            {cat.id !== "all" && (
              <span className="ml-1.5 text-[10px] opacity-60">
                {manifest.images.filter((i) => i.category === cat.id).length}
              </span>
            )}
          </button>
        ))}

        {/* Save order button — appears when order changed */}
        {orderDirty && selected.size === 0 && (
          <button
            onClick={saveOrder}
            disabled={savingOrder}
            className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-40"
          >
            {savingOrder ? "Saving…" : "Save order ↑"}
          </button>
        )}

        {/* Bulk controls — appear once any are selected */}
        <div className="ml-auto flex items-center gap-2">
          {selected.size > 0 ? (
            <>
              <span className="text-xs text-white/40">{selected.size} selected</span>
              <button
                onClick={clearSelection}
                className="rounded-full border border-white/[0.08] px-3 py-1 text-xs text-white/50 transition hover:text-white"
              >
                Deselect all
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs text-red-400 transition hover:bg-red-500/20 disabled:opacity-40"
              >
                {bulkDeleting ? "Deleting…" : `Delete ${selected.size}`}
              </button>
            </>
          ) : (
            filtered.length > 0 && (
              <button
                onClick={() => selectAll(filtered.map((i) => i.id))}
                className="rounded-full border border-white/[0.08] px-3 py-1 text-xs text-white/40 transition hover:text-white"
              >
                Select all
              </button>
            )
          )}
        </div>
      </div>

      {/* ── Photo grid ── */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] py-20 text-center">
          <p className="text-sm text-white/30">No photos yet. Drop images above to add.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((img) => {
            const isSelected = selected.has(img.id);
            return (
              <div
                key={img.id}
                draggable
                onDragStart={() => handleReorderDragStart(img.id)}
                onDragOver={(e) => handleReorderDragOver(e, img.id)}
                onDragEnd={handleReorderDragEnd}
                className={`group relative overflow-hidden rounded-xl border bg-white/[0.02] transition cursor-grab active:cursor-grabbing ${
                  draggedId === img.id ? "opacity-40 scale-95" : ""
                } ${isSelected ? "border-[#4F9CEB]/60 ring-1 ring-[#4F9CEB]/30" : "border-white/[0.07]"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt}
                  className="aspect-[4/3] w-full object-cover opacity-80 transition group-hover:opacity-100"
                />
                <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white/70 backdrop-blur-sm">
                  {manifest.categories.find((c) => c.id === img.category)?.label ?? img.category}
                </span>

                {/* Checkbox — top right, always visible when selected, else on hover */}
                <button
                  onClick={() => toggleSelect(img.id)}
                  className={`absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded border transition ${
                    isSelected
                      ? "border-[#4F9CEB] bg-[#4F9CEB] opacity-100"
                      : "border-white/40 bg-black/50 opacity-0 group-hover:opacity-100"
                  }`}
                  aria-label={isSelected ? "Deselect" : "Select"}
                >
                  {isSelected && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* Hover actions (edit + single delete) — hidden when in bulk-select mode */}
                {selected.size === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(img)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white backdrop-blur hover:bg-white/20"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(img.id)}
                      disabled={deleting === img.id}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 text-red-300 backdrop-blur hover:bg-red-500/40 disabled:opacity-40"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}

                {img.caption && (
                  <div className="border-t border-white/[0.06] px-2.5 py-2">
                    <p className="truncate text-[11px] text-white/40">{img.caption}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Edit single image panel ── */}
      {editingImage && editForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeEdit} />
          <div className="relative ml-auto flex h-full w-full max-w-sm flex-col overflow-y-auto border-l border-white/[0.08] bg-[#0d0d14]">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <h2 className="font-semibold text-white">Edit Photo</h2>
              <button onClick={closeEdit} className="text-white/40 hover:text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 space-y-4 p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={editForm.src} alt={editForm.alt} className="h-36 w-full rounded-xl object-cover opacity-80" />

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className={inputCls}
                >
                  {manifest.categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Alt Text</label>
                <input
                  type="text"
                  value={editForm.alt}
                  onChange={(e) => setEditForm({ ...editForm, alt: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Caption</label>
                <input
                  type="text"
                  value={editForm.caption ?? ""}
                  onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                  placeholder="Shown on hover"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">Image URL</label>
                <input
                  type="text"
                  value={editForm.src}
                  onChange={(e) => setEditForm({ ...editForm, src: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="border-t border-white/[0.06] p-6">
              <button
                onClick={saveEdit}
                disabled={editSaving}
                className="w-full rounded-xl border border-[#4F9CEB]/40 bg-[#4F9CEB] py-3 text-sm font-medium text-white transition hover:bg-[#5BAAF0] disabled:opacity-50"
              >
                {editSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-[#4F9CEB]/50 focus:ring-1 focus:ring-[#4F9CEB]/30";
