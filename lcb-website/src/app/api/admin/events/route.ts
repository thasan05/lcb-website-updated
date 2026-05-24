import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";
import type { Event } from "@/content/events";

const KEY = "data:events";

export async function GET() {
  try {
    return NextResponse.json(await kvGet<Event[]>(KEY));
  } catch {
    return NextResponse.json({ error: "Failed to read events" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const item: Event = await request.json();
    const events = await kvGet<Event[]>(KEY);
    events.unshift(item);
    await kvSet(KEY, events);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updated: Event = await request.json();
    const events = (await kvGet<Event[]>(KEY)).map((e) =>
      e.id === updated.id ? updated : e
    );
    await kvSet(KEY, events);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const events = (await kvGet<Event[]>(KEY)).filter((e) => e.id !== id);
    await kvSet(KEY, events);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
