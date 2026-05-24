import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";

const CATEGORY_KEYS: Record<string, string> = {
  central:        "team:central",
  "campus-leads": "team:campus-leads",
  heads:          "team:lcb-heads",
  professionals:  "team:professionals",
  initiatives:    "team:initiatives",
  "star-awards":  "team:star-awards",
};

function kvKeyFor(categoryId: string): string {
  const key = CATEGORY_KEYS[categoryId];
  if (!key) throw new Error(`Unknown category: ${categoryId}`);
  return key;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category");

    if (categoryId) {
      return NextResponse.json(await kvGet(kvKeyFor(categoryId)));
    }

    const all: Record<string, unknown> = {};
    for (const [id, key] of Object.entries(CATEGORY_KEYS)) {
      all[id] = await kvGet(key);
    }
    return NextResponse.json(all);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { categoryId, member } = await request.json();
    const key = kvKeyFor(categoryId);
    const members = await kvGet<unknown[]>(key);
    members.unshift(member);
    await kvSet(key, members);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { categoryId, member } = await request.json();
    const key = kvKeyFor(categoryId);
    const members = (await kvGet<Array<{ id: string }>>(key)).map((m) =>
      m.id === member.id ? member : m
    );
    await kvSet(key, members);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { categoryId, memberId } = await request.json();
    const key = kvKeyFor(categoryId);
    const members = (await kvGet<Array<{ id: string }>>(key)).filter(
      (m) => m.id !== memberId
    );
    await kvSet(key, members);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
