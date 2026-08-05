"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileText } from "lucide-react";
import type { LorConfig } from "@/content/lor";

interface Props {
  config: LorConfig;
}

export function LorApplyForm({ config }: Props) {
  const [answers,    setAnswers]    = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [error,      setError]      = useState("");

  if (!config.open) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04]">
            <FileText className="h-7 w-7 text-white/30" />
          </div>
          <h2 className="text-xl font-bold text-white">Applications Closed</h2>
          <p className="mt-2 text-sm text-white/50">{config.closedMessage}</p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-5 py-2.5 text-sm text-white/60 transition hover:border-white/20 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to site
          </Link>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/[0.08]">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Application Submitted!</h2>
          <p className="mt-2 max-w-sm text-sm text-white/50">
            Your LOR application has been received. We will review it and get back to you
            within 7–14 business days.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-5 py-2.5 text-sm text-white/60 transition hover:border-white/20 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to site
          </Link>
        </div>
      </main>
    );
  }

  const sorted = [...config.questions].sort((a, b) => a.order - b.order);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/lor/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      setSubmitted(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-[#4F9CEB]/40 focus:bg-white/[0.06]";
  const labelCls = "block text-xs font-medium uppercase tracking-wider text-white/40 mb-1.5";

  return (
    <main className="min-h-screen px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Back link */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-white/40 transition hover:text-white/70"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to site
        </Link>

        {/* Header */}
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/[0.08]">
            <FileText className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">LOR Application</h1>
            <p className="mt-1 text-sm text-white/45">
              LinkedIn Community Bangladesh — Letter of Recommendation
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {sorted.map((q) => {
            const fieldId = `lor-${q.id}`;
            return (
            <div key={q.id}>
              <label className={labelCls} htmlFor={q.type === "radio" ? undefined : fieldId}>
                {q.label}
                {q.required && <span className="ml-1 text-red-400/70">*</span>}
              </label>

              {q.type === "textarea" ? (
                <textarea
                  id={fieldId}
                  className={inputCls + " resize-none"}
                  rows={4}
                  placeholder={q.placeholder}
                  required={q.required}
                  value={answers[q.id] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                />
              ) : q.type === "select" ? (
                <select
                  id={fieldId}
                  className={inputCls}
                  required={q.required}
                  value={answers[q.id] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                >
                  <option value="">Select…</option>
                  {(q.options ?? []).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : q.type === "radio" ? (
                <div className="space-y-2" role="group" aria-labelledby={`${fieldId}-legend`}>
                  <span id={`${fieldId}-legend`} className="sr-only">{q.label}</span>
                  {(q.options ?? []).map((opt) => (
                    <label key={opt} className="flex cursor-pointer items-center gap-2.5">
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        required={q.required}
                        checked={answers[q.id] === opt}
                        onChange={() =>
                          setAnswers((prev) => ({ ...prev, [q.id]: opt }))
                        }
                        className="accent-[#4F9CEB]"
                      />
                      <span className="text-sm text-white/70">{opt}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  id={fieldId}
                  type={q.id === "email" ? "email" : "text"}
                  className={inputCls}
                  placeholder={q.placeholder}
                  required={q.required}
                  value={answers[q.id] ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }
                />
              )}
            </div>
            );
          })}

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-[#4F9CEB] py-3.5 text-sm font-bold text-white transition hover:bg-[#3d8bd6] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
