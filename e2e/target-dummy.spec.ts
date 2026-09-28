import { test, expect } from "@playwright/test";

/**
 * The combat tab's target dummy drives the whole engine call, not only the mitigation card:
 * with "Weak spot" on, switching from the Scorchbeast Queen (head ×1.5 in the fallout.wiki
 * body-part table) to the Super Mutant (head ×2.0) changes the weak-spot chip's multiplier.
 */
test.describe("Target dummy", () => {
  test("changing the dummy changes the weak-spot multiplier for the whole call", async ({ page }) => {
    await page.goto("/build?tab=combat");
    await expect(page.getByText("Showing damage for")).toBeVisible({ timeout: 45_000 });
    await expect(page.getByText("🎯 Weak spot")).toHaveCount(0);

    // Biometrics → Stances & V.A.T.S. → Hit location: Weak spot.
    await page.getByRole("tab", { name: /Biometrics/i }).or(page.getByRole("button", { name: /3\. Biometrics/i })).first().click();
    const stances = page.getByRole("button", { name: /^Stances & V\.A\.T\.S\./ });
    await expect(stances).toBeVisible({ timeout: 45_000 });
    if ((await stances.getAttribute("aria-expanded")) === "false") await stances.click();
    const hitLocation = page.getByRole("group", { name: "Hit location" });
    await hitLocation.getByRole("button", { name: "Weak spot" }).click();
    await expect(hitLocation.getByRole("button", { name: "Weak spot" })).toHaveAttribute("aria-pressed", "true");

    // Combat tab: the chip reads the default dummy (Scorchbeast Queen, ×1.50).
    await page.getByRole("tab", { name: /Combat/i }).or(page.getByRole("button", { name: /4\. Combat/i })).first().click();
    const chipLabel = page.getByText("🎯 Weak spot");
    await expect(chipLabel).toBeVisible({ timeout: 30_000 });
    const chipValue = chipLabel.locator("xpath=following-sibling::span[1]");
    const dummies = page.getByRole("group", { name: "Target dummy" });
    await expect(dummies.getByRole("button", { name: "SBQ" })).toHaveAttribute("aria-pressed", "true");
    await expect(chipValue).toContainText("×1.50");

    // Super Mutant: head ×2.00, and the selector reports the new dummy.
    const mutant = dummies.getByRole("button", { name: "Mutant L100" });
    await mutant.click();
    await expect(mutant).toHaveAttribute("aria-pressed", "true");
    await expect(chipValue).toContainText("×2.00");
    await expect(page.getByText("Level 100 Super Mutant Behemoth")).toBeVisible();

    // Back to the Queen: ×1.50 again.
    await dummies.getByRole("button", { name: "SBQ" }).click();
    await expect(chipValue).toContainText("×1.50");
  });
});
