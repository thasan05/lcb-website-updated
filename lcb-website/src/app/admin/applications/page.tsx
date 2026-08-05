"use client";

import { useEffect, useState, useCallback } from "react";
import type { ApplicationsConfig } from "@/lib/admin";
import { errorFromResponse } from "@/lib/admin-error";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#4F9CEB]/50 ${
        checked ? "bg-[#4F9CEB]" : "bg-white/10"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function ApplicationsPage() {
  const [config, setConfig] = useState<ApplicationsConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/applications");
    const data = await res.json();
    setConfig(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error(await errorFromResponse(res));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (!config) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-[#4F9CEB]" />
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Applications</h1>
        <p className="mt-1 text-sm text-white/40">
          Toggle application windows and set Google Form links.
        </p>
      </div>

      {/* Campus Leads */}
      <Section
        title="Campus Lead Applications"
        description="Controls the 'Apply as a Campus Lead' button on the homepage."
        config={config.campusLeads}
        onChange={(val) => setConfig({ ...config, campusLeads: val })}
      />

      {/* Central Team */}
      <Section
        title="Central Team Applications"
        description="Controls the 'Apply in Central Team' button on the homepage."
        config={config.centralTeam}
        onChange={(val) => setConfig({ ...config, centralTeam: val })}
      />

      {/* Save */}
      {error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}
      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-xl border border-[#4F9CEB]/40 bg-[#4F9CEB] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#5BAAF0] disabled:opacity-50"
      >
        {saving ? "Saving…" : saved ? "✓ Saved" : "Save Changes"}
      </button>
    </div>
  );
}

function Section({
  title,
  description,
  config,
  onChange,
}: {
  title: string;
  description: string;
  config: { open: boolean; formUrl: string };
  onChange: (val: { open: boolean; formUrl: string }) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-white">{title}</p>
          <p className="mt-0.5 text-xs text-white/40">{description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-white/40">{config.open ? "Open" : "Closed"}</span>
          <Toggle
            checked={config.open}
            onChange={(val) => onChange({ ...config, open: val })}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">
          Google Form URL
        </label>
        <input
          type="url"
          value={config.formUrl}
          onChange={(e) => onChange({ ...config, formUrl: e.target.value })}
          placeholder="https://forms.gle/..."
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-[#4F9CEB]/50 focus:ring-1 focus:ring-[#4F9CEB]/30"
        />
        <p className="mt-1.5 text-xs text-white/30">
          Required when open. Visitors go directly to this URL.
        </p>
      </div>
    </div>
  );
}
