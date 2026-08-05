/**
 * Pulls the server's error message out of a failed admin API response.
 *
 * Admin routes reply with `{ error: "..." }` explaining exactly what was
 * rejected (which field, and why). Several admin pages used to discard that and
 * show a generic "Save failed", which made a rejected field indistinguishable
 * from an outage — use this instead so the editor sees the real reason.
 */
export async function errorFromResponse(
  res: Response,
  fallback = "Save failed. Try again."
): Promise<string> {
  try {
    const body: unknown = await res.json();
    if (body && typeof body === "object") {
      const { error } = body as { error?: unknown };
      if (typeof error === "string" && error.trim() !== "") return error;
    }
  } catch {
    // Response wasn't JSON (proxy error page, network truncation) — fall through.
  }
  return fallback;
}
