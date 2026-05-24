import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getApplicationsConfig, writeJsonFile } from "@/lib/admin";
import type { ApplicationsConfig } from "@/lib/admin";

export async function GET() {
  try {
    const config = getApplicationsConfig();
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ error: "Failed to read applications config" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const updated: ApplicationsConfig = await request.json();
    writeJsonFile("applications.json", updated);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update applications config" }, { status: 500 });
  }
}
