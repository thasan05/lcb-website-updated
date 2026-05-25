"use client";

import { useEffect, useState, useCallback } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";

// ── Types ─────────────────────────────────────────────────────────────────────
type Social = { linkedin?: string; facebook?: string; website?: string };
type Member = {
  id: string;
  name: string;
  role: string;
  image?: string;
  bio?: string;
  social?: Social;
  university?: string;
  city?: string;
  company?: string;
  badges?: string[];
  achievements?: string[];
  featured?: boolean;
};

type CategoryMeta = {
  id: string;
  label: string;
  description: string;
  /** Extra fields shown in the form for this category */
  extraFields: ("university" | "city" | "company" | "achievements")[];
};

const CATEGORIES: CategoryMeta[] = [
  { id: "central",       label: "Central Team",   description: "Core central team members", extraFields: [] },
  { id: "campus-leads",  label: "Campus Leads",   description: "Campus lead representatives", extraFields: ["university", "city"] },
  { id: "heads",         label: "LCB Heads",      description: "Senior leadership team", extraFields: [] },
  { id: "professionals", label: "Professionals",  description: "Industry professionals", extraFields: ["company"] },
  { id: "initiatives",   label: "Initiatives",    description: "Initiative leads", extraFields: [] },
  { id: "star-awards",   label: "LCB Stars",      description: "Star award recipients", extraFields: ["university", "achievements"] },
];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const EMPTY_MEMBER: Omit<Member, "id"> = {
  name: "", role: "", image: "", bio: "",
  social: { linkedin: "", facebook: "", website: "" },
  university: "", city: "", company: "", badges: [], achievements: [], featured: false,
};

