import { NextResponse } from "next/server";
import { kvGet } from "@/lib/kv";

// Returns last 14 days of page-view counts.
// Protected by admin middleware (/api/admin/* requires auth cookie).
export async function GET() {
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
    return NextResponse.json(days);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
