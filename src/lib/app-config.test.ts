import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isAdminUser, isReservedUsername } from "@/lib/app-config";

describe("isAdminUser", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ADMIN_USERNAMES", "ezkialez");
    vi.stubEnv("ADMIN_EMAILS", "owner@example.com");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("grants admin by configured username", () => {
    expect(isAdminUser({ username: "EzKiaLez" })).toBe(true);
    expect(isAdminUser({ username: "someone" })).toBe(false);
  });

  it("grants admin by email only when the email is verified", () => {
    expect(isAdminUser({ email: "owner@example.com" })).toBe(false);
    expect(isAdminUser({ email: "owner@example.com", emailVerified: null })).toBe(false);
    expect(isAdminUser({ email: "owner@example.com", emailVerified: false })).toBe(false);
    expect(isAdminUser({ email: "owner@example.com", emailVerified: new Date() })).toBe(true);
    expect(isAdminUser({ email: "owner@example.com", emailVerified: true })).toBe(true);
  });

  it("never grants admin in production when nothing is configured", () => {
    vi.stubEnv("ADMIN_USERNAMES", "");
    vi.stubEnv("ADMIN_EMAILS", "");
    expect(isAdminUser({ username: "anyone", emailVerified: true })).toBe(false);
  });
});

describe("isReservedUsername", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("reserves role-like names and every configured admin username", () => {
    vi.stubEnv("ADMIN_USERNAMES", "ezkialez, backup-admin");
    for (const name of ["admin", "Test", " root ", "ezkialez", "BACKUP-ADMIN"]) {
      expect(isReservedUsername(name)).toBe(true);
    }
    expect(isReservedUsername("vaultdweller")).toBe(false);
  });
});
