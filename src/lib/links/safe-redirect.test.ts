import { describe, expect, it } from "vitest";
import { sameSiteRedirectPath } from "@/lib/links/safe-redirect";

describe("sameSiteRedirectPath", () => {
  it("keeps site paths", () => {
    expect(sameSiteRedirectPath("/wiki?q=bloodied")).toBe("/wiki?q=bloodied");
    expect(sameSiteRedirectPath("https://fallout76.wiki/wiki")).toBe("/wiki");
    expect(sameSiteRedirectPath("https://www.fallout76.wiki/build?tab=gear#x")).toBe("/build?tab=gear#x");
  });

  it("refuses other sites and tricks", () => {
    for (const bad of [
      "https://evil.example/login",
      "//evil.example",
      "/\\evil.example",
      "http://fallout76.wiki/wiki",
      "http://localhost:8787/wiki",
      "https://fallout76.wiki.evil.example/",
      "https://user:pw@fallout76.wiki/",
      "javascript:alert(1)",
      "",
      42
    ]) {
      expect(sameSiteRedirectPath(bad)).toBeNull();
    }
  });
});
