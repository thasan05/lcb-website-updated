import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";
import type { NewsItem } from "@/content/news";

const KEY = "data:news";

export async function GET() {
  try {
    return NextResponse.json(await kvGet<NewsItem[]>(KEY));
  } catch {
    return NextResponse.json({ error: "Failed to read news" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const item: NewsItem = await request.json();
    const news = await kvGet<NewsItem[]>(KEY);
    if (item.featured) news.forEach((n) => { n.featured = false; });
    news.unshift(item);
    await kvSet(KEY, news);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to create news item" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updated: NewsItem = await request.json();
    let news = await kvGet<NewsItem[]>(KEY);
    if (updated.featured) {
      news = news.map((n) => ({ ...n, featured: n.id === updated.id }));
    }
    news = news.map((n) => (n.id === updated.id ? updated : n));
    await kvSet(KEY, news);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update news item" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const news = (await kvGet<NewsItem[]>(KEY)).filter((n) => n.id !== id);
    await kvSet(KEY, news);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete news item" }, { status: 500 });
  }
}
