"use client";

import { useCallback, useEffect, useState } from "react";
import type { Stat, StatsConfig } from "@/content/stats";
import { errorFromResponse } from "@/lib/admin-error";

const inputCls =
  "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-[#4F9CEB]/50 focus:bg-white/[0.06]";

const labelCls =
  "mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40";

export default function StatsAdminPage() {
  const [config, setConfig] = useState<StatsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error(await errorFromResponse(res, "Failed to load stats."));
      setConfig(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load stats.");
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function setItem(index: number, patch: Partial<Stat>) {
    setSaved(false);
    setConfig((c) =>
      c ? { ...c, items: c.items.map((it, i) => (i === index ? { ...it, ...patch } : it)) } : c
    );
  }

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/stats", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        setError(await errorFromResponse(res));
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      setError("Network error — your change was not saved.");
    }
    setSaving(false);
  }

  if (loading) {
    return <p className="text-sm text-white/40">Loading…</p>;
  }

  if (!config) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-300">
        {error || "Could not load stats."}
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Homepage Stats</h1>
        <p className="mt-1 text-sm text-white/45">
          The “movement in numbers” band on the homepage. Changes go live as soon as you save.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mb-5 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
        <label className={labelCls} htmlFor="updated-label">Updated label</label>
        <input
          id="updated-label"
          type="text"
          className={inputCls}
          value={config.updatedLabel}
          placeholder="August 2026"
          onChange={(e) => { setSaved(false); setConfig({ ...config, updatedLabel: e.target.value }); }}
        />
        <p className="mt-1.5 text-xs text-white/30">
          Shown as “Updated {config.updatedLabel || "…"}” in the top-right of the band.
        </p>
      </div>

      <div className="space-y-4">
        {config.items.map((item, i) => (
          <div key={i} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
            <div className="mb-4 flex items-baseline gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
                0{i + 1}
              </span>
              <span className="text-sm font-medium text-white/70">
                {item.value}{item.suffix} · {item.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <label className={labelCls} htmlFor={`value-${i}`}>Number</label>
                <input
                  id={`value-${i}`}
                  type="text"
                  className={inputCls}
                  value={item.value}
                  placeholder="125"
                  onChange={(e) => setItem(i, { value: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor={`suffix-${i}`}>Suffix</label>
                <input
                  id={`suffix-${i}`}
                  type="text"
                  className={inputCls}
                  value={item.suffix ?? ""}
                  placeholder="+"
                  onChange={(e) => setItem(i, { suffix: e.target.value })}
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className={labelCls} htmlFor={`label-${i}`}>Label</label>
                <input
                  id={`label-${i}`}
                  type="text"
                  className={inputCls}
                  value={item.label}
                  placeholder="Campus Leads"
                  onChange={(e) => setItem(i, { label: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-3">
              <label className={labelCls} htmlFor={`description-${i}`}>Description</label>
              <input
                id={`description-${i}`}
                type="text"
                className={inputCls}
                value={item.description}
                placeholder="Across leading universities…"
                onChange={(e) => setItem(i, { description: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-[#4F9CEB] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3d8bd6] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {saved && <span className="text-sm text-emerald-400">Saved — live on the homepage.</span>}
      </div>

      <p className="mt-6 text-xs text-white/25">
        Note: the numbers in the social-share preview image and the /shout card are set in code
        and are not affected by this page.
      </p>
    </div>
  );
}
