import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

const TEAM_DIR = path.join(process.cwd(), "src", "data", "team");

const CATEGORY_FILES: Record<string, string> = {
  central: "central-team.json",
  "campus-leads": "campus-leads.json",
  heads: "lcb-heads.json",
  professionals: "professionals.json",
  initiatives: "initiatives.json",
  "star-awards": "star-awards.json",
};

function readCategory(categoryId: string): unknown[] {
  const file = CATEGORY_FILES[categoryId];
  if (!file) throw new Error(`Unknown category: ${categoryId}`);
  return JSON.parse(fs.readFileSync(path.join(TEAM_DIR, file), "utf-8"));
}

function writeCategory(categoryId: string, members: unknown[]): void {
  const file = CATEGORY_FILES[categoryId];
  if (!file) throw new Error(`Unknown category: ${categoryId}`);
  fs.writeFileSync(
    path.join(TEAM_DIR, file),
    JSON.stringify(members, null, 2) + "\n",
    "utf-8"
  );
}

// GET /api/admin/team?category=central
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category");

    if (categoryId) {
      return NextResponse.json(readCategory(categoryId));
    }

    // Return all categories
    const all: Record<string, unknown[]> = {};
    for (const id of Object.keys(CATEGORY_FILES)) {
      all[id] = readCategory(id);
    }
    return NextResponse.json(all);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// POST — add member to category
export async function POST(request: NextRequest) {
  try {
    const { categoryId, member } = await request.json();
    const members = readCategory(categoryId);
    members.unshift(member);
    writeCategory(categoryId, members);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// PUT — update member
export async function PUT(request: NextRequest) {
  try {
    const { categoryId, member } = await request.json();
    const members = readCategory(categoryId) as Array<{ id: string }>;
    const updated = members.map((m) => (m.id === member.id ? member : m));
    writeCategory(categoryId, updated);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// DELETE — remove member
export async function DELETE(request: NextRequest) {
  try {
    const { categoryId, memberId } = await request.json();
    const members = readCategory(categoryId) as Array<{ id: string }>;
    writeCategory(categoryId, members.filter((m) => m.id !== memberId));
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
