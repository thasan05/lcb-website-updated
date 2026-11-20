"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { StructureData } from "@/data/structure-data";

interface Props {
  data: StructureData;
}

export function StructureDashboard({ data }: Props) {
  const [unisExpanded, setUnisExpanded] = useState(false);
  const [animatedTotal, setAnimatedTotal] = useState(0);

  const totalPeople = 2 + data.n_central + data.n_cl;
  const founderRoles = data.founder.reduce((acc, curr) => acc + curr[1], 0);

  const parts = [
    { label: "Founder", count: 1, color: "var(--ro, #FB7185)" },
    { label: "Mentor", count: 1, color: "#94A3B8" },
    { label: "Central Team", count: data.n_central, color: "var(--blue, #3B8EF0)" },
    { label: "Campus Leads", count: data.n_cl, color: "var(--am, #F5B84B)" },
  ];

  // SVG Ring Chart calculations
  const circumference = 2 * Math.PI * 70; // r = 70
  const gap = 3;

  // Animate total counter on mount
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1200;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setAnimatedTotal(Math.round(totalPeople * ease));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [totalPeople]);

  const maxDeptMembers = Math.max(...data.depts.map((d) => d[3]), 1);
  const maxUniCount = data.unis.length > 0 ? Math.max(...data.unis.map((u) => u[1]), 1) : 1;
  const displayedUnis = unisExpanded ? data.unis : data.unis.slice(0, 12);

  // Calculate SVG stroke dashes
  let currentOffset = 0;
  const ringSlices = parts.map((part) => {
    const sliceLen = Math.max((part.count / totalPeople) * circumference - gap, 2);
    const strokeDashoffset = -currentOffset;
    currentOffset += (part.count / totalPeople) * circumference;
    return {
      ...part,
      strokeDasharray: `${sliceLen} ${circumference}`,
      strokeDashoffset,
    };
  });

  return (
    <div className="relative min-h-screen bg-[#040614] text-[#EAF0FF] selection:bg-blue-500/30 selection:text-white pt-24 pb-20">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute -top-[10%] left-[5%] h-[500px] w-[700px] rounded-full opacity-30 blur-[130px]"
          style={{ background: "radial-gradient(circle, #3B8EF0, transparent 70%)" }}
        />
        <div
          className="absolute top-[8%] right-[5%] h-[480px] w-[650px] rounded-full opacity-25 blur-[140px]"
          style={{ background: "radial-gradient(circle, #8B5CF6, transparent 70%)" }}
        />
        <div
          className="absolute bottom-[5%] left-[30%] h-[450px] w-[600px] rounded-full opacity-20 blur-[140px]"
          style={{ background: "radial-gradient(circle, #22D3EE, transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb / Back link */}
        <div className="mb-6 flex items-center text-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-white/70 backdrop-blur-md transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.1fr_1fr] mb-8">
          <div>
            <span className="inline-block rounded-full border border-white/10 bg-white/[0.045] px-3.5 py-1 text-xs font-medium text-[#94A0BF] mb-4 backdrop-blur-sm">
              Last Updated: {data.lastUpdated}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white leading-[1.1]">
              Organizational Hierarchy of LCB
            </h1>
            <p className="mt-4 max-w-xl text-base sm:text-lg leading-relaxed text-[#94A0BF]">
              One view of who leads LCB, how the teams are organised, and how many people sit in each part.
            </p>
          </div>

          {/* Donut Ring Chart */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-[320px] aspect-square">
              <svg
                viewBox="0 0 180 180"
                role="img"
                aria-label={`${totalPeople} people in the LCB family`}
                className="w-full h-full -rotate-90 overflow-visible"
              >
                {/* Background Ring */}
                <circle
                  cx="90"
                  cy="90"
                  r="70"
                  fill="none"
                  stroke="rgba(255,255,255,0.07)"
                  strokeWidth="15"
                />
                {/* Colored Slices */}
                {ringSlices.map((slice, i) => (
                  <circle
                    key={i}
                    cx="90"
                    cy="90"
                    r="70"
                    fill="none"
                    stroke={slice.color}
                    strokeWidth="15"
                    strokeLinecap="round"
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                  />
                ))}
              </svg>

              {/* Center Counter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <span className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white leading-none">
                  {animatedTotal}
                </span>
                <span className="mt-2 text-xs font-medium text-[#94A0BF] max-w-[130px] leading-tight">
                  people in the LCB family
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {parts.map((p, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-white/[0.045] p-3.5 backdrop-blur-md transition-colors hover:border-white/20 hover:bg-white/[0.07]"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: p.color }}
                />
                <span className="text-2xl font-extrabold text-white tracking-tight">
                  {p.count}
                </span>
              </div>
              <span className="block mt-1 text-xs text-[#94A0BF] font-medium truncate">
                {p.label}
              </span>
            </div>
          ))}
        </div>

        {/* Facts Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
          {[
            { value: data.depts.length, label: "central departments" },
            { value: data.n_uni, label: "universities with a campus lead" },
            { value: data.n_ini, label: "initiatives" },
            { value: data.n_roles, label: `initiative roles held by ${data.n_people} people` },
          ].map((fact, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-md"
            >
              <span className="block text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#3B8EF0] to-[#22D3EE] bg-clip-text text-transparent">
                {fact.value}
              </span>
              <span className="block mt-1 text-xs text-[#94A0BF] leading-snug">
                {fact.label}
              </span>
            </div>
          ))}
        </div>

        {/* Visual Org Tree */}
        <div className="mb-14">
          {/* Founder Node */}
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-3.5 rounded-full border border-rose-500/60 bg-white/[0.05] p-2 pr-5 backdrop-blur-md shadow-[0_0_36px_rgba(251,113,133,0.22)]">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FB7185] to-[#8B5CF6] text-sm font-extrabold text-white">
                AR
              </span>
              <div className="text-left">
                <span className="block text-sm font-bold text-white">Altaf Hossain Raju</span>
                <span className="block text-xs text-[#94A0BF]">Founder</span>
              </div>
            </div>

            {/* Connecting Stem */}
            <div className="h-8 w-0.5 bg-gradient-to-b from-[#FB7185] to-[#3B8EF0]" />
          </div>

          {/* Children Row */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 border-l-2 md:border-l-0 md:border-t-2 border-[#3B8EF0] pl-6 md:pl-0 md:pt-8 md:shadow-[0_-8px_24px_-12px_#3B8EF0]">
            {/* 1. Mentor */}
            <div className="relative">
              <div className="hidden md:block absolute left-1/2 -top-8 w-0.5 h-8 bg-[#3B8EF0]" />
              <div className="md:hidden absolute -left-6 top-1/2 w-6 h-0.5 bg-[#3B8EF0]" />
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.045] p-2 pr-4 backdrop-blur-md">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#334155] text-xs font-extrabold text-white">
                  ZU
                </span>
                <div className="text-left min-w-0">
                  <span className="block text-sm font-bold text-white truncate">
                    Mohammed Zia Uddin
                  </span>
                  <span className="block text-xs text-[#94A0BF] line-clamp-2 leading-tight">
                    Mentor. Supply Director, Bangladesh–Sri Lanka cluster, Reckitt Benckiser
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Central Team Link */}
            <div className="relative">
              <div className="hidden md:block absolute left-1/2 -top-8 w-0.5 h-8 bg-[#3B8EF0]" />
              <div className="md:hidden absolute -left-6 top-1/2 w-6 h-0.5 bg-[#3B8EF0]" />
              <a
                href="#central"
                className="group flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.045] p-2 pr-4 backdrop-blur-md transition-all duration-300 hover:border-[#22D3EE] hover:bg-white/[0.08]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3B8EF0] to-[#22D3EE] text-sm font-extrabold text-white shadow-md">
                  {data.n_central}
                </span>
                <div className="text-left min-w-0">
                  <span className="block text-sm font-bold text-white group-hover:text-[#22D3EE] transition-colors">
                    Central Team
                  </span>
                  <span className="block text-xs text-[#94A0BF] truncate">
                    {data.depts.length} departments, each with an acting head
                  </span>
                </div>
              </a>
            </div>

            {/* 3. Campus Lead Network Link */}
            <div className="relative">
              <div className="hidden md:block absolute left-1/2 -top-8 w-0.5 h-8 bg-[#3B8EF0]" />
              <div className="md:hidden absolute -left-6 top-1/2 w-6 h-0.5 bg-[#3B8EF0]" />
              <a
                href="#campus"
                className="group flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.045] p-2 pr-4 backdrop-blur-md transition-all duration-300 hover:border-[#F5B84B] hover:bg-white/[0.08]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F5B84B] to-[#FF8A5B] text-sm font-extrabold text-black font-black shadow-md">
                  {data.n_cl}
                </span>
                <div className="text-left min-w-0">
                  <span className="block text-sm font-bold text-white group-hover:text-[#F5B84B] transition-colors">
                    Campus Lead network
                  </span>
                  <span className="block text-xs text-[#94A0BF] truncate">
                    Spread across {data.n_uni} universities and colleges
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Central Team Departments Section */}
        <section id="central" className="mb-14 scroll-mt-24">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Central Team departments
            </h2>
            <p className="mt-1.5 text-sm text-[#94A0BF]">
              Each department has an acting head. Open one to see the initiatives it supervises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {data.depts.map((dept, index) => {
              const [name, head, designation, members, initiatives] = dept;
              const iniCount = initiatives.length;
              const barPercent = Math.min(Math.round((members / maxDeptMembers) * 100), 100);

              return (
                <details
                  key={index}
                  className="group rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-md transition-all duration-300 open:border-blue-500/60 open:bg-white/[0.07]"
                >
                  <summary className="cursor-pointer list-none p-4 select-none">
                    <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 items-start">
                      {/* Department Name */}
                      <span className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                        {name}
                      </span>
                      {/* Members Count Badge */}
                      <div className="row-span-2 text-right">
                        <span className="text-2xl font-black text-[#22D3EE] leading-none block">
                          {members}
                        </span>
                        <span className="text-[11px] text-[#94A0BF] block mt-0.5">
                          {iniCount} {iniCount === 1 ? "initiative" : "initiatives"}
                        </span>
                      </div>
                      {/* Head and Designation */}
                      <span className="text-xs text-[#94A0BF] truncate">
                        {head}, {designation.split(",")[0]}
                      </span>
                      {/* Department relative size bar */}
                      <div className="col-span-2 h-1.5 w-full rounded-full bg-white/[0.08] mt-2.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#3B8EF0] to-[#22D3EE]"
                          style={{ width: `${barPercent}%` }}
                        />
                      </div>
                    </div>
                  </summary>

                  {/* Accordion Initiatives List */}
                  <div className="px-4 pb-4 pt-1">
                    {iniCount > 0 ? (
                      <ul className="space-y-1.5 border-t border-white/10 pt-2.5 text-xs">
                        {initiatives.map((ini, iIdx) => (
                          <li
                            key={iIdx}
                            className="flex items-center justify-between gap-2 py-1 text-white/80"
                          >
                            <span className="truncate">{ini[0]}</span>
                            <span className="shrink-0 font-medium text-[#8B5CF6]">
                              {ini[1]} roles
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="border-t border-white/10 pt-2.5 text-xs text-[#94A0BF]">
                        No initiatives supervised
                      </p>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        </section>

        {/* Two Columns: Campus Leads & Founder-Led Initiatives */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 items-start">
          {/* Campus Leads Column */}
          <section
            id="campus"
            className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 sm:p-7 backdrop-blur-md scroll-mt-24"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Campus Leads</h2>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#F5B84B]">
                {data.n_cl}
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-[#94A0BF]">
              Leads per university, {data.n_uni} in total
            </p>

            {/* Universities Progress List */}
            <div className="mt-5 space-y-2.5">
              {displayedUnis.map((uni, idx) => {
                const [uniName, count] = uni;
                const widthPercent = Math.min(Math.round((count / maxUniCount) * 100), 100);

                return (
                  <div key={idx} className="group">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span
                        className="truncate text-white/85 font-medium group-hover:text-white transition-colors"
                        title={uniName}
                      >
                        {uniName}
                      </span>
                      <span className="font-bold text-[#F5B84B] shrink-0">{count}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/[0.08] mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#F5B84B] to-[#FF8A5B] transition-all duration-500"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Toggle show all */}
            {data.unis.length > 12 && (
              <button
                type="button"
                onClick={() => setUnisExpanded(!unisExpanded)}
                className="mt-5 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-white transition-all hover:border-[#F5B84B]/50 hover:bg-white/[0.09]"
                aria-expanded={unisExpanded}
              >
                {unisExpanded ? "Show fewer" : `Show all ${data.n_uni}`}
              </button>
            )}
          </section>

          {/* Founder-Led Initiatives Column */}
          <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 sm:p-7 backdrop-blur-md">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Founder-led initiatives</h2>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#FB7185]">
                {data.founder.length}
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-[#94A0BF]">
              {founderRoles} roles, reporting straight to the Founder
            </p>

            {/* Initiative Chips */}
            <div className="mt-5 grid grid-cols-1 gap-2.5">
              {data.founder.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 rounded-xl border border-rose-500/25 bg-rose-500/[0.07] px-3.5 py-2.5 text-xs sm:text-sm backdrop-blur-sm transition-colors hover:border-rose-400/40 hover:bg-rose-500/[0.12]"
                >
                  <span className="text-white/90 font-medium truncate">{item[0]}</span>
                  <span className="font-bold text-[#FB7185] shrink-0">{item[1]}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Monthly Disclaimer / Policy Note */}
        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-[#94A0BF] leading-relaxed max-w-3xl">
          <p>
            LinkedIn Community Bangladesh reserves the right to modify this organizational hierarchy without any prior notice. We update this monthly. For any queries, please reach out to us via email.
          </p>
        </div>
      </div>
    </div>
  );
}
