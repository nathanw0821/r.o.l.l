import { test, expect, type Page } from "@playwright/test";

/**
 * Guides reader and list polish (POLISH_PLAN_2026-09-19, Track 2). Runs on the desktop
 * project and the 360px phone project; phone-only steps check the contents disclosure.
 */

/** The contents list the reader can see: the desktop rail, or the phone disclosure (opened). */
async function visibleContents(page: Page) {
  const phoneToggle = page.getByText(/^On this page \(\d+\)$/);
  if (await phoneToggle.isVisible()) {
    const details = page.locator("details", { has: phoneToggle });
    if ((await details.getAttribute("open")) === null) await phoneToggle.click();
  }
  const toc = page.getByRole("navigation", { name: "On this page" }).filter({ visible: true });
  await expect(toc).toHaveCount(1);
  return toc;
}

/** Scrolls the page so the heading sits at the top of the viewport (as a reader would). */
async function scrollHeadingToTop(page: Page, id: string) {
  await page.evaluate((slug) => {
    const el = document.getElementById(slug);
    if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 60);
  }, id);
}

test.describe("guides reader", () => {
  test("#### headings render as headings, without their hashes or asterisks", async ({ page }) => {
    // Guide 149 has "#### **Step 2: Review the Graph**", which used to show as a paragraph.
    await page.goto("/wiki?id=149");
    await expect(page.getByRole("heading", { level: 1, name: "Shotgun Champ Perk Card Curve Calculator" })).toBeVisible({
      timeout: 20_000
    });
    const step = page.getByRole("heading", { level: 5, name: "Step 2: Review the Graph" });
    await expect(step).toBeAttached({ timeout: 20_000 });
    await expect(step).toHaveText("Step 2: Review the Graph");
    await expect(page.locator(".guides-reader-body")).not.toContainText("####");
    // Deeper headings stay out of the contents list.
    await expect(page.locator("[data-toc-slug]", { hasText: "Step 2: Review the Graph" })).toHaveCount(0);
  });

  test("the contents list marks the section being read", async ({ page }) => {
    // Guide 193 (Raider Power Armor): 5 contents entries, long tables between them.
    await page.goto("/wiki?id=193");
    await expect(page.getByRole("heading", { level: 1, name: "Raider Power Armor" })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("heading", { name: "Crafting", exact: true })).toBeAttached({ timeout: 20_000 });

    // Reading: scroll the Crafting heading to the top. Works with the phone disclosure still closed.
    await scrollHeadingToTop(page, "crafting");
    const current = page.locator('[data-toc-slug][aria-current="location"]');
    await expect(current.first()).toHaveAttribute("data-toc-slug", "crafting", { timeout: 10_000 });
    const slugs = await current.evaluateAll((els) => els.map((el) => el.getAttribute("data-toc-slug")));
    expect(new Set(slugs)).toEqual(new Set(["crafting"]));

    // The visible list shows it (phones: after opening the disclosure).
    const toc = await visibleContents(page);
    const crafting = toc.getByRole("link", { name: "Crafting", exact: true });
    await expect(crafting).toHaveAttribute("aria-current", "location");

    // Back to the top of the first section: the mark moves with the reader.
    const firstSlug = await page.locator("[data-toc-slug]").first().getAttribute("data-toc-slug");
    expect(firstSlug).not.toBe("crafting");
    await scrollHeadingToTop(page, firstSlug ?? "");
    await expect(current.first()).toHaveAttribute("data-toc-slug", firstSlug ?? "", { timeout: 10_000 });
    const after = await current.evaluateAll((els) => els.map((el) => el.getAttribute("data-toc-slug")));
    expect(new Set(after)).toEqual(new Set([firstSlug]));
  });

  test("a contents click marks that section", async ({ page }) => {
    await page.goto("/wiki?id=193");
    await expect(page.getByRole("heading", { name: "Crafting", exact: true })).toBeAttached({ timeout: 20_000 });
    const toc = await visibleContents(page);
    const crafting = toc.getByRole("link", { name: "Crafting", exact: true });
    await crafting.click();
    await expect(page).toHaveURL(/[?&]id=193#crafting$/);
    await expect(crafting).toHaveAttribute("aria-current", "location");
  });

  test("pictures note links to the original page (never embedded)", async ({ page }) => {
    await page.goto("/wiki?id=193");
    await expect(page.getByRole("heading", { level: 1, name: "Raider Power Armor" })).toBeVisible({ timeout: 20_000 });
    const note = page.locator("[data-source-images]");
    await expect(note).toBeVisible();
    const link = note.getByRole("link", { name: /view them on the original page/ });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "https://fallout.wiki/wiki/Raider_Power_Armor_(Fallout_76)");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    await expect(link.locator("svg")).toHaveCount(1);

    // No third-party image anywhere in the guide body.
    const foreign = await page
      .locator(".guides-reader-body img")
      .evaluateAll((imgs) => imgs.map((img) => (img as HTMLImageElement).src).filter((src) => new URL(src).origin !== location.origin));
    expect(foreign).toEqual([]);
  });

  test("tables: a title row is the caption and the next row the column header", async ({ page }) => {
    // Guide 102: "Strength" sits above "Perk | Req | Description | Effects | Form ID | Editor ID".
    await page.goto("/wiki?id=102");
    const table = page.locator("[data-guide-table]", { has: page.locator("caption", { hasText: /^Strength$/ }) });
    await expect(table).toBeAttached({ timeout: 20_000 });
    await expect(table.locator("thead th").first()).toHaveText("Perk");
    await expect(table.locator("thead th")).toHaveCount(6);
    await expect(table.locator("tbody tr").first()).not.toContainText("Editor ID");

    // Guide 193's stat rows have no header: the first row is data, not styled as a header.
    await page.goto("/wiki?id=193");
    const stats = page.locator("[data-guide-table]", { hasText: "Raider Power Helmet" }).first();
    await expect(stats).toBeAttached({ timeout: 20_000 });
    await expect(stats.locator("thead")).toHaveCount(0);
  });
});

