import { test, expect } from "@playwright/test";

/**
 * Retro tile mode is a saved preference (localStorage "roll-ui-mode"). The server renders the
 * tracker in the default tactical layout; the client must hydrate that same markup and only then
 * switch to the tiles, otherwise React logs a hydration mismatch and re-renders the whole tree.
 */
test.describe("tracker with retro tile mode saved", () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      try {
        window.localStorage.setItem("roll-ui-mode", "retro");
        window.localStorage.setItem("roll-season", "off");
      } catch {
        // storage unavailable
      }
    });
  });

  for (const route of ["/all-effects", "/1-star"]) {
    test(`${route} hydrates without a mismatch and shows the tiles`, async ({ page }) => {
      const problems: string[] = [];
      page.on("console", (message) => {
        if (message.type() !== "error") return;
        const text = message.text();
        if (/hydrat|did not match|Text content does not match|server rendered/i.test(text)) problems.push(text.slice(0, 200));
      });
      page.on("pageerror", (error) => problems.push(`pageerror: ${error.message.slice(0, 200)}`));

      await page.goto(route);
      await expect(page.locator(".summary-status-card__count-btn").first()).toBeVisible({ timeout: 30_000 });
      await expect(page.locator("html")).toHaveAttribute("data-ui-mode", "retro");
      await page.waitForTimeout(500);
      expect(problems, problems.join("\n")).toEqual([]);
    });
  }
});
