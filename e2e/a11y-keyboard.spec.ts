import { test, expect, type Page } from "@playwright/test";

/**
 * Keyboard paths (accessibility pass, ROLL_NEXT_TASK_A11Y.md step 4): every listed control is
 * reachable and operable without a pointer, overlays trap focus and close on Escape, and the
 * skip link lands on the main content.
 */

async function activeElement(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return { tag: "body", id: "", name: "", text: "" };
    return {
      tag: el.tagName.toLowerCase(),
      id: el.id,
      name: el.getAttribute("aria-label") ?? "",
      text: (el.textContent ?? "").trim().slice(0, 40),
    };
  });
}

async function focusIsInside(page: Page, selector: string) {
  return page.evaluate((sel) => {
    const container = document.querySelector(sel);
    return Boolean(container && document.activeElement && container.contains(document.activeElement));
  }, selector);
}

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem("roll-season", "off");
    } catch {
      // storage unavailable
    }
  });
});

test.describe("keyboard", () => {
  test("skip link is the first Tab stop and moves focus to the main content", async ({ page }) => {
    await page.goto("/rules");
    await expect(page.locator("main#main-content")).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect.poll(() => activeElement(page)).toMatchObject({ tag: "main", id: "main-content" });
  });

  test("tracker rows: count steppers and the learned toggle work from the keyboard", async ({ page }) => {
    test.setTimeout(90_000); // the full tracker (149 rows) hydrates slowly on the phone project
    await page.goto("/all-effects");
    // Production streams a hidden copy of the tracker first: always pick visible elements.
    const up = page.locator('[data-count-step="up"]').filter({ visible: true }).first();
    await expect(up).toBeVisible({ timeout: 30_000 });
    const count = page.locator('input[aria-label^="Owned count of"]').filter({ visible: true }).first();
    const before = Number((await count.inputValue()) || 0);
    await up.focus();
    await expect(up).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(count).toHaveValue(String(before + 1));
    const down = page.locator('[data-count-step="down"]').filter({ visible: true }).first();
    await down.focus();
    await page.keyboard.press("Space");
    await expect(count).toHaveValue(before === 0 ? "" : String(before));

    // The name link, the "Use in builder" link and the learned toggle are all in the Tab order.
    const row = page.locator("tr[id^='effect-']").filter({ visible: true }).first();
    for (const role of ["link", "button"] as const) {
      const first = row.getByRole(role).first();
      await first.focus();
      await expect(first).toBeFocused();
    }
  });

  test("perk rank inspector: opens from its button, traps focus, closes on Escape and returns focus", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/perks?q=Night%20Person");
    const info = page.getByRole("button", { name: /Inspect all ranks of Night Person/ }).first();
    await expect(info).toBeVisible({ timeout: 45_000 });
    await info.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: /Night Person/ });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Close inspector" })).toBeFocused();

    // Tab cycles inside the dialog.
    for (let i = 0; i < 12; i += 1) await page.keyboard.press("Tab");
    expect(await focusIsInside(page, '[role="dialog"]')).toBe(true);
    await page.keyboard.press("Shift+Tab");
    expect(await focusIsInside(page, '[role="dialog"]')).toBe(true);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(info).toBeFocused();
  });

  test("legendary mod picker: opens from an armor star slot and closes on Escape", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/build?tab=gear");
    const bench = page.getByRole("button", { name: /^1st star legendary mod for/ }).first();
    await expect(bench).toBeVisible({ timeout: 45_000 });
    await bench.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    expect(await focusIsInside(page, '[role="dialog"]')).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("gear picker: opens from the armor-set button, equips on Enter, closes and returns focus", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/build?tab=gear");
    const change = page.getByRole("button", { name: /^Change armor set: / }).first();
    await expect(change).toBeVisible({ timeout: 45_000 });
    await change.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: /change armor set/i });
    await expect(dialog).toBeVisible();
    expect(await focusIsInside(page, '[role="dialog"]')).toBe(true);

    // One category only: the picker never offers weapons or power armor here.
    await expect(dialog.getByRole("button", { name: /^Equip The Fixer/ })).toHaveCount(0);
    const option = dialog.getByRole("button", { name: /^Equip Civil Engineer/ });
    await option.focus();
    await page.keyboard.press("Enter");
    await expect(dialog).toBeHidden();

    // The frame row, the per-slot dropdowns and focus all follow the pick.
    const changed = page.getByRole("button", { name: /^Change armor set: Civil Engineer/ });
    await expect(changed).toBeVisible();
    await expect(changed).toBeFocused();
    await expect(page.getByLabel("Armor set for Torso Chassis")).toHaveValue("civil-engineer");
    await expect(page.getByLabel("Armor set for Left Leg")).toHaveValue("civil-engineer");
  });

  test("perk picker: 'Add Strength perks' opens a scoped picker, Enter equips at rank 1, focus returns", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/build?tab=perks");
    const add = page.getByRole("button", { name: /^Add Strength perks/ }).first();
    await expect(add).toBeVisible({ timeout: 45_000 });
    // The catalog behind it is collapsed section headers, not a wall of card images.
    await expect(page.locator("[data-perk-catalog-groups]")).toBeVisible();
    await add.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: /add strength perks/i });
    await expect(dialog).toBeVisible();
    expect(await focusIsInside(page, '[role="dialog"]')).toBe(true);
    // Scoped: a Perception card is not offered here.
    await expect(dialog.getByRole("button", { name: /Night Person/ })).toHaveCount(0);
    const option = dialog.getByRole("button", { name: /^Equip Bandolier/ });
    await option.focus();
    await page.keyboard.press("Enter");
    await expect(dialog).toBeHidden();
    await expect(add).toBeFocused();
    await expect(page.locator("#main-content").getByRole("img", { name: "Bandolier", exact: true }).first()).toBeVisible();
    // Reopening marks it as equipped instead of offering it again.
    await add.click();
    await expect(page.getByRole("dialog", { name: /add strength perks/i }).getByRole("button", { name: /^Equipped · rank 1\/\d Bandolier$/ })).toBeVisible();
    await page.keyboard.press("Escape");
  });

  test("stance switchboard: Tab reaches a posture toggle and Space flips aria-pressed", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/build?tab=biometrics");
    // The group header is a real button; phones open one group at a time, so open it first.
    const header = page.getByRole("button", { name: /^Stances & V\.A\.T\.S\./ });
    await expect(header).toBeVisible({ timeout: 45_000 });
    if ((await header.getAttribute("aria-expanded")) !== "true") {
      await header.focus();
      await page.keyboard.press("Enter");
    }
    await expect(header).toHaveAttribute("aria-expanded", "true");

    // Row 1: the first Tab stop after the header is the Upright / Stealthed posture toggle.
    await header.focus();
    await page.keyboard.press("Tab");
    const posture = page.getByRole("button", { name: /Normal Detection|Nocturnal \/ Sneak/ });
    await expect(posture).toBeFocused();
    const before = await posture.getAttribute("aria-pressed");
    expect(["true", "false"]).toContain(before);
    await page.keyboard.press("Space");
    await expect(posture).toHaveAttribute("aria-pressed", before === "true" ? "false" : "true");
    await expect(posture).toContainText(before === "true" ? "Upright" : "Stealthed");
    await page.keyboard.press("Space");
    await expect(posture).toHaveAttribute("aria-pressed", before!);
  });

  test("resistance tiles: focusing a HUD tile opens its breakdown tooltip", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/build?tab=gear");
    const tile = page.locator('[data-resist-tile="dr"]').filter({ visible: true }).first();
    await expect(tile).toBeVisible({ timeout: 45_000 });
    // Radix closes a tooltip on any window scroll: bring the tile into view and let the
    // page settle before focusing it, or the still-loading page scrolls it shut.
    await tile.scrollIntoViewIfNeeded();
    await page.waitForLoadState("networkidle");
    await tile.focus();
    await expect(tile).toBeFocused();
    await expect(page.getByRole("tooltip")).toContainText(/Damage Resistance[\s\S]*Total: \d+/);
  });

  test("guides reader: the contents list is keyboard reachable and jumps to the heading", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "The desktop contents rail; phones use the disclosure.");
    await page.goto("/wiki?id=193");
    const rail = page.getByRole("navigation", { name: "On this page" }).filter({ visible: true }).first();
    await expect(rail).toBeVisible({ timeout: 30_000 });
    const entry = rail.getByRole("link").nth(1);
    await entry.focus();
    await expect(entry).toBeFocused();
    const href = await entry.getAttribute("href");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`${href!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
  });

  test("Quick Filters overlay on phones: focus moves in, Tab stays inside, Escape closes and restores focus", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "The floating Quick Filters button only exists on narrow screens.");
    await page.goto("/all-effects");
    const fab = page.getByRole("button", { name: /Quick filters/ });
    await expect(fab).toBeVisible({ timeout: 30_000 });
    await fab.focus();
    await page.keyboard.press("Enter");
    const hub = page.locator(".command-hub--open");
    await expect(hub).toBeVisible();
    await expect(page.getByRole("dialog", { name: "Command hub" })).toBeVisible();
    expect(await focusIsInside(page, ".command-hub--open")).toBe(true);

    for (let i = 0; i < 15; i += 1) await page.keyboard.press("Tab");
    expect(await focusIsInside(page, ".command-hub--open")).toBe(true);
    await page.keyboard.press("Shift+Tab");
    expect(await focusIsInside(page, ".command-hub--open")).toBe(true);

    await page.keyboard.press("Escape");
    await expect(hub).toBeHidden();
    await expect(page.getByRole("button", { name: "Open command hub" })).toBeFocused();
  });
});