export default function TeamAdminPage() {
  const [activeCat, setActiveCat] = useState("central");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [form, setForm] = useState<Omit<Member, "id"> & { id?: string }>(EMPTY_MEMBER);
  const [badgeInput, setBadgeInput] = useState("");
  const [achievementInput, setAchievementInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async (catId: string) => {
    setLoading(true);
    const res = await fetch(`/api/admin/team?category=${catId}`);
    const data = await res.json();
    setMembers(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(activeCat); }, [activeCat, load]);

  const catMeta = CATEGORIES.find((c) => c.id === activeCat)!;

  function openNew() {
    setEditingMember(null);
    setForm({ ...EMPTY_MEMBER, social: { linkedin: "", facebook: "", website: "" }, badges: [], achievements: [] });
    setBadgeInput(""); setAchievementInput(""); setError("");
    setShowForm(true);
  }

  function openEdit(m: Member) {
    setEditingMember(m);
    setForm({
      ...m,
      social: { linkedin: m.social?.linkedin ?? "", facebook: m.social?.facebook ?? "", website: m.social?.website ?? "" },
      badges: m.badges ?? [],
      achievements: m.achievements ?? [],
    });
    setBadgeInput(""); setAchievementInput(""); setError("");
    setShowForm(true);
  }

  function closeForm() { setShowForm(false); setEditingMember(null); setError(""); }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm((f) => ({ ...f, image: url }));
    } catch (err) { setError("Upload failed: " + (err as Error).message); }
    finally { setUploading(false); }
  }

  async function handleSave() {
    if (!form.name || !form.role) { setError("Name and role are required."); return; }
    setSaving(true); setError("");
    try {
      const social: Social = {};
      if (form.social?.linkedin) social.linkedin = form.social.linkedin;
      if (form.social?.facebook) social.facebook = form.social.facebook;
      if (form.social?.website)  social.website  = form.social.website;

      const member: Member = {
        ...form,
        id: form.id || `${activeCat.slice(0,3)}-${slugify(form.name)}-${Date.now()}`,
        image:        form.image       || undefined,
        bio:          form.bio         || undefined,
        university:   form.university  || undefined,
        city:         form.city        || undefined,
        company:      form.company     || undefined,
        badges:       form.badges?.length ? form.badges : undefined,
        achievements: form.achievements?.length ? form.achievements : undefined,
        social:       Object.keys(social).length ? social : undefined,
        featured:     form.featured || undefined,
      } as Member;

      const method = editingMember ? "PUT" : "POST";
      const res = await fetch("/api/admin/team", {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: activeCat, member }),
      });
      if (!res.ok) throw new Error("Save failed");
      await load(activeCat);
      closeForm();
    } catch { setError("Save failed. Try again."); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this team member?")) return;
    setDeleting(id);
    await fetch("/api/admin/team", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: activeCat, memberId: id }),
    });
    await load(activeCat);
    setDeleting(null);
  }

  const filtered = search.trim()
    ? members.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.role.toLowerCase().includes(search.toLowerCase()))
    : members;

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Team</h1>
          <p className="mt-1 text-sm text-white/40">{members.length} members in {catMeta.label}</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 rounded-xl border border-[#4F9CEB]/40 bg-[#4F9CEB] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#5BAAF0]">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Member
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button key={cat.id} onClick={() => { setActiveCat(cat.id); setSearch(""); }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${activeCat === cat.id ? "bg-[#4F9CEB] text-white" : "bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white"}`}>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder={`Search ${catMeta.label}…`}
        className="w-full max-w-sm rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-[#4F9CEB]/50" />

      {/* Member list */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-[#4F9CEB]" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="rounded-xl border border-white/[0.05] bg-white/[0.02] py-10 text-center text-sm text-white/25">No members yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {filtered.map((m) => (
            <MemberRow key={m.id} member={m} onEdit={openEdit} onDelete={handleDelete} deleting={deleting} />
          ))}
        </div>
      )}

      {/* Slide-in form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative ml-auto flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-white/[0.08] bg-[#0d0d14]">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <h2 className="font-semibold text-white">{editingMember ? "Edit Member" : `Add to ${catMeta.label}`}</h2>
              <button onClick={closeForm} className="text-white/40 hover:text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 space-y-4 p-6">
              {/* Photo */}
              <Field label="Photo">
                <div className="flex items-center gap-3">
                  {form.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-lg text-white/20">
                      {form.name ? form.name.split(" ").slice(0,2).map(n=>n[0]).join("").toUpperCase() : "?"}
                    </div>
                  )}
                  <div className="flex-1 space-y-1.5">
                    <input type="text" value={form.image ?? ""} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Paste image URL" className={inputCls} />
                    <label className="flex cursor-pointer items-center gap-1.5 text-xs text-[#4F9CEB] hover:text-[#7BB8F0]">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" /></svg>
                      {uploading ? "Uploading…" : "Upload photo"}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
                    </label>
                  </div>
                </div>
              </Field>

              {/* Name + Role */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name *">
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className={inputCls} />
                </Field>
                <Field label="Role *">
                  <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Title / role" className={inputCls} />
                </Field>
              </div>

              {/* Bio */}
              <Field label="Bio">
                <textarea value={form.bio ?? ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={2} placeholder="Short bio (optional)" className={inputCls} />
              </Field>

              {/* Category-specific fields */}
              {catMeta.extraFields.includes("university") && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="University">
                    <input type="text" value={form.university ?? ""} onChange={(e) => setForm({ ...form, university: e.target.value })} placeholder="e.g. NSU" className={inputCls} />
                  </Field>
                  <Field label="City">
                    <input type="text" value={form.city ?? ""} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="e.g. Dhaka" className={inputCls} />
                  </Field>
                </div>
              )}
              {catMeta.extraFields.includes("company") && (
                <Field label="Company">
                  <input type="text" value={form.company ?? ""} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company / organisation" className={inputCls} />
                </Field>
              )}

              {/* Social links */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">Social & Portfolio Links</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <LinkedInIcon className="h-4 w-4 shrink-0 text-[#0A66C2]" />
                    <input type="url" value={form.social?.linkedin ?? ""} onChange={(e) => setForm({ ...form, social: { ...form.social, linkedin: e.target.value } })} placeholder="LinkedIn profile URL" className={inputCls} />
                  </div>
                  <div className="flex items-center gap-2">
                    <FacebookIcon className="h-4 w-4 shrink-0 text-[#1877F2]" />
                    <input type="url" value={form.social?.facebook ?? ""} onChange={(e) => setForm({ ...form, social: { ...form.social, facebook: e.target.value } })} placeholder="Facebook profile URL" className={inputCls} />
                  </div>
                  <div className="flex items-center gap-2">
                    <GlobeIcon className="h-4 w-4 shrink-0 text-white/40" />
                    <input type="url" value={form.social?.website ?? ""} onChange={(e) => setForm({ ...form, social: { ...form.social, website: e.target.value } })} placeholder="Portfolio / website URL" className={inputCls} />
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">Badges</p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(form.badges ?? []).map((badge, i) => (
                    <span key={i} className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-xs text-white/70">
                      {badge}
                      <button onClick={() => setForm({ ...form, badges: form.badges?.filter((_, j) => j !== i) })} className="text-white/30 hover:text-red-400">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={badgeInput} onChange={(e) => setBadgeInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && badgeInput.trim()) { setForm({ ...form, badges: [...(form.badges ?? []), badgeInput.trim()] }); setBadgeInput(""); }}} placeholder="Add badge, press Enter" className={inputCls} />
                </div>
              </div>

              {/* Achievements (star awards) */}
              {catMeta.extraFields.includes("achievements") && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">Achievements</p>
                  <ul className="mb-2 space-y-1">
                    {(form.achievements ?? []).map((a, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-white/60">
                        <span className="flex-1">• {a}</span>
                        <button onClick={() => setForm({ ...form, achievements: form.achievements?.filter((_, j) => j !== i) })} className="text-white/30 hover:text-red-400 text-xs">×</button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <input type="text" value={achievementInput} onChange={(e) => setAchievementInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && achievementInput.trim()) { setForm({ ...form, achievements: [...(form.achievements ?? []), achievementInput.trim()] }); setAchievementInput(""); }}} placeholder="Add achievement, press Enter" className={inputCls} />
                  </div>
                </div>
              )}

              {/* Featured toggle */}
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                <input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-[#4F9CEB]" />
                <div>
                  <p className="text-sm text-white">Featured member</p>
                  <p className="text-xs text-white/35">Shows ✦ star badge + visual boost on card</p>
                </div>
              </label>

              {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
            </div>

            <div className="border-t border-white/[0.06] p-6">
              <button onClick={handleSave} disabled={saving} className="w-full rounded-xl border border-[#4F9CEB]/40 bg-[#4F9CEB] py-3 text-sm font-medium text-white transition hover:bg-[#5BAAF0] disabled:opacity-50">
                {saving ? "Saving…" : editingMember ? "Save Changes" : "Add Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Member row ─────────────────────────────────────────────────────────────────
function MemberRow({ member, onEdit, onDelete, deleting }: { member: Member; onEdit: (m: Member) => void; onDelete: (id: string) => void; deleting: string | null }) {
  const hasSocial = member.social && Object.values(member.social).some(Boolean);
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
      {member.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={member.image} alt={member.name} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4F9CEB]/20 text-xs font-bold text-[#4F9CEB]">
          {member.name.split(" ").slice(0,2).map(n=>n[0]).join("").toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-white">{member.name}</p>
          {member.featured && <span className="text-amber-400 text-xs">✦</span>}
        </div>
        <p className="truncate text-xs text-white/40">{member.role}{member.university ? ` · ${member.university}` : ""}{member.company ? ` · ${member.company}` : ""}</p>
      </div>

      {/* Social link icons */}
      {hasSocial && (
        <div className="hidden shrink-0 items-center gap-1 sm:flex">
          {member.social?.linkedin && <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" className="flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.08] text-white/30 hover:border-[#0A66C2]/40 hover:text-[#0A66C2] transition"><LinkedInIcon className="h-3 w-3" /></a>}
          {member.social?.facebook && <a href={member.social.facebook} target="_blank" rel="noopener noreferrer" className="flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.08] text-white/30 hover:border-[#1877F2]/40 hover:text-[#1877F2] transition"><FacebookIcon className="h-3 w-3" /></a>}
          {member.social?.website  && <a href={member.social.website}  target="_blank" rel="noopener noreferrer" className="flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.08] text-white/30 hover:border-white/30 hover:text-white transition"><GlobeIcon className="h-3 w-3" /></a>}
        </div>
      )}

      <div className="flex shrink-0 items-center gap-1">
        <button onClick={() => onEdit(member)} className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/[0.06] hover:text-white">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </button>
        <button onClick={() => onDelete(member.id)} disabled={deleting === member.id} className="rounded-lg p-1.5 text-white/40 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">{label}</label>
      {children}
    </div>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}
function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

const inputCls = "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-[#4F9CEB]/50 focus:ring-1 focus:ring-[#4F9CEB]/30";
