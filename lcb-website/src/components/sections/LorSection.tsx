"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Shield, X, ChevronRight, AlertTriangle } from "lucide-react";
import type { LorConfig } from "@/content/lor";

interface Props {
  config: Pick<LorConfig, "open" | "closedMessage" | "rules">;
}

export function LorSection({ config }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [agreed,    setAgreed]    = useState(false);
  const router = useRouter();

  function openModal()  { setModalOpen(true);  setAgreed(false); }
  function closeModal() { setModalOpen(false); setAgreed(false); }

  function handleProceed() {
    closeModal();
    router.push("/lor/apply");
  }

  return (
    <>
      {/* ── Section ───────────────────────────────────────── */}
      <section id="lor" className="relative py-16">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-56 w-[480px] rounded-full bg-amber-500/[0.04] blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/[0.14] bg-gradient-to-br from-amber-500/[0.05] via-transparent to-transparent p-8 sm:p-12">
            {/* Corner accent */}
            <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-bl-[100px] bg-amber-400/[0.05]" />
            {/* Dot grid */}
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(251,191,36,0.15) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              {/* Left: icon + text */}
              <div className="flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-500/25 bg-amber-500/[0.10]">
                  <FileText className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-xl font-bold text-white">Apply for LOR</h2>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        config.open
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-white/[0.08] text-white/40"
                      }`}
                    >
                      {config.open ? "Accepting Applications" : "Closed"}
                    </span>
                  </div>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/50">
                    Letter of Recommendation from LinkedIn Community Bangladesh leadership.
                    Available to outstanding active and former LCB members.
                  </p>
                </div>
              </div>

              {/* CTA button */}
              <button
                onClick={openModal}
                className="group flex shrink-0 items-center gap-2 self-start rounded-2xl border border-amber-500/30 bg-amber-500/[0.08] px-6 py-3 text-sm font-semibold text-amber-300 transition-all duration-200 hover:border-amber-400/50 hover:bg-amber-500/[0.15] hover:text-amber-200 sm:self-auto"
              >
                {config.open ? "Apply Now" : "View Details"}
                <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Modal ─────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Panel */}
          <div className="relative z-10 flex max-h-[92dvh] w-full max-w-2xl flex-col rounded-t-3xl sm:rounded-3xl border border-white/[0.08] bg-[#0d0d14] shadow-2xl">
            {/* Sticky header */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/[0.08]">
                  <FileText className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Letter of Recommendation</p>
                  <p className="text-[11px] text-white/35">LinkedIn Community Bangladesh</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/[0.06] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-5 p-6">
                {config.open ? (
                  <>
                    {/* Terms header */}
                    <div className="flex items-center gap-2.5">
                      <Shield className="h-4 w-4 text-amber-400/70" />
                      <p className="text-xs font-bold uppercase tracking-widest text-white/40">
                        Terms &amp; Conditions — Read Carefully
                      </p>
                    </div>

                    {/* Rules list */}
                    <div className="space-y-2.5">
                      {config.rules.map((rule, i) => (
                        <div
                          key={i}
                          className={`flex gap-3.5 rounded-xl p-4 ${
                            i === 0
                              ? "border border-red-500/25 bg-red-500/[0.07]"
                              : "border border-white/[0.06] bg-white/[0.02]"
                          }`}
                        >
                          {i === 0 ? (
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                          ) : (
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-[10px] font-bold text-white/40">
                              {i + 1}
                            </span>
                          )}
                          <p
                            className={`text-sm leading-relaxed ${
                              i === 0 ? "font-medium text-red-300/90" : "text-white/60"
                            }`}
                          >
                            {rule}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Agree checkbox */}
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-4 transition hover:border-white/[0.12]">
                      <button
                        type="button"
                        role="checkbox"
                        onClick={() => setAgreed((v) => !v)}
                        className={`relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                          agreed
                            ? "border-[#4F9CEB] bg-[#4F9CEB]"
                            : "border-white/25 bg-transparent"
                        }`}
                        aria-checked={agreed}
                      >
                        {agreed && (
                          <svg
                            className="h-3 w-3 text-white"
                            fill="none"
                            viewBox="0 0 12 12"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 6l3 3 6-6" />
                          </svg>
                        )}
                      </button>
                      <p className="text-sm leading-relaxed text-white/65">
                        I have read and fully understand all the terms and conditions above,
                        and I agree to abide by them.
                      </p>
                    </label>
                  </>
                ) : (
                  /* Closed state */
                  <div className="py-10 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04]">
                      <FileText className="h-7 w-7 text-white/25" />
                    </div>
                    <p className="text-base font-medium text-white/50">{config.closedMessage}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky footer actions */}
            <div className="shrink-0 border-t border-white/[0.06] p-5">
              {config.open ? (
                <div className="flex gap-3">
                  <button
                    disabled={!agreed}
                    onClick={handleProceed}
                    className="flex-1 rounded-xl bg-[#4F9CEB] py-3 text-sm font-bold text-white transition hover:bg-[#3d8bd6] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Proceed to Application →
                  </button>
                  <button
                    onClick={closeModal}
                    className="rounded-xl border border-white/[0.08] px-5 text-sm text-white/50 transition hover:border-white/20 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={closeModal}
                  className="w-full rounded-xl border border-white/[0.08] py-3 text-sm text-white/50 transition hover:border-white/20 hover:text-white"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
