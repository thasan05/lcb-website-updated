"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import type { Magazine } from "@/content/magazines";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

async function cloudinaryUpload(file: File, type: "image" | "raw"): Promise<string> {
  const res = await fetch(`/api/admin/upload-signature?type=${type}`);
  if (!res.ok) throw new Error("Could not get upload credential");
  const { timestamp, signature, apiKey, cloudName, folder, resourceType } = await res.json();

  const fd = new FormData();
  fd.append("file", file);
  fd.append("timestamp", String(timestamp));
  fd.append("signature", signature);
  fd.append("api_key", apiKey);
  fd.append("folder", folder);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  const uploadRes = await fetch(url, { method: "POST", body: fd });
  const data = await uploadRes.json();
  if (!data.secure_url) throw new Error(data.error?.message ?? "Upload failed");
  return data.secure_url as string;
}

export default function MagazineAdminPage() {
  const [magazines, setMagazines]   = useState<Magazine[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [title, setTitle]           = useState("");
  const [pdfFile, setPdfFile]       = useState<File | null>(null);
  const [coverFile, setCoverFile]   = useState<File | null>(null);
  const [saving, setSaving]         = useState(false);
  const [toggling, setToggling]     = useState<string | null>(null);
  const [deleting, setDeleting]     = useState<string | null>(null);
  const [error, setError]           = useState("");
  const [uploadStep, setUploadStep] = useState("");
  const pdfRef   = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/magazines");
      setMagazines(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openForm() {
    setTitle("");
    setPdfFile(null);
    setCoverFile(null);
    setError("");
    setUploadStep("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setTitle("");
    setPdfFile(null);
    setCoverFile(null);
    setError("");
    setUploadStep("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required"); return; }
    if (!pdfFile) { setError("PDF file is required"); return; }
    setSaving(true);
    setError("");
    try {
      setUploadStep("Uploading PDF…");
      const fileUrl = await cloudinaryUpload(pdfFile, "raw");

      let coverUrl: string | undefined;
      if (coverFile) {
        setUploadStep("Uploading cover image…");
        coverUrl = await cloudinaryUpload(coverFile, "image");
      }

      setUploadStep("Saving…");
      const id = slugify(title.trim());
      const mag: Magazine = {
        id,
        title: title.trim(),
        fileUrl,
        coverUrl,
        fileSize: pdfFile.size,
        uploadedAt: new Date().toISOString(),
        published: true,
      };

      const res = await fetch("/api/admin/magazines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mag),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Save failed");
      }
      closeForm();
      await load();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
      setUploadStep("");
    }
  }

  async function togglePublished(mag: Magazine) {
    setToggling(mag.id);
    try {
      await fetch("/api/admin/magazines", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...mag, published: !mag.published }),
      });
      await load();
    } finally {
      setToggling(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Permanently delete this magazine? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await fetch("/api/admin/magazines", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await load();
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Magazines</h1>
          <p className="mt-1 text-sm text-white/40">
            Upload monthly PDF issues — visible at magazine.linkedincommunitybangladesh.com
          </p>
        </div>
        {!showForm && (
          <button
            onClick={openForm}
            className="flex items-center gap-2 rounded-xl bg-[#4F9CEB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3d8bd6]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Magazine
          </button>
        )}
      </div>

      {/* Upload form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6"
        >
          <h2 className="mb-5 text-base font-semibold text-white">New Magazine</h2>

          {error && (
            <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/70">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. June 2026"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-[#4F9CEB]/50 focus:bg-white/[0.06]"
              />
              {title.trim() && (
                <p className="mt-1 text-xs text-white/30">
                  ID: <span className="font-mono text-white/50">{slugify(title.trim())}</span>
                </p>
              )}
            </div>

            {/* PDF */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/70">
                PDF File <span className="text-red-400">*</span>
              </label>
              <div
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] px-4 py-6 transition hover:border-[#4F9CEB]/40 hover:bg-white/[0.04]"
                onClick={() => pdfRef.current?.click()}
              >
                {pdfFile ? (
                  <>
                    <svg className="h-6 w-6 text-[#4F9CEB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-white/70">{pdfFile.name}</p>
                    <p className="text-xs text-white/40">{formatBytes(pdfFile.size)}</p>
                  </>
                ) : (
                  <>
                    <svg className="h-8 w-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <p className="text-sm text-white/50">Click to choose PDF</p>
                    <p className="text-xs text-white/25">Max 50 MB</p>
                  </>
                )}
              </div>
              <input
                ref={pdfRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {/* Cover image */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/70">
                Cover Image <span className="text-white/30 text-xs font-normal">(optional)</span>
              </label>
              <div
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] px-4 py-4 transition hover:border-[#4F9CEB]/40 hover:bg-white/[0.04]"
                onClick={() => coverRef.current?.click()}
              >
                {coverFile ? (
                  <p className="text-sm text-white/70">{coverFile.name}</p>
                ) : (
                  <p className="text-sm text-white/40">Click to add cover image</p>
                )}
              </div>
              <input
                ref={coverRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[#4F9CEB] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3d8bd6] disabled:opacity-50"
            >
              {saving && (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {saving ? uploadStep || "Uploading…" : "Upload & Save"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              disabled={saving}
              className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-white/50 transition hover:text-white disabled:opacity-40"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-white/30">
          <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : magazines.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] py-16 text-center text-white/30">
          <svg className="mx-auto mb-3 h-10 w-10 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          <p className="text-sm">No magazines yet — add the first one above.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02] text-left text-xs font-medium uppercase tracking-wider text-white/30">
                  <th className="px-5 py-3.5">Magazine</th>
                  <th className="px-5 py-3.5 hidden sm:table-cell">Uploaded</th>
                  <th className="px-5 py-3.5 hidden sm:table-cell">Size</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {magazines.map((mag) => (
                  <tr key={mag.id} className="group bg-transparent transition hover:bg-white/[0.02]">
                    {/* Cover + title */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {mag.coverUrl ? (
                          <div className="relative h-10 w-8 shrink-0 overflow-hidden rounded border border-white/10">
                            <Image src={mag.coverUrl} alt={mag.title} fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="flex h-10 w-8 shrink-0 items-center justify-center rounded border border-white/[0.08] bg-white/[0.03]">
                            <svg className="h-4 w-4 text-white/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-white">{mag.title}</p>
                          <p className="font-mono text-[11px] text-white/30">{mag.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white/40 hidden sm:table-cell">{formatDate(mag.uploadedAt)}</td>
                    <td className="px-5 py-4 text-white/40 hidden sm:table-cell">
                      {mag.fileSize ? formatBytes(mag.fileSize) : "—"}
                    </td>
                    {/* Status toggle */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => togglePublished(mag)}
                        disabled={toggling === mag.id}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                          mag.published
                            ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-white/[0.06] text-white/40 hover:bg-white/[0.10]"
                        } disabled:opacity-40`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${mag.published ? "bg-emerald-400" : "bg-white/30"}`} />
                        {toggling === mag.id ? "…" : mag.published ? "Published" : "Draft"}
                      </button>
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/magazine/${mag.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-white/50 transition hover:border-white/20 hover:text-white"
                        >
                          View
                        </a>
                        <button
                          onClick={() => handleDelete(mag.id)}
                          disabled={deleting === mag.id}
                          className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-400/60 transition hover:border-red-500/40 hover:text-red-400 disabled:opacity-40"
                        >
                          {deleting === mag.id ? "…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
