/**
 * HMAC-SHA-256 signed session tokens.
 * Works in both Node.js (API routes) and Edge (middleware) via Web Crypto API.
 *
 * Token format:  base64(payload_json) . hex(HMAC-SHA256)
 * Payload:       { exp: <unix_ms>, jti: <uuid> }
 */

const ENC = new TextEncoder();

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHexToUint8Array(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < arr.length; i++)
    arr[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return arr;
}

async function importKey(secret: string, usage: KeyUsage[]) {
  return crypto.subtle.importKey(
    "raw",
    ENC.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usage
  );
}

/**
 * Create a signed session token valid for `ttlMs` milliseconds.
 * Requires SESSION_SECRET env var.
 */
export async function createSessionToken(
  secret: string,
  ttlMs = 7 * 24 * 60 * 60 * 1000
): Promise<string> {
  const payload = JSON.stringify({
    exp: Date.now() + ttlMs,
    jti: crypto.randomUUID(),
  });
  const data = btoa(payload);
  const key  = await importKey(secret, ["sign"]);
  const sig  = toHex(await crypto.subtle.sign("HMAC", key, ENC.encode(data)));
  return `${data}.${sig}`;
}

/**
 * Verify a session token. Returns true only if:
 *  - Format is correct
 *  - HMAC signature is valid (constant-time comparison)
 *  - Token has not expired
 */
export async function verifySessionToken(
  token: string,
  secret: string
): Promise<boolean> {
  try {
    const dot = token.lastIndexOf(".");
    if (dot === -1) return false;

    const data    = token.slice(0, dot);
    const sigHex  = token.slice(dot + 1);

    // Recompute expected signature
    const key      = await importKey(secret, ["sign"]);
    const expected = toHex(await crypto.subtle.sign("HMAC", key, ENC.encode(data)));

    // Constant-time hex comparison (prevents timing attacks)
    if (sigHex.length !== expected.length) return false;
    const a = ENC.encode(sigHex);
    const b = ENC.encode(expected);
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    if (diff !== 0) return false;

    // Check expiry
    const payload = JSON.parse(atob(data)) as { exp: number };
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}