test.describe("guides list sort", () => {
  test("sort= is kept in the URL, restored on load, and the default is omitted", async ({ page }) => {
    await page.goto("/wiki?sort=title-asc");
    const sort = page.locator("#guides-sort");
    await expect(sort).toHaveValue("title-asc");
    const rows = page.locator("[data-guide-row] .guides-row__title");
    await expect(rows.first()).toBeVisible({ timeout: 20_000 });
    const ascFirst = (await rows.first().textContent())?.trim() ?? "";

    await sort.selectOption("title-desc");
    await expect(page).toHaveURL(/[?&]sort=title-desc(&|$)/);
    await expect(rows.first()).not.toHaveText(ascFirst, { timeout: 20_000 });
    const descFirst = (await rows.first().textContent())?.trim() ?? "";

    // Reload keeps the order.
    await page.reload();
    await expect(page.locator("#guides-sort")).toHaveValue("title-desc");
    await expect(rows.first()).toHaveText(descFirst, { timeout: 20_000 });

    // Back returns to the previous order.
    await page.goBack();
    await expect(page).toHaveURL(/[?&]sort=title-asc(&|$)/);
    await expect(page.locator("#guides-sort")).toHaveValue("title-asc");
    await expect(rows.first()).toHaveText(ascFirst, { timeout: 20_000 });

    // The default order leaves no sort= behind.
    await page.locator("#guides-sort").selectOption("newest");
    await expect(page).not.toHaveURL(/sort=/);
  });

  test("sort survives filters, paging and opening a guide", async ({ page }) => {
    await page.goto("/wiki?category=Patch%20notes%20%26%20news&sort=oldest");
    await expect(page.locator("#guides-sort")).toHaveValue("oldest");
    await expect(page.getByText(/Page 1 of \d+/)).toBeVisible({ timeout: 20_000 });
    await page.getByRole("navigation", { name: "Pagination" }).getByRole("link", { name: "Next" }).click();
    await expect(page).toHaveURL(/[?&]sort=oldest(&|$)/);
    await expect(page).toHaveURL(/[?&]page=2(&|$)/);

    await page.locator("[data-guide-row]").first().click();
    await expect(page.getByRole("button", { name: "Back to results" })).toBeVisible();
    await expect(page).toHaveURL(/[?&]sort=oldest(&|$)/);
    await page.getByRole("button", { name: "Back to results" }).click();
    await expect(page.locator("#guides-sort")).toHaveValue("oldest");
  });
});
