import { describe, expect, it } from "vitest";
import {
  createEditToken,
  EDIT_TOKEN_HASH_KEY,
  mergeClientPayload,
  publicPayload,
  verifyEditToken
} from "@/lib/builder/edit-token";

describe("edit tokens", () => {
  it("stores only a hash and verifies the raw token", () => {
    const { token, hash } = createEditToken();
    expect(hash).not.toContain(token);
    const payload = { title: "x", [EDIT_TOKEN_HASH_KEY]: hash };
    expect(verifyEditToken(payload, token)).toBe(true);
    expect(verifyEditToken(payload, `${token}x`)).toBe(false);
    expect(verifyEditToken(payload, hash)).toBe(false);
    expect(verifyEditToken(payload, null)).toBe(false);
  });

  it("does not honour a legacy raw token stored in the payload", () => {
    expect(verifyEditToken({ _editToken: "abc" }, "abc")).toBe(false);
  });

  it("never exposes server-owned keys", () => {
    const { hash } = createEditToken();
    const out = publicPayload({ a: 1, _editToken: "t", [EDIT_TOKEN_HASH_KEY]: hash });
    expect(out).toEqual({ a: 1 });
  });

  it("drops client-sent server keys and redirects, keeping the stored hash", () => {
    const { hash } = createEditToken();
    const merged = mergeClientPayload(
      { a: 2, _editTokenHash: "0".repeat(64), _editToken: "x", redirectUrl: "https://evil.example" },
      { [EDIT_TOKEN_HASH_KEY]: hash }
    );
    expect(merged).toEqual({ a: 2, [EDIT_TOKEN_HASH_KEY]: hash });
  });
});
