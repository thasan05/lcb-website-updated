import type { MetadataRoute } from "next";
import { siteConfig } from "@/content/site";
import { kvGet } from "@/lib/kv";
import type { Article } from "@/content/articles";
import type { Magazine } from "@/content/magazines";
import { news as staticNews, type NewsItem } from "@/content/news";

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/forum", changeFrequency: "daily", priority: 0.8 },
  { path: "/magazine", changeFrequency: "weekly", priority: 0.7 },
  { path: "/lor/apply", changeFrequency: "monthly", priority: 0.5 },
  { path: "/shout", changeFrequency: "monthly", priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${siteConfig.url}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const [articles, magazines, liveNews] = await Promise.all([
    kvGet<Article[]>("data:articles").catch(() => [] as Article[]),
    kvGet<Magazine[]>("data:magazines").catch(() => [] as Magazine[]),
    kvGet<NewsItem[]>("data:news").catch(() => [] as NewsItem[]),
  ]);

  const articleEntries: MetadataRoute.Sitemap = (articles ?? [])
    .filter((a) => a.published)
    .map((a) => ({
      url: `${siteConfig.url}/forum/${a.id}`,
      lastModified: new Date(a.date),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  const magazineEntries: MetadataRoute.Sitemap = (magazines ?? [])
    .filter((m) => m.published)
    .map((m) => ({
      url: `${siteConfig.url}/magazine/${m.id}`,
      lastModified: new Date(m.uploadedAt),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  const allNews = liveNews && liveNews.length > 0 ? liveNews : staticNews;
  const newsEntries: MetadataRoute.Sitemap = allNews
    .filter((n) => n.published !== false)
    .map((n) => ({
      url: `${siteConfig.url}/news/${n.id}`,
      lastModified: new Date(n.date),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [...staticEntries, ...articleEntries, ...magazineEntries, ...newsEntries];
}
