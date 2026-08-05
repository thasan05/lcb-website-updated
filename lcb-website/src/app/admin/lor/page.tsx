"use client";

import { useEffect, useState, useCallback } from "react";
import type { LorConfig, LorQuestion, LorQuestionType, LorSubmission } from "@/content/lor";
import { errorFromResponse } from "@/lib/admin-error";

type Tab = "settings" | "questions" | "submissions";

const STATUS_COLORS: Record<LorSubmission["status"], string> = {
  pending:  "bg-amber-500/15 text-amber-300",
  approved: "bg-emerald-500/15 text-emerald-300",
  rejected: "bg-red-500/15 text-red-300",
};

const inputCls  = "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-[#4F9CEB]/40 focus:bg-white/[0.06]";
const labelCls  = "block text-xs font-medium uppercase tracking-wider text-white/40 mb-1.5";
const btnCls    = "rounded-xl bg-[#4F9CEB] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3d8bd6] disabled:opacity-50";
const ghostCls  = "rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-white/60 transition hover:border-white/20 hover:text-white";

const EMPTY_Q: Omit<LorQuestion, "id" | "order"> = {
  type: "text", label: "", placeholder: "", required: true, options: [],
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now();
}

export default function AdminLorPage() {
  const [tab,         setTab]         = useState<Tab>("settings");
  const [config,      setConfig]      = useState<LorConfig | null>(null);
  const [submissions, setSubmissions] = useState<LorSubmission[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState("");

  /* ── Question editor state ── */
  const [addingQ,     setAddingQ]     = useState(false);
  const [editingQId,  setEditingQId]  = useState<string | null>(null);
  const [qForm,       setQForm]       = useState<Omit<LorQuestion, "id" | "order">>(EMPTY_Q);
  const [optionsRaw,  setOptionsRaw]  = useState("");

  /* ── Submission detail ── */
  const [expandedSub,  setExpandedSub]  = useState<string | null>(null);
  const [subNote,      setSubNote]      = useState<Record<string, string>>({});
  const [updatingSub,  setUpdatingSub]  = useState<string | null>(null);
  const [deletingSub,  setDeletingSub]  = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/lor");
      const data = await res.json();
      setConfig(data.config);
      setSubmissions(data.submissions ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Save full config ── */
  async function saveConfig(updated: LorConfig) {
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/admin/lor", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "config", data: updated }),
      });
      if (!res.ok) throw new Error(await errorFromResponse(res));
      setConfig(updated);
      setSuccess("Saved.");
      setTimeout(() => setSuccess(""), 2500);
    } catch (e) { setError((e as Error).message); }
    finally { setSaving(false); }
  }

  /* ── Settings helpers ── */
  function toggleOpen() {
    if (!config) return;
    saveConfig({ ...config, open: !config.open });
  }
  function updateClosedMessage(v: string) {
    if (!config) return;
    setConfig({ ...config, closedMessage: v });
  }
  function saveClosedMessage() {
    if (!config) return;
    saveConfig(config);
  }
  function addRule() {
    if (!config) return;
    setConfig({ ...config, rules: [...config.rules, ""] });
  }
  function updateRule(i: number, v: string) {
    if (!config) return;
    const rules = [...config.rules];
    rules[i] = v;
    setConfig({ ...config, rules });
  }
  function removeRule(i: number) {
    if (!config) return;
    const rules = config.rules.filter((_, idx) => idx !== i);
    setConfig({ ...config, rules });
  }
  function moveRule(i: number, dir: -1 | 1) {
    if (!config) return;
    const rules = [...config.rules];
    const j = i + dir;
    if (j < 0 || j >= rules.length) return;
    [rules[i], rules[j]] = [rules[j], rules[i]];
    setConfig({ ...config, rules });
  }

  /* ── Question helpers ── */
  function openAddQ() { setQForm(EMPTY_Q); setOptionsRaw(""); setAddingQ(true); setEditingQId(null); }
  function openEditQ(q: LorQuestion) {
    setQForm({ type: q.type, label: q.label, placeholder: q.placeholder ?? "", required: q.required, options: q.options ?? [] });
    setOptionsRaw((q.options ?? []).join("\n"));
    setEditingQId(q.id);
    setAddingQ(false);
  }
  function cancelQ() { setAddingQ(false); setEditingQId(null); }

  function commitQ() {
    if (!config || !qForm.label.trim()) return;
    const opts = optionsRaw.split("\n").map(s => s.trim()).filter(Boolean);
    const questions = [...config.questions];
    if (editingQId) {
      const idx = questions.findIndex(q => q.id === editingQId);
      if (idx !== -1) questions[idx] = { ...questions[idx], ...qForm, options: opts };
    } else {
      const maxOrder = questions.reduce((m, q) => Math.max(m, q.order), 0);
      questions.push({ id: slugify(qForm.label), order: maxOrder + 1, ...qForm, options: opts });
    }
    cancelQ();
    saveConfig({ ...config, questions });
  }

  function deleteQ(id: string) {
    if (!config || !confirm("Delete this question?")) return;
    saveConfig({ ...config, questions: config.questions.filter(q => q.id !== id) });
  }

  function moveQ(id: string, dir: -1 | 1) {
    if (!config) return;
    const sorted = [...config.questions].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(q => q.id === id);
    const j = idx + dir;
    if (j < 0 || j >= sorted.length) return;
    const orders = sorted.map(q => q.order);
    const questions = config.questions.map(q => {
      if (q.id === sorted[idx].id) return { ...q, order: orders[j] };
      if (q.id === sorted[j].id)   return { ...q, order: orders[idx] };
      return q;
    });
    saveConfig({ ...config, questions });
  }

  /* ── Submission helpers ── */
  async function updateSubStatus(id: string, status: LorSubmission["status"]) {
    setUpdatingSub(id);
    try {
      await fetch("/api/admin/lor", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "submission-status", id, status, notes: subNote[id] ?? "" }),
      });
      await load();
    } finally { setUpdatingSub(null); }
  }

  async function deleteSub(id: string) {
    if (!confirm("Delete this submission? Cannot be undone.")) return;
    setDeletingSub(id);
    try {
      await fetch("/api/admin/lor", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await load();
    } finally { setDeletingSub(null); }
  }

  if (loading) return <p className="text-sm text-white/40">Loading…</p>;
  if (!config)  return <p className="text-sm text-red-400">Failed to load LOR config.</p>;

  const sortedQ = [...config.questions].sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">LOR Management</h1>
          <p className="mt-1 text-sm text-white/40">Letter of Recommendation — settings, form, submissions</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
          config.open ? "bg-emerald-500/15 text-emerald-300" : "bg-white/[0.08] text-white/40"
        }`}>
          {config.open ? "Open" : "Closed"}
        </span>
      </div>

      {/* Feedback */}
      {error   && <div className="rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-300">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.08] px-4 py-3 text-sm text-emerald-300">{success}</div>}

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
        {(["settings", "questions", "submissions"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize transition ${
              tab === t
                ? "bg-[#4F9CEB]/15 text-[#7BB8F0]"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {t}{t === "submissions" ? ` (${submissions.length})` : ""}
          </button>
        ))}
      </div>

      {/* ── SETTINGS TAB ── */}
      {tab === "settings" && (
        <div className="space-y-6">
          {/* Open / Closed toggle */}
          <div className="flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
            <div>
              <p className="text-sm font-semibold text-white">Accept Applications</p>
              <p className="mt-0.5 text-xs text-white/40">Toggle to open or close LOR applications site-wide</p>
            </div>
            <button
              onClick={toggleOpen}
              disabled={saving}
              className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${
                config.open ? "bg-[#4F9CEB]" : "bg-white/[0.12]"
              }`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                config.open ? "translate-x-5" : "translate-x-0.5"
              }`} />
            </button>
          </div>

          {/* Closed message */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 space-y-3">
            <p className="text-sm font-semibold text-white">Closed Message</p>
            <p className="text-xs text-white/40">Shown to visitors when applications are closed</p>
            <textarea
              className={inputCls + " resize-none"}
              rows={3}
              value={config.closedMessage}
              onChange={(e) => updateClosedMessage(e.target.value)}
            />
            <button onClick={saveClosedMessage} disabled={saving} className={btnCls}>
              {saving ? "Saving…" : "Save Message"}
            </button>
          </div>

          {/* Rules editor */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Terms &amp; Rules</p>
              <button onClick={addRule} className={ghostCls + " text-xs"}>+ Add Rule</button>
            </div>
            <div className="space-y-3">
              {config.rules.map((rule, i) => (
                <div key={i} className="flex gap-2">
                  <div className="flex flex-col gap-1">
                    <button onClick={() => moveRule(i, -1)} disabled={i === 0} className="rounded px-1.5 py-0.5 text-[10px] text-white/30 hover:text-white/70 disabled:opacity-20">▲</button>
                    <button onClick={() => moveRule(i, 1)} disabled={i === config.rules.length - 1} className="rounded px-1.5 py-0.5 text-[10px] text-white/30 hover:text-white/70 disabled:opacity-20">▼</button>
                  </div>
                  <span className="mt-2.5 shrink-0 text-xs font-bold text-white/30">{i + 1}.</span>
                  <textarea
                    className={inputCls + " resize-none flex-1"}
                    rows={2}
                    value={rule}
                    onChange={(e) => updateRule(i, e.target.value)}
                  />
                  <button
                    onClick={() => removeRule(i)}
                    className="mt-1 h-8 w-8 shrink-0 rounded-lg text-red-400/50 transition hover:bg-red-500/10 hover:text-red-400"
                  >✕</button>
                </div>
              ))}
            </div>
            <button onClick={() => saveConfig(config)} disabled={saving} className={btnCls}>
              {saving ? "Saving…" : "Save Rules"}
            </button>
          </div>
        </div>
      )}

      {/* ── QUESTIONS TAB ── */}
      {tab === "questions" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/50">{sortedQ.length} question{sortedQ.length !== 1 ? "s" : ""} in form</p>
            {!addingQ && !editingQId && (
              <button onClick={openAddQ} className={btnCls}>+ Add Question</button>
            )}
          </div>

          {/* Add / Edit form */}
          {(addingQ || editingQId) && (
            <div className="rounded-2xl border border-[#4F9CEB]/20 bg-[#4F9CEB]/[0.04] p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">{editingQId ? "Edit" : "New"} Question</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Label *</label>
                  <input className={inputCls} placeholder="e.g. Full Name" value={qForm.label}
                    onChange={e => setQForm(f => ({ ...f, label: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Type</label>
                  <select className={inputCls} value={qForm.type}
                    onChange={e => setQForm(f => ({ ...f, type: e.target.value as LorQuestionType }))}>
                    <option value="text">Short text</option>
                    <option value="textarea">Long text</option>
                    <option value="select">Dropdown</option>
                    <option value="radio">Radio buttons</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Placeholder</label>
                <input className={inputCls} placeholder="Hint text shown in field…" value={qForm.placeholder ?? ""}
                  onChange={e => setQForm(f => ({ ...f, placeholder: e.target.value }))} />
              </div>

              {(qForm.type === "select" || qForm.type === "radio") && (
                <div>
                  <label className={labelCls}>Options (one per line)</label>
                  <textarea className={inputCls + " resize-none"} rows={4}
                    placeholder={"Option A\nOption B\nOption C"}
                    value={optionsRaw}
                    onChange={e => setOptionsRaw(e.target.value)} />
                </div>
              )}

              <label className="flex cursor-pointer items-center gap-2.5">
                <div
                  onClick={() => setQForm(f => ({ ...f, required: !f.required }))}
                  className={`relative h-5 w-9 rounded-full transition-colors ${qForm.required ? "bg-[#4F9CEB]" : "bg-white/10"}`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${qForm.required ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
                <span className="text-sm text-white/70">Required field</span>
              </label>

              <div className="flex gap-3 pt-1">
                <button onClick={commitQ} disabled={saving || !qForm.label.trim()} className={btnCls}>
                  {saving ? "Saving…" : editingQId ? "Update" : "Add"}
                </button>
                <button onClick={cancelQ} className={ghostCls}>Cancel</button>
              </div>
            </div>
          )}

          {/* Questions list */}
          {sortedQ.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/[0.08] py-14 text-center">
              <p className="text-sm text-white/30">No questions yet. Add one above.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {sortedQ.map((q, idx) => (
                <div key={q.id} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveQ(q.id, -1)} disabled={idx === 0} className="text-[10px] leading-none text-white/25 hover:text-white/60 disabled:opacity-20">▲</button>
                    <button onClick={() => moveQ(q.id, 1)} disabled={idx === sortedQ.length - 1} className="text-[10px] leading-none text-white/25 hover:text-white/60 disabled:opacity-20">▼</button>
                  </div>
                  <span className="w-5 shrink-0 text-center text-xs font-bold text-white/25">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/85">{q.label}
                      {q.required && <span className="ml-1 text-red-400/60">*</span>}
                    </p>
                    <p className="text-xs text-white/35">{q.type}{q.placeholder ? ` · "${q.placeholder}"` : ""}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => openEditQ(q)} className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-white/60 transition hover:border-white/20 hover:text-white">Edit</button>
                    <button onClick={() => deleteQ(q.id)} className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-500/10">Del</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SUBMISSIONS TAB ── */}
      {tab === "submissions" && (
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/[0.08] py-16 text-center">
              <p className="text-sm text-white/30">No submissions yet.</p>
            </div>
          ) : (
            submissions.map((sub) => {
              const name  = sub.answers["full-name"] ?? sub.answers["name"] ?? "—";
              const email = sub.answers["email"] ?? "—";
              const date  = new Date(sub.submittedAt).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
              });
              const isExpanded = expandedSub === sub.id;

              return (
                <div key={sub.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.02]">
                  {/* Row header */}
                  <div
                    className="flex cursor-pointer items-center gap-3 px-5 py-4"
                    onClick={() => setExpandedSub(isExpanded ? null : sub.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white/85">{name}</p>
                      <p className="text-xs text-white/40">{email} · {date}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_COLORS[sub.status]}`}>
                      {sub.status}
                    </span>
                    <span className="text-white/30">{isExpanded ? "▲" : "▼"}</span>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-white/[0.06] px-5 py-4 space-y-4">
                      {/* All answers */}
                      <div className="space-y-3">
                        {sortedQ.map((q) => (
                          sub.answers[q.id] ? (
                            <div key={q.id}>
                              <p className="text-[11px] font-medium uppercase tracking-wider text-white/35">{q.label}</p>
                              <p className="mt-0.5 text-sm text-white/75 whitespace-pre-wrap">{sub.answers[q.id]}</p>
                            </div>
                          ) : null
                        ))}
                      </div>

                      {/* Status + notes */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className={labelCls}>Status</label>
                          <select
                            className={inputCls}
                            value={sub.status}
                            onChange={(e) =>
                              updateSubStatus(sub.id, e.target.value as LorSubmission["status"])
                            }
                            disabled={updatingSub === sub.id}
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Internal Notes</label>
                          <input
                            className={inputCls}
                            placeholder="Private notes…"
                            value={subNote[sub.id] ?? sub.notes ?? ""}
                            onChange={(e) =>
                              setSubNote((p) => ({ ...p, [sub.id]: e.target.value }))
                            }
                          />
                        </div>
                      </div>

                      <div className="flex gap-2.5">
                        <button
                          onClick={() => updateSubStatus(sub.id, sub.status)}
                          disabled={updatingSub === sub.id}
                          className={btnCls}
                        >
                          {updatingSub === sub.id ? "Saving…" : "Save Notes"}
                        </button>
                        <button
                          onClick={() => deleteSub(sub.id)}
                          disabled={deletingSub === sub.id}
                          className="rounded-xl border border-red-500/20 px-4 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                        >
                          {deletingSub === sub.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
