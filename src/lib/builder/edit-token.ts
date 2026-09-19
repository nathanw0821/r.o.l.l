import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Edit tokens let an anonymous publisher edit or delete their shared build. Only a SHA-256 hash is
 * stored (in the payload as `_editTokenHash`); the raw token is returned once, at publish time.
 * Payload keys starting with "_" are server-owned: they are never sent to clients and never
 * accepted from them. A legacy raw `_editToken` is not honoured (it was exposed by the read API).
 */
const HASH_KEY = "_editTokenHash";

export function hashEditToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function createEditToken(): { token: string; hash: string } {
  const token = randomBytes(24).toString("hex");
  return { token, hash: hashEditToken(token) };
}

function storedHash(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const value = (payload as Record<string, unknown>)[HASH_KEY];
  return typeof value === "string" && /^[0-9a-f]{64}$/.test(value) ? value : null;
}

export function verifyEditToken(payload: unknown, token: string | null | undefined): boolean {
  const expected = storedHash(payload);
  if (!expected || !token || token.length > 256) return false;
  return timingSafeEqual(Buffer.from(hashEditToken(token), "hex"), Buffer.from(expected, "hex"));
}

/** Payload as clients may see it: server-owned `_` keys removed. */
export function publicPayload<T>(payload: T): T {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return payload;
  return Object.fromEntries(
    Object.entries(payload as Record<string, unknown>).filter(([key]) => !key.startsWith("_"))
  ) as T;
}

/** Client-sent payload with server-owned keys dropped and the stored hash carried over. */
export function mergeClientPayload(clientPayload: object, previous: unknown): Record<string, unknown> {
  const cleaned = Object.fromEntries(
    Object.entries(clientPayload as Record<string, unknown>).filter(
      ([key]) => !key.startsWith("_") && key !== "redirectUrl"
    )
  );
  const hash = storedHash(previous);
  return hash ? { ...cleaned, [HASH_KEY]: hash } : cleaned;
}

export const EDIT_TOKEN_HASH_KEY = HASH_KEY;
