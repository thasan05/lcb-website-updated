import { NextResponse } from "next/server";
import { getStructureData } from "@/lib/structure-sheet";

export const revalidate = 300;

export async function GET() {
  const data = await getStructureData();
  return NextResponse.json(data);
}
