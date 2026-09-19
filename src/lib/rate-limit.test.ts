import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@opennextjs/cloudflare", () => ({ getCloudflareContext: () => { throw new Error("no cf"); } }));

const { clientIpFrom } = await import("@/lib/rate-limit");

describe("clientIpFrom", () => {
  it("prefers Cloudflare's connecting IP over a caller-supplied X-Forwarded-For", () => {
    const h = new Headers({ "cf-connecting-ip": "203.0.113.9", "x-forwarded-for": "1.2.3.4, 203.0.113.9" });
    expect(clientIpFrom(h)).toBe("203.0.113.9");
  });

  it("falls back to X-Forwarded-For only without an edge header", () => {
    expect(clientIpFrom(new Headers({ "x-forwarded-for": "10.0.0.1, 10.0.0.2" }))).toBe("10.0.0.1");
    expect(clientIpFrom(new Headers())).toBe("anonymous");
  });
});
