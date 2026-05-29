import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";
import type { LorConfig, LorSubmission } from "@/content/lor";

const CONFIG_KEY = "data:lor-config";
const SUBS_KEY   = "data:lor-submissions";
const MAX_BYTES  = 32 * 1024;

async function sendNotification(submission: LorSubmission, config: LorConfig) {
  const apiKey    = process.env.RESEND_API_KEY;
  const notifyTo  = process.env.LOR_NOTIFY_EMAIL;
  if (!apiKey || !notifyTo) return; // env vars not set — skip silently

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const a = submission.answers;
  const name  = a["full-name"]   ?? "—";
  const email = a["email"]       ?? "—";
  const role  = a["role-in-lcb"] ?? "—";
  const univ  = a["university"]  ?? "—";

  // Build a full answers table for the email body
  const answersHtml = config.questions
    .sort((x, y) => x.order - y.order)
    .filter((q) => a[q.id])
    .map(
      (q) =>
        `<tr>
          <td style="padding:6px 12px;font-weight:600;color:#94a3b8;white-space:nowrap;vertical-align:top">${q.label}</td>
          <td style="padding:6px 12px;color:#e2e8f0">${String(a[q.id]).replace(/\n/g, "<br>")}</td>
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
          &nbsp;·&nbsp; ID: ${submission.id}
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

    // Fire-and-forget — never block the response on email failure
    sendNotification(submission, config).catch(() => {});

    return NextResponse.json({ ok: true, id: submission.id });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
