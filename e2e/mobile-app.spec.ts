import { test, expect, type Page } from "@playwright/test";

/**
 * Phone usability and installed-app (PWA) checks.
 * - "touch phone": the `mobile` project (360x800) with a touch screen, so
 *   (pointer: coarse) and (hover: none) match like on a real phone.
 * - "app shell": manifest, icons and service worker; run once, on the desktop project.
 */

/** Visible text fields and selects whose computed font size is under 16px (iOS zooms into those). */
async function smallFormFields(page: Page, scope = "body") {
  return page.evaluate((selector) => {
    const skip = new Set(["checkbox", "radio", "range", "button", "submit", "reset", "file", "color", "image", "hidden"]);
    const root = document.querySelector(selector) ?? document.body;
    return Array.from(root.querySelectorAll<HTMLElement>("input, select, textarea"))
      .filter((el) => !(el instanceof HTMLInputElement && skip.has(el.type)))
      .filter((el) => {
        const box = el.getBoundingClientRect();
        return box.width > 0 && box.height > 0 && getComputedStyle(el).visibility !== "hidden";
      })
      .map((el) => ({
        name: el.getAttribute("aria-label") || el.getAttribute("placeholder") || el.getAttribute("name") || el.tagName,
        fontSize: parseFloat(getComputedStyle(el).fontSize)
      }))
      .filter((field) => field.fontSize < 16);
  }, scope);
}

/** PNG width and height from the IHDR chunk. */
function pngSize(bytes: Buffer) {
  expect(bytes.subarray(1, 4).toString("ascii")).toBe("PNG");
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

test.describe("touch phone", () => {
  test.use({ hasTouch: true });
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Phone-only checks run on the mobile project.");
  });

  test("tapping the damage help icon opens the breakdown, a second tap closes it", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/build?tab=combat");
    const trigger = page.getByRole("button", { name: "Damage calculation breakdown" });
    await expect(trigger).toBeVisible({ timeout: 45_000 });
    const breakdown = page.getByRole("tooltip").filter({ hasText: "Damage Calculations Breakdown" });

    await trigger.tap();
    await expect(breakdown).toBeVisible();
    await trigger.tap();
    await expect(breakdown).toBeHidden();
  });

  test("tracker count -/+ buttons are at least 44x44 and named", async ({ page }) => {
    await page.goto("/all-effects");
    const up = page.locator('[data-count-step="up"]').first();
    const down = page.locator('[data-count-step="down"]').first();
    await expect(up).toBeVisible({ timeout: 30_000 });
    for (const button of [down, up]) {
      const box = await button.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
      await expect(button).toHaveAttribute("aria-label", /(Increase|Decrease) owned count of .+/);
    }
  });

  test("long-press on a perk card opens the rank inspector and no new tab", async ({ page, context }) => {
    test.setTimeout(90_000);
    await page.goto("/perks?q=Night%20Person");
    // A catalog perk card (the in-game card art), not an empty legendary slot.
    const card = page.locator('.aspect-\\[310\\/490\\]:has(img[src*="/images/in_game_cards/"])').first();
    await expect(card).toBeVisible({ timeout: 45_000 });
    await card.scrollIntoViewIfNeeded();
    const box = (await card.boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 3;

    let popups = 0;
    context.on("page", () => (popups += 1));
    const cdp = await context.newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    await page.waitForTimeout(800);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });

    await expect(page.getByText("Unlocks at Level", { exact: false })).toBeVisible();
    expect(popups).toBe(0);
    await expect(card).toHaveCSS("user-select", "none");
  });
});

test.describe("phone builder", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Phone-only checks run on the mobile project.");
  });

  test("perk catalog is collapsible S.P.E.C.I.A.L. sections, not one endless grid", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto("/build?tab=perks");
    const groups = page.locator("[data-perk-catalog-groups]");
    await expect(groups).toBeVisible({ timeout: 45_000 });
    const strength = groups.getByRole("button", { name: /^Strength \d+ cards$/ });
    await expect(strength).toHaveAttribute("aria-expanded", "false");
    await expect(groups.locator("img")).toHaveCount(0);

    await strength.click();
    await expect(strength).toHaveAttribute("aria-expanded", "true");
    await expect(groups.locator('img[src*="/images/in_game_cards/"]').first()).toBeVisible();

    // The whole builder page stays a few screens tall instead of ~45.
    const screens = await page.evaluate(() => document.documentElement.scrollHeight / window.innerHeight);
    expect(screens).toBeLessThan(20);
  });
});

