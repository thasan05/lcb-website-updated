"use client";

import { useEffect, useState, useCallback } from "react";
import type { Event, EventStatus } from "@/content/events";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

const EMPTY_EVENT: Omit<Event, "id"> = {
  title: "",
  description: "",
  date: "",
  dateLabel: "",
  location: "",
  format: "Online",
  status: "upcoming",
  image: "",
  href: "",
  partner: "",
  speaker: undefined,
  published: true,
};

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function formatDateLabel(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export default function EventsAdminPage() {
  const [events,       setEvents]       = useState<Event[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [uploading,    setUploading]    = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [deleting,     setDeleting]     = useState<string | null>(null);
  const [error,        setError]        = useState("");
  const [form,         setForm]         = useState<Omit<Event, "id"> & { id?: string }>(EMPTY_EVENT);
  const [hasSpeaker,   setHasSpeaker]   = useState(false);

  // Bulk selection
  const [selected,    setSelected]    = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/events");
    setEvents(await res.json());
    setLoading(false);
    setSelected(new Set());
  }, []);

  useEffect(() => { load(); }, [load]);

  function openNew() {
    setEditingEvent(null);
    setForm({ ...EMPTY_EVENT });
    setHasSpeaker(false);
    setError("");
    setShowForm(true);
  }
  function openEdit(event: Event) {
    setEditingEvent(event);
    setForm({ ...event });
    setHasSpeaker(!!event.speaker);
    setError("");
    setShowForm(true);
  }
  function closeForm() { setShowForm(false); setEditingEvent(null); setError(""); }

  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm((f) => ({ ...f, image: url }));
    } catch (err) { setError("Upload failed: " + (err as Error).message); }
    finally { setUploading(false); }
  }

  async function handleSave() {
    if (!form.title || !form.date || !form.image) {
      setError("Title, date, and image are required.");
      return;
    }
    setSaving(true); setError("");
    try {
      const payload: Event = {
        ...form,
        id: form.id || slugify(form.title) || `event-${Date.now()}`,
        dateLabel: form.dateLabel || formatDateLabel(form.date),
        partner: form.partner || undefined,
        href:    form.href    || undefined,
        speaker: hasSpeaker && form.speaker?.name ? form.speaker : undefined,
      } as Event;
      const res = await fetch("/api/admin/events", {
        method:  editingEvent ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      await load(); closeForm();
    } catch { setError("Save failed. Try again."); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this event?")) return;
    setDeleting(id);
    await fetch("/api/admin/events", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    await load(); setDeleting(null);
  }

  async function toggleStatus(event: Event) {
    const newStatus: EventStatus = event.status === "upcoming" ? "past" : "upcoming";
    await fetch("/api/admin/events", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...event, status: newStatus }) });
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
  function selectAll() { setSelected(new Set(events.map((e) => e.id))); }
  function clearSelection() { setSelected(new Set()); }

  async function bulkSetPublished(published: boolean) {
    if (selected.size === 0) return;
    setBulkLoading(true);
    await Promise.all(
      events
        .filter((e) => selected.has(e.id))
        .map((e) =>
          fetch("/api/admin/events", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...e, published }) })
        )
    );
    await load(); setBulkLoading(false);
  }

  async function bulkDelete() {
    if (selected.size === 0 || !confirm(`Delete ${selected.size} event(s)?`)) return;
    setBulkLoading(true);
    await Promise.all(
      [...selected].map((id) =>
        fetch("/api/admin/events", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
      )
    );
    await load(); setBulkLoading(false);
  }

  const upcoming = events.filter((e) => e.status === "upcoming");
  const past     = events.filter((e) => e.status === "past");

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Events</h1>
          <p className="mt-1 text-sm text-white/40">{events.length} total · {upcoming.length} upcoming · {past.length} past</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 rounded-xl border border-[#4F9CEB]/40 bg-[#4F9CEB] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#5BAAF0]">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Event
        </button>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-brand-400/20 bg-brand-500/10 px-4 py-3">
          <span className="text-sm font-medium text-white">{selected.size} selected</span>
          <div className="flex flex-1 items-center gap-2">
            <button onClick={() => bulkSetPublished(true)} disabled={bulkLoading} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-50">
              Publish
            </button>
            <button onClick={() => bulkSetPublished(false)} disabled={bulkLoading} className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-50">
              Unpublish
            </button>
            <button onClick={bulkDelete} disabled={bulkLoading} className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50">
              Delete
            </button>
          </div>
          <button onClick={clearSelection} className="text-xs text-white/40 hover:text-white">Clear</button>
        </div>
      )}

      {/* Select all / clear */}
      {events.length > 0 && (
        <div className="flex items-center gap-3">
          <button onClick={selectAll} className="text-xs text-white/40 hover:text-white">Select all</button>
          {selected.size > 0 && <button onClick={clearSelection} className="text-xs text-white/40 hover:text-white">Deselect all</button>}
        </div>
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-[#4F9CEB]" />
        </div>
      ) : (
        <>
          <EventList title="Upcoming" events={upcoming} selected={selected} onToggleSelect={toggleSelect} onEdit={openEdit} onDelete={handleDelete} onToggle={toggleStatus} deleting={deleting} />
          <EventList title="Past"     events={past}     selected={selected} onToggleSelect={toggleSelect} onEdit={openEdit} onDelete={handleDelete} onToggle={toggleStatus} deleting={deleting} />
        </>
      )}

      {/* Slide-in form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative ml-auto flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-white/[0.08] bg-[#0d0d14]">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <h2 className="font-semibold text-white">{editingEvent ? "Edit Event" : "New Event"}</h2>
              <button onClick={closeForm} className="text-white/40 hover:text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 space-y-5 p-6">
              <Field label="Title *">
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" className={inputCls} />
              </Field>

              <Field label="Description">
                <RichTextEditor
                  value={form.description}
                  onChange={(html) => setForm({ ...form, description: html })}
                  placeholder="Short description of the event"
                  minHeight={100}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Date *">
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value, dateLabel: formatDateLabel(e.target.value) })} className={inputCls} />
                </Field>
                <Field label="Status">
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as EventStatus })} className={inputCls}>
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past</option>
                    <option value="live">Live</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Format">
                  <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value as Event["format"] })} className={inputCls}>
                    <option value="Online">Online</option>
                    <option value="On-Campus">On-Campus</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </Field>
                <Field label="Location">
                  <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Online · Live" className={inputCls} />
                </Field>
              </div>

              <Field label="Partner / Co-host">
                <input type="text" value={form.partner ?? ""} onChange={(e) => setForm({ ...form, partner: e.target.value })} placeholder="e.g. JNU Finance Club" className={inputCls} />
              </Field>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/40">
                  <input type="checkbox" checked={hasSpeaker} onChange={(e) => setHasSpeaker(e.target.checked)} className="rounded border-white/20 bg-white/5" />
                  Add Speaker
                </label>
                {hasSpeaker && (
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <input type="text" value={form.speaker?.name ?? ""} onChange={(e) => setForm({ ...form, speaker: { name: e.target.value, role: form.speaker?.role ?? "" } })} placeholder="Speaker name" className={inputCls} />
                    <input type="text" value={form.speaker?.role ?? ""} onChange={(e) => setForm({ ...form, speaker: { name: form.speaker?.name ?? "", role: e.target.value } })} placeholder="Role / title" className={inputCls} />
                  </div>
                )}
              </div>

              <Field label="External link (optional)">
                <input type="url" value={form.href ?? ""} onChange={(e) => setForm({ ...form, href: e.target.value })} placeholder="https://..." className={inputCls} />
              </Field>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                <input type="checkbox" checked={form.published !== false} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="rounded border-white/20 bg-white/5 accent-[#4F9CEB]" />
                <div>
                  <p className="text-sm text-white">Published</p>
                  <p className="text-xs text-white/35">Uncheck to save as draft — hidden from public site.</p>
                </div>
              </label>

              <Field label="Image *">
                <ImageUploader value={form.image} uploading={uploading} onChange={(url) => setForm({ ...form, image: url })} onFile={handleImageUpload} />
              </Field>

              {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
            </div>

            <div className="border-t border-white/[0.06] p-6">
              <button onClick={handleSave} disabled={saving} className="w-full rounded-xl border border-[#4F9CEB]/40 bg-[#4F9CEB] py-3 text-sm font-medium text-white transition-all hover:bg-[#5BAAF0] disabled:opacity-50">
                {saving ? "Saving…" : editingEvent ? "Save Changes" : "Add Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EventList({ title, events, selected, onToggleSelect, onEdit, onDelete, onToggle, deleting }: {
  title: string; events: Event[]; selected: Set<string>;
  onToggleSelect: (id: string) => void;
  onEdit: (e: Event) => void; onDelete: (id: string) => void;
  onToggle: (e: Event) => void; deleting: string | null;
}) {
  return (
    <div>
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-white/30">{title} ({events.length})</h2>
      {events.length === 0 ? (
        <p className="rounded-xl border border-white/[0.05] bg-white/[0.02] py-6 text-center text-sm text-white/25">No {title.toLowerCase()} events</p>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div key={event.id} className={`flex items-center gap-3 rounded-xl border bg-white/[0.03] px-4 py-3 transition-all ${selected.has(event.id) ? "border-brand-400/30 bg-brand-500/[0.05]" : "border-white/[0.07]"}`}>
              <input type="checkbox" checked={selected.has(event.id)} onChange={() => onToggleSelect(event.id)}
                className="h-4 w-4 shrink-0 cursor-pointer rounded border-white/20 bg-white/5 accent-[#4F9CEB]" />
              <span className={`h-2 w-2 shrink-0 rounded-full ${event.status === "upcoming" ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" : "bg-white/20"}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-white">{event.title}</p>
                  {event.published === false && <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-400">Draft</span>}
                </div>
                <p className="text-xs text-white/35">{event.dateLabel} · {event.format}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button onClick={() => onToggle(event)} title={event.status === "upcoming" ? "Mark as Past" : "Mark as Upcoming"}
                  className="rounded-lg px-2 py-1 text-xs text-white/40 transition hover:bg-white/[0.06] hover:text-white">
                  {event.status === "upcoming" ? "→ Past" : "→ Upcoming"}
                </button>
                <button onClick={() => onEdit(event)} className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/[0.06] hover:text-white">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={() => onDelete(event.id)} disabled={deleting === event.id} className="rounded-lg p-1.5 text-white/40 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
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
