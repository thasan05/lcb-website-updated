"use client";

import Link from "next/link";
import { GitFork, ChevronRight, Users, Building2, GraduationCap } from "lucide-react";

export function StructureSection() {
  return (
    <section id="structure" className="relative py-12 sm:py-16">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-60 w-[520px] rounded-full bg-blue-500/[0.05] blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-blue-500/[0.18] bg-gradient-to-br from-blue-500/[0.06] via-transparent to-transparent p-8 sm:p-12">
          {/* Corner accent */}
          <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-bl-[110px] bg-blue-400/[0.05]" />

          {/* Subtle dot pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(59,142,240,0.18) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Left Column: Icon + Text + Metric Pills */}
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/25 bg-blue-500/[0.10]">
                <GitFork className="h-6 w-6 text-blue-400" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Organizational Hierarchy & Headcount
                  </h2>
                </div>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">
                  A transparent breakdown of LinkedIn Community Bangladesh leadership, Central Team departments,
                  initiatives, and nationwide Campus Leads across 65+ universities and institutions.
                </p>

                {/* Quick stats pills */}
                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/80">
                    <Users className="h-3 w-3 text-blue-400" />
                    <span>270+ Total Members</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/80">
                    <Building2 className="h-3 w-3 text-cyan-400" />
                    <span>13 Central Departments</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/80">
                    <GraduationCap className="h-3 w-3 text-amber-400" />
                    <span>65+ Universities</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: CTA */}
            <div className="flex shrink-0">
              <Link
                href="/structure"
                className="group flex items-center gap-2 rounded-2xl border border-blue-500/30 bg-blue-500/[0.10] px-6 py-3.5 text-sm font-semibold text-blue-300 backdrop-blur-sm transition-all duration-200 hover:border-blue-400/60 hover:bg-blue-500/[0.20] hover:text-white"
              >
                <span>View Full Hierarchy</span>
                <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
