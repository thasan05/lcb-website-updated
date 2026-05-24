import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";
import type { ApplicationsConfig } from "@/lib/admin";

const KEY = "data:applications";

export async function GET() {
  try {
    return NextResponse.json(await kvGet<ApplicationsConfig>(KEY));
  } catch {
    return NextResponse.json({ error: "Failed to read applications config" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const updated: ApplicationsConfig = await request.json();
    await kvSet(KEY, updated);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update applications config" }, { status: 500 });
  }
}
