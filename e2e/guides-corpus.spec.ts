import { test, expect } from "@playwright/test";

import counts from "../src/lib/wiki/wiki-category-counts.json";

/**
 * The guides corpus holds Fallout 76 information only (2026-09-22): pages about the source
 * websites are gone (src/data/truth/guides-excluded.json) and site boilerplate is stripped
 * from the guides that stay.
 */
test.describe("guides corpus is Fallout 76 only", () => {
  test("the Nuka Knights site Q&A page (guide 9) is gone from search and the reader", async ({ page, request }) => {
    const byId = await request.get("/api/wiki/search?id=9");
    expect(byId.ok()).toBe(true);
    expect(await byId.json()).toEqual([]);

    const byTitle = await request.get("/api/wiki/search?q=Questions%20for%20Nuka%20knights&limit=100");
    const results = (await byTitle.json()) as Array<{ id: number | string }>;
    expect(results.map((r) => String(r.id))).not.toContain("9");

    await page.goto("/wiki?id=9");
    await expect(page.getByRole("heading", { name: "Fallout 76 guides", level: 1 })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("heading", { name: /Questions for Nuka knights/i })).toHaveCount(0);
  });

  test("a TheDuchessFlame guide no longer shows the Ko-fi donation footer (guide 148)", async ({ page }) => {
    await page.goto("/wiki?id=148");
    await expect(page.getByRole("heading", { level: 1, name: "Burning Springs New Vendor Locations" })).toBeVisible({
      timeout: 20_000,
    });
    const body = page.locator(".guides-reader-body");
    await expect(body).toContainText("Standard Train Station Vendor Bot stuff", { timeout: 20_000 });
    await expect(body).not.toContainText("Ko-fi");
    await expect(body).not.toContainText("Buy me a coffee");
    await expect(body).not.toContainText("Aussie data miner");
  });

  test("the guides total on /wiki matches the corpus", async ({ page }) => {
    expect(counts.all).toBe(3158);
    await page.goto("/wiki");
    await expect(page.getByText(`${counts.all.toLocaleString("en-US")} guides: patch notes`)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByPlaceholder(`Search ${counts.all.toLocaleString("en-US")} guides by title, item or quest`)).toBeVisible();
  });
});
