import { describe, expect, it } from "vitest";
import { credentialFingerprint } from "@/lib/session-fingerprint";

describe("credentialFingerprint", () => {
  const base = { passwordHash: "pbkdf2$abc", email: "a@example.com" };
  it("is stable for the same credentials (email case-insensitive)", () => {
    expect(credentialFingerprint(base)).toBe(credentialFingerprint({ ...base, email: "A@Example.com " }));
  });
  it("changes when the password or email changes, or a password is added", () => {
    const fp = credentialFingerprint(base);
    expect(credentialFingerprint({ ...base, passwordHash: "pbkdf2$def" })).not.toBe(fp);
    expect(credentialFingerprint({ ...base, email: "b@example.com" })).not.toBe(fp);
    expect(credentialFingerprint({ email: base.email })).not.toBe(fp);
  });
});
