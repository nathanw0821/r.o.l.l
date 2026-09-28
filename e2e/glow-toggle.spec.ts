import { test, expect, type Page } from "@playwright/test";

/**
 * Ghoul Glow economy toggles (Biometrics → Stances & V.A.T.S.): the "Spending Glow" and
 * "Hit in last 10 s" buttons exist only for a Playable Ghoul and report their state through
 * aria-pressed. Human builds never see them.
 */

/** The Stances group starts collapsed on small screens; open it when needed. */
async function openStancesGroup(page: Page) {
  const header = page.getByRole("button", { name: /^Stances & V\.A\.T\.S\./ });
  await expect(header).toBeVisible();
  if ((await header.getAttribute("aria-expanded")) === "false") await header.click();
  await expect(header).toHaveAttribute("aria-expanded", "true");
}

test.describe("Glow toggle", () => {
  test("appears only for a Playable Ghoul and toggles aria-pressed", async ({ page }) => {
    await page.goto("/build?tab=biometrics");
    // The toggles' own glyphs, not the Stances group header that summarises "Spending Glow".
    const spendingGlow = page.getByRole("button", { name: /^☢ Spending Glow/ });
    const hitRecently = page.getByRole("button", { name: /^💢 Hit in last 10 s/ });
    const species = page.getByRole("button", { name: /playable ghoul/i }).first();
    await expect(species).toBeVisible();

    // Human (the default): no Glow toggles anywhere on the tab, open group or not.
    await openStancesGroup(page);
    await expect(spendingGlow).toHaveCount(0);
    await expect(hitRecently).toHaveCount(0);

    // Ghoul: the toggle appears, off by default, and flips on click.
    await species.click();
    await openStancesGroup(page);
    await expect(spendingGlow).toBeVisible();
    await expect(spendingGlow).toHaveAttribute("aria-pressed", "false");
    await spendingGlow.click();
    await expect(spendingGlow).toHaveAttribute("aria-pressed", "true");
    await expect(hitRecently).toHaveAttribute("aria-pressed", "false");

    // Back to human: the toggles leave with the species.
    await page.getByRole("button", { name: /^👤 HUMAN$|^HUMAN$/i }).first().click();
    await expect(spendingGlow).toHaveCount(0);
  });
});
