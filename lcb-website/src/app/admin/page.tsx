import Link from "next/link";
import { kvGet } from "@/lib/kv";
import { getApplicationsConfig } from "@/lib/admin";
import type { NewsItem } from "@/content/news";
import type { Event } from "@/content/events";
import type { Article } from "@/content/articles";

export const dynamic = "force-dynamic";

async function getAnalytics(): Promise<{ date: string; label: string; views: number }[]> {
  try {
    const days: { date: string; label: string; views: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const date  = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const views = await kvGet<number>(`analytics:views:${date}`).catch(() => 0);
      days.push({ date, label, views: views ?? 0 });
    }
    return days;
  } catch { return []; }
}

export default async function AdminDashboardPage() {
  const [news, events, apps, gallery, analytics, articles] = await Promise.all([
    kvGet<NewsItem[]>("data:news"),
    kvGet<Event[]>("data:events"),
    getApplicationsConfig(),
    kvGet<{ images: unknown[] }>("data:gallery-manifest"),
    getAnalytics(),
    kvGet<Article[]>("data:articles").catch(() => [] as Article[]),
  ]);

  const upcomingCount = events.filter((e) => e.status === "upcoming").length;
  const featuredNews  = news.find((n) => n.featured);
  const appsOpen      = (apps.campusLeads.open ? 1 : 0) + (apps.centralTeam.open ? 1 : 0);

  const totalViews = analytics.reduce((s, d) => s + d.views, 0);
  const todayViews = analytics[analytics.length - 1]?.views ?? 0;
  const maxViews   = Math.max(...analytics.map((d) => d.views), 1);

  const liveArticles = (articles ?? []) as Article[];

  const statsCards = [
    { label: "News Items",        value: news.length,            href: "/admin/newsroom" },
    { label: "Upcoming Events",   value: upcomingCount,          href: "/admin/events" },
    { label: "Forum Articles",    value: liveArticles.length,    href: "/admin/articles" },
    { label: "Applications Open", value: `${appsOpen}/2`,        href: "/admin/applications" },
  ];

  const quickActions = [
    { href: "/admin/newsroom",     label: "Add News Item",       icon: "📰" },
    { href: "/admin/events",       label: "Add Event",           icon: "📅" },
    { href: "/admin/articles",     label: "Add Forum Article",   icon: "✍️" },
    { href: "/admin/applications", label: "Toggle Applications", icon: "📋" },
  ];

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-white/40">Overview of your website content</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 transition-all hover:border-white/[0.12] hover:bg-white/[0.05]"
          >
            <p className="text-3xl font-bold text-white group-hover:text-[#4F9CEB]">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-white/40">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Analytics — page views chart */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Page Views</h2>
            <p className="mt-0.5 text-xs text-white/40">Last 14 days</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{totalViews.toLocaleString()}</p>
            <p className="text-xs text-white/40">
              {todayViews} today
            </p>
          </div>
        </div>
        {/* Bar chart */}
        <div className="flex h-24 items-end gap-1">
          {analytics.map((day) => {
            const heightPct = maxViews > 0 ? (day.views / maxViews) * 100 : 0;
            const isToday   = day.date === new Date().toISOString().slice(0, 10);
            return (
              <div key={day.date} className="group relative flex flex-1 flex-col items-center gap-1">
                {/* Tooltip */}
                <div className="pointer-events-none absolute bottom-full mb-1 hidden rounded bg-[#1a1a2e] px-2 py-1 text-[10px] text-white/80 group-hover:block whitespace-nowrap z-10">
                  {day.label}: {day.views}
                </div>
                <div
                  className={`w-full rounded-sm transition-all ${
                    isToday ? "bg-[#4F9CEB]" : "bg-white/[0.12] group-hover:bg-white/[0.20]"
                  }`}
                  style={{ height: `${Math.max(heightPct, day.views > 0 ? 4 : 1)}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-white/25">
          <span>{analytics[0]?.label}</span>
          <span>Today</span>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-white/30">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white/70 transition-all hover:border-[#4F9CEB]/30 hover:bg-[#4F9CEB]/10 hover:text-white"
            >
              <span>{action.icon}</span>
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Featured news */}
      <div>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-white/30">
          Featured News
        </h2>
        {featuredNews ? (
          <div className="rounded-2xl border border-[#4F9CEB]/20 bg-[#4F9CEB]/5 p-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#4F9CEB]/20">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4F9CEB]" />
              </span>
              <div>
                <p className="text-sm font-medium text-white">{featuredNews.title}</p>
                <p className="mt-1 text-xs text-white/40">
                  {featuredNews.dateLabel} · {featuredNews.category}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/30">
            No featured news set. Mark one item as featured in the Newsroom.
          </p>
        )}
      </div>

      {/* Applications status */}
      <div>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-white/30">
          Applications Status
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Campus Leads", config: apps.campusLeads },
            { label: "Central Team", config: apps.centralTeam },
          ].map(({ label, config }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  config.open
                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                    : "bg-white/20"
                }`}
              />
              <div>
                <p className="text-sm text-white/80">{label}</p>
                <p className="text-xs text-white/30">{config.open ? "Open" : "Closed"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
