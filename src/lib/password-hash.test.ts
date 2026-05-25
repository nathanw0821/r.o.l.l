import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, isLegacyHash } from "./password-hash";
import bcrypt from "bcryptjs";

describe("Password Hashing & Verification", () => {
  const plainPassword = "SuperSecurePassword123!";

  it("should successfully hash and verify a password using Web Crypto PBKDF2", async () => {
    const hash = await hashPassword(plainPassword);
    
    expect(hash).toBeDefined();
    expect(hash.startsWith("pbkdf2$100000$")).toBe(true);
    expect(isLegacyHash(hash)).toBe(false);

    // Should verify successfully
    const isValid = await verifyPassword(plainPassword, hash);
    expect(isValid).toBe(true);

    // Should fail with an incorrect password
    const isInvalid = await verifyPassword("WrongPassword!", hash);
    expect(isInvalid).toBe(false);
  });

  it("should successfully verify legacy bcrypt hashes", async () => {
    const bcryptHash = await bcrypt.hash(plainPassword, 10);
    
    expect(bcryptHash).toBeDefined();
    expect(isLegacyHash(bcryptHash)).toBe(true);

    // Should verify successfully
    const isValid = await verifyPassword(plainPassword, bcryptHash);
    expect(isValid).toBe(true);

    // Should fail with an incorrect password
    const isInvalid = await verifyPassword("WrongPassword!", bcryptHash);
    expect(isInvalid).toBe(false);
  });

  it("should handle invalid hash formats gracefully", async () => {
    const invalidHash = "some-random-junk-hash";
    const isValid = await verifyPassword(plainPassword, invalidHash);
    expect(isValid).toBe(false);
  });
});
