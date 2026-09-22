import { test, expect, type Page } from "@playwright/test";

/**
 * Offline guide search (production build only: the service worker is registered there).
 * While online the /wiki page fetches the compact client index in the background and the
 * worker caches it, plus every guide body that is opened. Once the connection is gone the
 * page searches the cached index itself and re-opens cached guides.
 */

async function waitForCached(page: Page, url: string) {
  await expect
    .poll(async () => page.evaluate(async (u) => Boolean(await caches.match(u)), url), { timeout: 30_000 })
    .toBe(true);
}

test.describe("offline guides", () => {
  test("search and a cached guide keep working without a connection", async ({ page, context }) => {
    test.setTimeout(120_000);
    await page.goto("/wiki");
    await expect(page.locator("[data-guide-row]").first()).toBeVisible({ timeout: 30_000 });

    const controlled = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return false;
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return false;
      await navigator.serviceWorker.ready;
      return Boolean(navigator.serviceWorker.controller);
    });
    test.skip(!controlled, "No service worker: run against a production build (next start).");

    // The page warms the index while idle; the worker stores it.
    await waitForCached(page, "/data/wiki-index.json");

    // Open one guide so its body is cached, then go back to the list.
    const firstRow = page.locator("[data-guide-row]").first();
    const firstTitle = (await firstRow.locator(".guides-row__title").first().textContent())?.trim() ?? "";
    await firstRow.click();
    await expect(page.locator("article")).toBeVisible({ timeout: 30_000 });
    await expect(page.locator("article")).toContainText(firstTitle.slice(0, 20));
    const bodyUrl = new URL(page.url()).searchParams.get("id");
    expect(bodyUrl).toBeTruthy();
    await waitForCached(page, `/data/wiki/${bodyUrl}.json`);
    await page.getByRole("button", { name: /Back to results/ }).click();
    await expect(page.locator("[data-guide-row]").first()).toBeVisible();

    await context.setOffline(true);
    try {
      // Searching offline answers from the cached index and says so.
      await page.getByPlaceholder(/Search .* guides/).fill("minerva");
      await expect(page.locator("[data-guides-offline]")).toBeVisible({ timeout: 30_000 });
      const rows = page.locator("[data-guide-row]");
      await expect(rows.first()).toBeVisible();
      await expect(rows.first()).toContainText(/minerva/i);

      // The guide read earlier opens from the cache.
      await page.getByPlaceholder(/Search .* guides/).fill("");
      await page.locator("[data-guide-row]").filter({ hasText: firstTitle.slice(0, 20) }).first().click();
      await expect(page.locator("article")).toContainText(firstTitle.slice(0, 20), { timeout: 30_000 });
    } finally {
      await context.setOffline(false);
    }
  });
});
