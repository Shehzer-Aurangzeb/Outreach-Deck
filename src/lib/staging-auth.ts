/**
 * Staging/password protection auth utilities.
 * Uses HMAC-signed tokens via Web Crypto (Edge-compatible, no Node crypto).
 * Stateless — no DB or session store required.
 */

const COOKIE_NAME = "staging_auth";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

interface TokenPayload {
  ts: number; // issued at timestamp (ms)
  exp: number; // expiry timestamp (ms)
}

/**
 * Create an HMAC-SHA256 signature using Web Crypto.
 */
async function sign(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );
  // Convert to base64url (URL-safe)
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Timing-safe comparison of two strings.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Create a signed token for staging auth.
 * Format: base64url(payload).signature
 */
export async function createToken(secret: string): Promise<string> {
  const now = Date.now();
  const payload: TokenPayload = {
    ts: now,
    exp: now + MAX_AGE_SECONDS * 1000,
  };
  const payloadStr = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const sig = await sign(payloadStr, secret);
  return `${payloadStr}.${sig}`;
}

/**
 * Verify a staging auth token.
 * Checks: format, signature, not-future, not-expired.
 */
export async function verifyToken(
  token: string,
  secret: string
): Promise<boolean> {
  try {
    const [payloadB64, sig] = token.split(".");
    if (!payloadB64 || !sig) return false;

    // Verify signature
    const expectedSig = await sign(payloadB64, secret);
    if (!timingSafeEqual(sig, expectedSig)) return false;

    // Decode and validate payload
    // Restore base64 padding for atob
    const padded = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
    const payload: TokenPayload = JSON.parse(atob(padded));

    const now = Date.now();

    // Reject future tokens (clock skew > 60s)
    if (payload.ts > now + 60_000) return false;

    // Reject expired tokens
    if (payload.exp < now) return false;

    return true;
  } catch {
    return false;
  }
}

export { COOKIE_NAME, MAX_AGE_SECONDS };
