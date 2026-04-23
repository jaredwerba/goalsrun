import { createHmac } from "crypto";

const SECRET = process.env.BETTER_AUTH_SECRET ?? "dev-secret-change-me";
const TTL_MS = 72 * 60 * 60 * 1000; // 72 hours

export type AdminAction = "accept" | "cancel";

/** Create a signed, time-limited token for an email action link. */
export function signAdminToken(bookingId: string, action: AdminAction): string {
  const expiresAt = Date.now() + TTL_MS;
  const payload = `${bookingId}|${action}|${expiresAt}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}|${sig}`).toString("base64url");
}

export type VerifiedToken =
  | { ok: true; bookingId: string; action: AdminAction }
  | { ok: false; reason: string };

/** Verify a token from an email link. Returns the bookingId and action, or an error. */
export function verifyAdminToken(token: string): VerifiedToken {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split("|");
    if (parts.length !== 4) return { ok: false, reason: "Malformed token." };
    const [bookingId, action, expiresAtStr, sig] = parts;
    const expiresAt = Number(expiresAtStr);
    if (isNaN(expiresAt) || Date.now() > expiresAt)
      return { ok: false, reason: "This link has expired." };
    if (action !== "accept" && action !== "cancel")
      return { ok: false, reason: "Unknown action." };
    const payload = `${bookingId}|${action}|${expiresAtStr}`;
    const expected = createHmac("sha256", SECRET).update(payload).digest("hex");
    if (sig !== expected) return { ok: false, reason: "Invalid signature." };
    return { ok: true, bookingId, action };
  } catch {
    return { ok: false, reason: "Could not parse token." };
  }
}
