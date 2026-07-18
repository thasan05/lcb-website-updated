import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";
import { rateLimit, rateLimitResponse, getClientIp } from "@/lib/rate-limit";
import type { LorConfig, LorSubmission } from "@/content/lor";

const CONFIG_KEY = "data:lor-config";
const SUBS_KEY   = "data:lor-submissions";
const MAX_BYTES  = 32 * 1024;
const MAX_FIELD_CHARS = 2000;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

async function sendNotification(submission: LorSubmission, config: LorConfig) {
  const apiKey    = process.env.RESEND_API_KEY;
  const notifyTo  = process.env.LOR_NOTIFY_EMAIL;
  if (!apiKey || !notifyTo) return;

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const a = submission.answers;
  const name  = escapeHtml(a["full-name"]   ?? "—");
  const email = escapeHtml(a["email"]       ?? "—");
  const role  = escapeHtml(a["role-in-lcb"] ?? "—");
  const univ  = escapeHtml(a["university"]  ?? "—");

  const answersHtml = config.questions
    .sort((x, y) => x.order - y.order)
    .filter((q) => a[q.id])
    .map(
      (q) =>
        `<tr>
          <td style="padding:6px 12px;font-weight:600;color:#94a3b8;white-space:nowrap;vertical-align:top">${escapeHtml(q.label)}</td>
          <td style="padding:6px 12px;color:#e2e8f0">${escapeHtml(String(a[q.id])).replace(/\n/g, "<br>")}</td>
        </tr>`
    )
    .join("");

  await resend.emails.send({
    from:    "LCB LOR <notifications@linkedincommunitybangladesh.com>",
    to:      notifyTo,
    subject: `New LOR Application — ${name}`,
    html: `
      <div style="font-family:sans-serif;background:#0a0a0f;color:#e2e8f0;padding:32px;border-radius:12px;max-width:600px">
        <div style="margin-bottom:24px">
          <span style="background:#4F9CEB22;color:#7BB8F0;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;letter-spacing:0.1em">NEW LOR APPLICATION</span>
        </div>
        <h2 style="margin:0 0 4px;font-size:22px;color:#fff">${name}</h2>
        <p style="margin:0 0 24px;color:#64748b;font-size:14px">${email} &nbsp;·&nbsp; ${role} &nbsp;·&nbsp; ${univ}</p>
        <table style="width:100%;border-collapse:collapse;background:#ffffff08;border-radius:8px;overflow:hidden">
          <tbody>${answersHtml}</tbody>
        </table>
        <p style="margin:24px 0 0;font-size:12px;color:#334155">
          Submitted ${new Date(submission.submittedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
          &nbsp;·&nbsp; ID: ${escapeHtml(submission.id)}
        </p>
        <p style="margin:8px 0 0;font-size:12px;color:#334155">
          Review at <a href="https://linkedincommunitybangladesh.com/admin/lor" style="color:#4F9CEB">admin/lor</a>
        </p>
      </div>
    `,
  });
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 3 submissions per IP per hour
    const ip    = getClientIp(req);
    const limit = await rateLimit(`ratelimit:lor:${ip}`, 3, 60 * 60);
    if (!limit.allowed) return rateLimitResponse(limit);

    const cl = Number(req.headers.get("content-length") ?? 0);
    if (cl > MAX_BYTES) return NextResponse.json({ error: "Body too large" }, { status: 413 });
    const text = await req.text();
    if (text.length > MAX_BYTES) return NextResponse.json({ error: "Body too large" }, { status: 413 });

    const { answers: rawAnswers } = JSON.parse(text) as { answers: Record<string, unknown> };
    if (typeof rawAnswers !== "object" || rawAnswers === null)
      return NextResponse.json({ error: "Invalid answers" }, { status: 400 });

    const config = await kvGet<LorConfig>(CONFIG_KEY);
    if (!config.open)
      return NextResponse.json(
        { error: config.closedMessage || "LOR applications are currently closed." },
        { status: 403 }
      );

    // Only accept string answers for known question IDs, capped per field
    const answers: Record<string, string> = {};
    for (const q of config.questions) {
      const v = rawAnswers[q.id];
      if (typeof v !== "string") continue;
      if (v.length > MAX_FIELD_CHARS)
        return NextResponse.json(
          { error: `"${q.label}" exceeds ${MAX_FIELD_CHARS} characters` },
          { status: 400 }
        );
      answers[q.id] = v;
    }

    const missing = config.questions
      .filter((q) => q.required)
      .filter((q) => !answers[q.id] || answers[q.id].trim() === "");
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

    sendNotification(submission, config).catch(() => {});

    return NextResponse.json({ ok: true, id: submission.id });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