test.describe("phone form fields", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Phone-only checks run on the mobile project.");
  });

  test("sign-in fields and the global search are at least 16px (no iOS focus zoom)", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await expect(page.getByRole("heading", { name: "Sign in", level: 1 })).toBeVisible();
    const identifier = page.getByPlaceholder("Enter your username or email");
    await expect(identifier).toHaveAttribute("autocapitalize", "none");
    await expect(identifier).toHaveAttribute("autocomplete", "username");
    await expect(identifier).toHaveAttribute("spellcheck", "false");
    expect(await smallFormFields(page, "#main-content")).toEqual([]);

    const search = page.getByRole("textbox", { name: "Search", exact: true });
    await expect(search).toBeVisible({ timeout: 20_000 });
    expect(await search.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
  });

  test("auth pages have no guest banner and no Quick filters button", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await expect(page.getByRole("heading", { name: "Sign in", level: 1 })).toBeVisible();
    await expect(page.getByRole("button", { name: "Feedback", exact: true })).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("[data-guest-banner]")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Open Command Hub Filters" })).toHaveCount(0);
  });
});

test.describe("app shell", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Runs once, on the desktop project.");
  });

  test("one manifest with real 192, 512 and maskable 512 icons", async ({ page, request }) => {
    await page.goto("/rules");
    const links = page.locator('link[rel="manifest"]');
    await expect(links).toHaveCount(1);
    await expect(links).toHaveAttribute("href", /\/manifest\.webmanifest/);
    expect((await request.get("/manifest.json")).status()).toBe(404);

    const response = await request.get("/manifest.webmanifest");
    expect(response.ok()).toBe(true);
    const manifest = (await response.json()) as {
      name: string;
      short_name: string;
      start_url: string;
      scope: string;
      display: string;
      theme_color: string;
      background_color: string;
      icons: { src: string; sizes: string; type: string; purpose?: string }[];
    };
    expect(manifest.short_name).toBe("R.O.L.L");
    expect(manifest.start_url).toBe("/");
    expect(manifest.scope).toBe("/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.theme_color).toMatch(/^#[0-9a-f]{6}$/i);
    expect(manifest.background_color).toMatch(/^#[0-9a-f]{6}$/i);

    const wanted = [
      { sizes: "192x192", purpose: "any" },
      { sizes: "512x512", purpose: "any" },
      { sizes: "512x512", purpose: "maskable" }
    ];
    for (const want of wanted) {
      const icon = manifest.icons.find((i) => i.sizes === want.sizes && (i.purpose ?? "any").split(" ").includes(want.purpose));
      expect(icon, `${want.purpose} ${want.sizes} icon`).toBeTruthy();
      const image = await request.get(icon!.src);
      expect(image.ok()).toBe(true);
      const [w, h] = want.sizes.split("x").map(Number);
      expect(pngSize(await image.body())).toEqual({ width: w, height: h });
    }

    const apple = await request.get("/apple-icon.png");
    expect(apple.ok()).toBe(true);
    expect(pngSize(await apple.body())).toEqual({ width: 180, height: 180 });
  });

  test("viewport allows zoom and covers the safe areas; theme-color is set", async ({ page }) => {
    await page.goto("/rules");
    const viewport = await page.locator('meta[name="viewport"]').getAttribute("content");
    expect(viewport).toContain("width=device-width");
    expect(viewport).toContain("viewport-fit=cover");
    expect(viewport).not.toContain("user-scalable=no");
    expect(viewport).not.toContain("maximum-scale");
    expect(await page.locator('meta[name="theme-color"]').count()).toBeGreaterThan(0);
  });

  test("service worker never intercepts /api or /auth, only static files", async ({ page }) => {
    test.setTimeout(120_000);
    // Production registers /sw.js itself; dev does not, so register it by hand here.
    await page.goto("/offline");
    await expect(page.getByRole("heading", { name: "You are offline", level: 1 })).toBeVisible();
    await page.evaluate(async () => {
      await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      await navigator.serviceWorker.ready;
    });
    await page.reload();
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)), { timeout: 30_000 }).toBe(true);

    // Static file under /images/: answered by the service worker (proves it is active).
    const imageResponse = page.waitForResponse((r) => r.url().includes("/images/special/special_S.webp"));
    await page.evaluate(() => fetch("/images/special/special_S.webp").then((r) => r.status));
    expect((await imageResponse).fromServiceWorker()).toBe(true);

    // API and auth: straight to the network.
    const apiResponse = page.waitForResponse((r) => r.url().includes("/api/tier-progress"));
    await page.evaluate(() => fetch("/api/tier-progress?auth=guest").then((r) => r.status));
    expect((await apiResponse).fromServiceWorker()).toBe(false);

    const authPage = await page.goto("/auth/sign-in");
    expect(authPage?.fromServiceWorker()).toBe(false);

    // Nothing but the offline page and static files is ever stored.
    const cached = await page.evaluate(async () => {
      const urls: string[] = [];
      for (const name of await caches.keys()) {
        const cache = await caches.open(name);
        for (const req of await cache.keys()) urls.push(new URL(req.url).pathname);
      }
      return urls;
    });
    expect(cached).toContain("/offline");
    for (const path of cached) {
      expect(path === "/offline" || path.startsWith("/_next/static/") || path.startsWith("/images/"), path).toBe(true);
    }
  });
});
