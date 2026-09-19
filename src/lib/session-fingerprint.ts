import { createHash } from "node:crypto";

/** How often a signed-in session is rechecked against the database. */
export const SESSION_RECHECK_MS = 5 * 60 * 1000;

/**
 * Short hash of the things that must end every session when they change: the password hash and
 * the email. Changing, resetting or setting a password, or changing the email, changes it.
 */
export function credentialFingerprint(user: { passwordHash?: string | null; email?: string | null }): string {
  return createHash("sha256")
    .update(`${user.passwordHash ?? ""}\n${(user.email ?? "").trim().toLowerCase()}`, "utf8")
    .digest("hex")
    .slice(0, 32);
}
