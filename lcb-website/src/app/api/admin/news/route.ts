import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/admin";
import type { NewsItem } from "@/content/news";

export async function GET() {
  try {
    const news = readJsonFile<NewsItem[]>("news.json");
    return NextResponse.json(news);
  } catch {
    return NextResponse.json({ error: "Failed to read news" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const item: NewsItem = await request.json();
    const news = readJsonFile<NewsItem[]>("news.json");

    // If new item is featured, unflag previous featured
    if (item.featured) {
      news.forEach((n) => { n.featured = false; });
    }

    // Prepend (newest first)
    news.unshift(item);
    writeJsonFile("news.json", news);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to create news item" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updated: NewsItem = await request.json();
    let news = readJsonFile<NewsItem[]>("news.json");

    // If updated item is featured, unflag all others
    if (updated.featured) {
      news = news.map((n) => ({ ...n, featured: n.id === updated.id ? true : false }));
    }

    news = news.map((n) => (n.id === updated.id ? updated : n));
    writeJsonFile("news.json", news);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update news item" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    let news = readJsonFile<NewsItem[]>("news.json");
    news = news.filter((n) => n.id !== id);
    writeJsonFile("news.json", news);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete news item" }, { status: 500 });
  }
}
