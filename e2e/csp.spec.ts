import { expect, test } from "@playwright/test";

/**
 * Content-Security-Policy smoke test: every main page renders with a nonce-based CSP and the
 * browser reports no violations (a blocked script would silently break the page).
 */
const ROUTES = ["/", "/build", "/all-effects", "/perks", "/wiki", "/wiki/glossary", "/transmissions", "/pts", "/summary", "/auth/sign-in", "/auth/sign-up"];

for (const route of ROUTES) {
  test(`no CSP violations on ${route}`, async ({ page }) => {
    const violations: string[] = [];
    page.on("console", (msg) => {
      const text = msg.text();
      if (/Content Security Policy|Refused to (load|execute|apply|connect|frame)/i.test(text)) violations.push(text);
    });
    await page.addInitScript(() => {
      document.addEventListener("securitypolicyviolation", (e) => {
        (window as unknown as { __cspViolations?: string[] }).__cspViolations ??= [];
        (window as unknown as { __cspViolations: string[] }).__cspViolations.push(`${e.violatedDirective} ${e.blockedURI}`);
      });
    });

    const response = await page.goto(route, { waitUntil: "load" });
    await page.waitForTimeout(1500);
    const csp = response?.headers()["content-security-policy"] ?? "";
    expect(csp).toMatch(/script-src [^;]*'nonce-[^']+'/);
    expect(csp).toContain("frame-ancestors 'none'");

    const fromPage = await page.evaluate(() => (window as unknown as { __cspViolations?: string[] }).__cspViolations ?? []);
    expect([...violations, ...fromPage]).toEqual([]);
    // The app hydrated (a blocked bundle would leave no interactive shell).
    await expect(page.locator("body")).not.toBeEmpty();
  });
}
