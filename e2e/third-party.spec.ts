import { expect, test } from "@playwright/test";

/**
 * Privacy and speed: pages load only from our own origin. Fonts are self-hosted (next/font) and the
 * Turnstile anti-bot script loads only when a guest actually presses Publish (not tested here: that
 * would create a real shared build).
 */
for (const route of ["/", "/build", "/perks", "/all-effects", "/wiki"]) {
  test(`no third-party requests on ${route}`, async ({ page, baseURL }) => {
    const origin = new URL(baseURL ?? "http://localhost:3000").host;
    const external: string[] = [];
    page.on("request", (req) => {
      const url = new URL(req.url());
      if ((url.protocol === "http:" || url.protocol === "https:") && url.host !== origin) external.push(url.host);
    });
    await page.goto(route, { waitUntil: "load" });
    await page.waitForTimeout(2500);
    expect([...new Set(external)]).toEqual([]);
  });
}
