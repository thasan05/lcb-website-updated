import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readJsonFile, writeJsonFile } from "@/lib/admin";
import type { Event } from "@/content/events";

export async function GET() {
  try {
    const events = readJsonFile<Event[]>("events.json");
    return NextResponse.json(events);
  } catch {
    return NextResponse.json({ error: "Failed to read events" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const item: Event = await request.json();
    const events = readJsonFile<Event[]>("events.json");
    events.unshift(item);
    writeJsonFile("events.json", events);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updated: Event = await request.json();
    let events = readJsonFile<Event[]>("events.json");
    events = events.map((e) => (e.id === updated.id ? updated : e));
    writeJsonFile("events.json", events);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    let events = readJsonFile<Event[]>("events.json");
    events = events.filter((e) => e.id !== id);
    writeJsonFile("events.json", events);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
