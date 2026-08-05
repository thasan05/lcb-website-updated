import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kvGet, kvSet, kvUpdate } from "@/lib/kv";
import { revalidateContent } from "@/lib/revalidate";
import { isValidId, parseBody, errorResponse, NotFoundError } from "@/lib/api-validation";
import type { LorConfig, LorSubmission } from "@/content/lor";

const CONFIG_KEY = "data:lor-config";
const SUBS_KEY   = "data:lor-submissions";
const MAX_BYTES  = 64 * 1024;

export async function GET() {
  try {
    const [config, submissions] = await Promise.all([
      kvGet<LorConfig>(CONFIG_KEY),
      kvGet<LorSubmission[]>(SUBS_KEY).catch(() => [] as LorSubmission[]),
    ]);
    return NextResponse.json({ config, submissions: submissions ?? [] });
  } catch (e) {
    return errorResponse(e, "Failed to read LOR data");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await parseBody(req, MAX_BYTES);
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const payload = body as Record<string, unknown>;

    if (payload.type === "config") {
      const config = payload.data as LorConfig;
      if (typeof config?.open !== "boolean")
        return NextResponse.json({ error: "Invalid config: open must be boolean" }, { status: 400 });
      if (!Array.isArray(config.rules))
        return NextResponse.json({ error: "Invalid config: rules must be array" }, { status: 400 });
      if (!Array.isArray(config.questions))
        return NextResponse.json({ error: "Invalid config: questions must be array" }, { status: 400 });
      await kvSet(CONFIG_KEY, config);
      revalidateContent("lor");
      return NextResponse.json({ ok: true });
    }

    if (payload.type === "submission-status") {
      const { id, status, notes } = payload as { id?: unknown; status?: unknown; notes?: unknown };
      if (!isValidId(id) || !["pending", "approved", "rejected"].includes(status as string))
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
      if (notes !== undefined && typeof notes !== "string")
        return NextResponse.json({ error: "Invalid notes" }, { status: 400 });
      // Atomic: a status change must not clobber a submission that arrives
      // between the read and the write.
      await kvUpdate<LorSubmission[]>(SUBS_KEY, (current) => {
        const subs = current ?? [];
        if (!subs.some((s) => s.id === id)) throw new NotFoundError();
        return subs.map((s) =>
          s.id === id
            ? { ...s, status: status as LorSubmission["status"], ...(notes !== undefined ? { notes } : {}) }
            : s
        );
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (e) {
    return errorResponse(e, "Failed to update LOR data", 400);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await parseBody(req, MAX_BYTES);
    const { id } = (typeof body === "object" && body !== null ? body : {}) as { id?: unknown };
    if (!isValidId(id))
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await kvUpdate<LorSubmission[]>(SUBS_KEY, (current) =>
      (current ?? []).filter((s) => s.id !== id)
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e, "Failed to delete LOR submission", 400);
  }
}
