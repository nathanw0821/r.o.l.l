import { describe, expect, it } from "vitest";
import { newPasswordSchema } from "@/lib/password-policy";

describe("newPasswordSchema", () => {
  it("accepts a password with length, an uppercase letter and a digit", () => {
    expect(newPasswordSchema.safeParse("Vaultboy76").success).toBe(true);
  });
  it("rejects short, lowercase-only, digit-free or overlong passwords", () => {
    for (const bad of ["Ab1", "vaultboy76", "VaultBoyXX", `A1${"x".repeat(127)}`]) {
      expect(newPasswordSchema.safeParse(bad).success).toBe(false);
    }
  });
  it("does not trim", () => {
    expect(newPasswordSchema.parse(" Vaultboy76 ")).toBe(" Vaultboy76 ");
  });
});
