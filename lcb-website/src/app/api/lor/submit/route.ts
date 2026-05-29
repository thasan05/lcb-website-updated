import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";
import type { LorConfig, LorSubmission } from "@/content/lor";

const CONFIG_KEY = "data:lor-config";
const SUBS_KEY   = "data:lor-submissions";
const MAX_BYTES  = 32 * 1024;

export async function POST(req: NextRequest) {
  try {
    const cl = Number(req.headers.get("content-length") ?? 0);
    if (cl > MAX_BYTES) return NextResponse.json({ error: "Body too large" }, { status: 413 });
    const text = await req.text();
    if (text.length > MAX_BYTES) return NextResponse.json({ error: "Body too large" }, { status: 413 });

    const { answers } = JSON.parse(text) as { answers: Record<string, string> };
    if (typeof answers !== "object" || answers === null)
      return NextResponse.json({ error: "Invalid answers" }, { status: 400 });

    const config = await kvGet<LorConfig>(CONFIG_KEY);
    if (!config.open)
      return NextResponse.json(
        { error: config.closedMessage || "LOR applications are currently closed." },
        { status: 403 }
      );

    const missing = config.questions
      .filter((q) => q.required)
      .filter((q) => !answers[q.id] || String(answers[q.id]).trim() === "");
    if (missing.length > 0)
      return NextResponse.json(
        { error: `Required fields missing: ${missing.map((q) => q.label).join(", ")}` },
        { status: 400 }
      );

    const subs: LorSubmission[] = (await kvGet<LorSubmission[]>(SUBS_KEY).catch(() => [] as LorSubmission[])) ?? [];
    const submission: LorSubmission = {
      id: `lor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      answers,
      submittedAt: new Date().toISOString(),
      status: "pending",
    };
    subs.unshift(submission);
    await kvSet(SUBS_KEY, subs);

    return NextResponse.json({ ok: true, id: submission.id });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
