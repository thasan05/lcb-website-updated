"use client";

import { useEffect, useState, useCallback } from "react";
import type { PressItem } from "@/content/press";
import { errorFromResponse } from "@/lib/admin-error";

type FormState = Omit<PressItem, "id"> & { id?: string };

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function formatDateLabel(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short", day: "2-digit", year: "numeric",
  });
}
function domainFrom(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
}

const EMPTY: FormState = {
  headline: "", outlet: "", url: "", date: "", dateLabel: "", published: true,
};

export default function PressAdminPage() {
  const [items,        setItems]        = useState<PressItem[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [editingItem,  setEditingItem]  = useState<PressItem | null>(null);
  const [saving,       setSaving]       = useState(false);
  const [deleting,     setDeleting]     = useState<string | null>(null);
  const [error,        setError]        = useState("");
  const [form,         setForm]         = useState<FormState>(EMPTY);
  const [selected,     setSelected]     = useState<Set<string>>(new Set());
  const [bulkLoading,  setBulkLoading]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/press");
    setItems(await res.json());
    setLoading(false);
    setSelected(new Set());
  }, []);

  useEffect(() => { load(); }, [load]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function openNew() {
    setEditingItem(null); setForm(EMPTY); setError(""); setShowForm(true);
  }
  function openEdit(item: PressItem) {
    setEditingItem(item);
    setForm({ ...item });
    setError(""); setShowForm(true);
  }
  function closeForm() { setShowForm(false); setEditingItem(null); setError(""); }

  async function handleSave() {
    if (!form.headline || !form.outlet || !form.url) {
      setError("Headline, outlet, and URL are required."); return;
    }
    setSaving(true); setError("");
    try {
      const id = editingItem?.id ?? slugify(form.outlet + "-" + form.headline.slice(0, 30)) + "-" + Date.now();
      const payload: PressItem = {
        ...form,
        id,
        dateLabel: form.dateLabel || (form.date ? formatDateLabel(form.date) : undefined),
        date: form.date || undefined,
        published: form.published ?? true,
      };
      const res = await fetch("/api/admin/press", {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await errorFromResponse(res));
      closeForm(); await load();
    } catch (e) { setError((e as Error).message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this press item?")) return;
    setDeleting(id);
    try {
      await fetch("/api/admin/press", {
        method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
      });
      await load();
    } finally { setDeleting(null); }
  }

  async function handleBulk(action: "publish" | "unpublish" | "delete") {
    if (selected.size === 0) return;
    if (action === "delete" && !confirm(`Delete ${selected.size} item(s)?`)) return;
    setBulkLoading(true);
    try {
      await fetch("/api/admin/press", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids: [...selected] }),
      });
      await load();
    } finally { setBulkLoading(false); }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }
  function toggleAll() {
    setSelected((prev) => prev.size === items.length ? new Set() : new Set(items.map((i) => i.id)));
  }

  const inputCls = "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-brand-400/40 focus:bg-white/[0.06]";
  const labelCls = "block text-xs font-medium uppercase tracking-wider text-white/40 mb-1.5";

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">LCB in Press</h1>
          <p className="mt-1 text-sm text-white/40">Media coverage and press mentions</p>
        </div>
        <button onClick={openNew} className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600">
          + Add Coverage
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl border border-white/[0.10] bg-white/[0.03] p-6 space-y-5">
          <h2 className="text-base font-semibold text-white">{editingItem ? "Edit" : "New"} Press Item</h2>
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
          )}

          <div>
            <label className={labelCls}>URL *</label>
            <input
              className={inputCls}
              placeholder="https://newspaper.com/article/…"
              value={form.url}
              onChange={(e) => {
                setField("url", e.target.value);
                if (!form.outlet && e.target.value) {
                  setField("outlet", domainFrom(e.target.value));
                }
              }}
            />
          </div>

          <div>
            <label className={labelCls}>Headline *</label>
            <input
              className={inputCls}
              placeholder="Article headline or title"
              value={form.headline}
              onChange={(e) => setField("headline", e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Outlet / Publication *</label>
              <input
                className={inputCls}
                placeholder="e.g. The Daily Star"
                value={form.outlet}
                onChange={(e) => setField("outlet", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Date (optional)</label>
              <input
                type="date"
                className={inputCls}
                value={form.date ?? ""}
                onChange={(e) => {
                  setField("date", e.target.value);
                  setField("dateLabel", formatDateLabel(e.target.value));
                }}
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5">
            <div
              onClick={() => setField("published", !form.published)}
              className={`relative h-5 w-9 rounded-full transition-colors ${form.published ? "bg-brand-500" : "bg-white/10"}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.published ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
            <span className="text-sm text-white/70">Published</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving}
              className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50">
              {saving ? "Saving…" : editingItem ? "Update" : "Add"}
            </button>
            <button onClick={closeForm}
              className="rounded-xl border border-white/[0.08] px-5 py-2.5 text-sm text-white/60 transition hover:border-white/20 hover:text-white">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
          <span className="text-sm text-white/60">{selected.size} selected</span>
          <button onClick={() => handleBulk("publish")} disabled={bulkLoading} className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/25 disabled:opacity-50">Publish</button>
          <button onClick={() => handleBulk("unpublish")} disabled={bulkLoading} className="rounded-lg bg-amber-500/15 px-3 py-1.5 text-xs font-medium text-amber-300 transition hover:bg-amber-500/25 disabled:opacity-50">Unpublish</button>
          <button onClick={() => handleBulk("delete")} disabled={bulkLoading} className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/25 disabled:opacity-50">Delete</button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <p className="text-sm text-white/40">Loading…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] py-16 text-center">
          <p className="text-white/30">No press items yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-white/40">
            <input type="checkbox" checked={selected.size === items.length && items.length > 0} onChange={toggleAll} className="rounded" />
            Select all ({items.length})
          </label>
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:border-white/[0.10]">
              <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)} className="mt-1 rounded" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/40">{item.outlet}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${item.published ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-white/40"}`}>
                    {item.published ? "Published" : "Draft"}
                  </span>
                  {item.dateLabel && <span className="text-[11px] text-white/30">{item.dateLabel}</span>}
                </div>
                <p className="mt-1.5 text-sm font-medium text-white/80">{item.headline}</p>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-0.5 block truncate text-xs text-white/30 hover:text-brand-300 transition-colors">{item.url}</a>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => openEdit(item)} className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-white/60 transition hover:border-white/20 hover:text-white">Edit</button>
                <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id}
                  className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-400 transition hover:border-red-500/40 hover:bg-red-500/10 disabled:opacity-50">
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
