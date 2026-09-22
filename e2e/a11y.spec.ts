import { test, expect, type Page, type TestInfo } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { AxeResults, Result } from "axe-core";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Accessibility gate: axe-core (WCAG 2.x A/AA) on every main guest route, desktop and phone.
 *
 * - One page load per route. The default look (season off) gets the full rule set; the Blood Moon
 *   look is checked for colour contrast by flipping `data-season` on the same page.
 * - On the phone project the same load also measures text sizes (12 px floor everywhere,
 *   14 px for reading text) and checks that nothing overflows the viewport.
 * - `A11Y_REPORT=1` records everything under e2e/a11y-report/ without failing
 *   (`node scripts/a11y-summary.mjs` turns the JSON into the worklog table).
 * - Gate mode fails on `serious` and `critical` violations that are not in ALLOWED_VIOLATIONS.
 *   `moderate` and `minor` are recorded, not enforced.
 */

const REPORT_ONLY = process.env.A11Y_REPORT === "1";
// Not under playwright's outputDir (e2e/.output), which every run wipes.
const OUTPUT_DIR = join(process.cwd(), "e2e", "a11y-report");

const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/** Every main guest route (spec: ROLL_NEXT_TASK_A11Y.md). */
const ROUTES = [
  "/",
  "/build?tab=gear",
  "/build?tab=perks",
  "/build?tab=biometrics",
  "/build?tab=combat",
  "/all-effects",
  "/1-star",
  "/perks",
  "/wiki",
  "/wiki?id=148",
  "/wiki/glossary",
  "/transmissions",
  "/pts",
  "/summary",
  "/screenshot-assist",
  "/auth/sign-in",
  "/auth/sign-up",
  "/rules",
  "/privacy",
  "/offline"
] as const;

type Route = (typeof ROUTES)[number];

/** Phone text floors (CSS px). Secondary text may be 12 px; reading text (p, li, td, th) must be 14 px. */
const PHONE_MIN_TEXT_PX = 12;
const PHONE_MIN_BODY_TEXT_PX = 14;

/**
 * Justified exceptions. Every entry needs a reason here and an issue in PATCH70_WORKLOG.md.
 * `route` and `project` narrow the exception; omit them to allow the rule everywhere.
 */
type AllowedViolation = {
  rule: string;
  route?: Route;
  project?: "chromium" | "mobile";
  season?: Season;
  reason: string;
};
const ALLOWED_VIOLATIONS: AllowedViolation[] = [];

type Season = "default" | "blood-moon";

type ViolationSummary = {
  id: string;
  impact: Result["impact"];
  help: string;
  helpUrl: string;
  nodes: number;
  targets: string[];
};

type RouteReport = {
  project: string;
  route: string;
  url: string;
  results: Record<Season, ViolationSummary[]>;
  incomplete: Record<Season, number>;
  text?: TextProbe;
  overflow?: { scrollWidth: number; innerWidth: number };
};

type TextProbe = {
  measured: number;
  under12: number;
  bodyUnder14: number;
  under12ByStyle: Record<string, number>;
  bodyUnder14ByStyle: Record<string, number>;
  samples: string[];
};

function summarize(results: AxeResults): ViolationSummary[] {
  return results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    helpUrl: violation.helpUrl,
    nodes: violation.nodes.length,
    targets: violation.nodes.slice(0, 5).map((node) => node.target.map(String).join(" ")),
  }));
}

function isAllowed(violation: ViolationSummary, route: Route, project: string, season: Season) {
  return ALLOWED_VIOLATIONS.some(
    (allowed) =>
      allowed.rule === violation.id &&
      (allowed.route === undefined || allowed.route === route) &&
      (allowed.project === undefined || allowed.project === project) &&
      (allowed.season === undefined || allowed.season === season)
  );
}

function describeViolations(violations: ViolationSummary[]) {
  return violations
    .map(
      (violation) =>
        `${violation.id} (${violation.impact}, ${violation.nodes} node${violation.nodes === 1 ? "" : "s"}): ${violation.help}\n` +
        violation.targets.map((target) => `    - ${target}`).join("\n") +
        `\n    ${violation.helpUrl}`
    )
    .join("\n");
}

/** The page is "ready" once the shell, the truth-pack footer stamp and the route's own content are in. */
async function waitForRouteReady(page: Page, route: Route) {
  await expect(page.locator("main#main-content")).toBeVisible({ timeout: 45_000 });
  await expect(page.getByText(/Game data: Patch \d+/)).toBeVisible({ timeout: 45_000 });
  if (route.startsWith("/build") || route === "/perks") {
    // The builder is a client-only import: wait for its tab nav and the tab-specific content.
    await expect(page.getByRole("button", { name: /GEAR & ARMORY/ })).toBeVisible({ timeout: 45_000 });
    if (route.endsWith("combat")) {
      await expect(page.getByText("Showing damage for")).toBeVisible({ timeout: 45_000 });
    }
    if (route.endsWith("perks") || route === "/perks") {
      await expect(page.locator("main").getByPlaceholder("Search perk cards...")).toBeVisible({ timeout: 45_000 });
    }
  }
  if (route === "/wiki?id=148") {
    await expect(page.locator("article").first()).toBeVisible({ timeout: 45_000 });
  }
  await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {
    // Polling or the service worker can keep the network busy; the DOM checks above are what matter.
  });
  // Deferred client components (builder tabs, command hub, banners) mount a beat after idle.
  await page.waitForTimeout(1_000);
}

/** Runs axe on the page as it is; `rules` narrows the run (used for the season re-check). */
async function runAxe(page: Page, rules?: string[]) {
  const builder = new AxeBuilder({ page })
    .withTags(AXE_TAGS)
    // The Next.js dev overlay is not part of the site.
    .exclude("nextjs-portal");
  if (rules) builder.withRules(rules);
  return builder.analyze();
}

async function setSeason(page: Page, season: Season) {
  await page.evaluate((value) => {
    document.documentElement.setAttribute("data-season", value === "blood-moon" ? "blood-moon" : "");
  }, season);
}

/**
 * Measures every visible text run: how many sit under the phone floors and which
 * tag/class combinations they come from (so fixes can go through shared styles).
 */
async function probeText(page: Page): Promise<TextProbe> {
  return page.evaluate(
    ({ minText, minBody }) => {
      const byStyleUnder12: Record<string, number> = {};
      const byStyleBodyUnder14: Record<string, number> = {};
      const samples: string[] = [];
      const seen = new Set<Element>();
      let measured = 0;
      let under12 = 0;
      let bodyUnder14 = 0;
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const bump = (map: Record<string, number>, key: string) => {
        map[key] = (map[key] ?? 0) + 1;
      };
      const styleKey = (el: Element) => {
        const classes =
          typeof el.className === "string"
            ? el.className
                .trim()
                .split(/\s+/)
                .filter((name) => /^(text-|font-|leading-|tracking-)|^(pip|app|builder|tracker|wiki|guide|hub|season|summary|effect|perk|radar|tab|badge|chip|label|meta|note|caption|hint|help)/.test(name))
                .slice(0, 4)
                .join(".")
            : "";
        return `${el.tagName.toLowerCase()}${classes ? "." + classes : ""}`;
      };
      // Reading text: paragraphs, list items and table cells, plus plain inline text inside prose.
      // A span, badge or action link with its own size inside those is secondary text (12px floor).
      const isReadingText = (el: Element) => {
        if (el.matches("p, li, dd, blockquote, td, th")) return true;
        return el.matches("strong, em, b, i, code, small, mark") && Boolean(el.closest("p, li, dd, blockquote, td, th"));
      };
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const text = node.nodeValue?.replace(/\s+/g, " ").trim();
        if (!text) continue;
        const el = node.parentElement;
        if (!el || seen.has(el)) continue;
        if (el.closest('script, style, noscript, template, [aria-hidden="true"], .skip-link, nextjs-portal')) continue;
        const style = getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden" || parseFloat(style.opacity) === 0) continue;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        seen.add(el);
        measured += 1;
        const size = parseFloat(style.fontSize);
        const key = styleKey(el);
        if (size < minText) {
          under12 += 1;
          bump(byStyleUnder12, `${key} @${size.toFixed(1)}px`);
          if (samples.length < 12) samples.push(`${size.toFixed(1)}px ${key} "${text.slice(0, 40)}"`);
        } else if (size < minBody && isReadingText(el)) {
          bodyUnder14 += 1;
          bump(byStyleBodyUnder14, `${key} @${size.toFixed(1)}px`);
        }
      }
      const sortDesc = (map: Record<string, number>) =>
        Object.fromEntries(Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 25));
      return {
        measured,
        under12,
        bodyUnder14,
        under12ByStyle: sortDesc(byStyleUnder12),
        bodyUnder14ByStyle: sortDesc(byStyleBodyUnder14),
        samples,
      };
    },
    { minText: PHONE_MIN_TEXT_PX, minBody: PHONE_MIN_BODY_TEXT_PX }
  );
}

function writeReport(report: RouteReport, testInfo: TestInfo) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const slug = report.route.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "") || "home";
  const file = join(OUTPUT_DIR, `${report.project}--${slug}.json`);
  writeFileSync(file, JSON.stringify(report, null, 2));
  testInfo.attach(`a11y ${report.project} ${report.route}`, { path: file, contentType: "application/json" });
}

test.describe("accessibility (axe, WCAG 2.2 AA)", () => {
  test.describe.configure({ mode: "parallel" });

  test.beforeEach(async ({ context }) => {
    // Pin the visitor preferences the bootstrap script reads, so the run does not depend on the
    // calendar (Blood Moon auto-enables 15 Sep - 10 Nov) or on a previous run's storage.
    await context.addInitScript(() => {
      try {
        window.localStorage.setItem("roll-season", "off");
        window.localStorage.setItem("roll-theme", "dark");
        window.localStorage.setItem("roll-colorblind", "none");
        window.localStorage.setItem("roll-density", "compact");
      } catch {
        // storage unavailable: server defaults apply
      }
    });
  });

  for (const route of ROUTES) {
    test(`${route} has no serious axe violations (default + Blood Moon), readable on phones`, async ({ page }, testInfo) => {
      test.setTimeout(150_000);
      const project = testInfo.project.name;
      const isPhone = project === "mobile";

      await page.goto(route);
      await waitForRouteReady(page, route);

      const report: RouteReport = {
        project,
        route,
        url: page.url(),
        results: { default: [], "blood-moon": [] },
        incomplete: { default: 0, "blood-moon": 0 },
      };

      const defaultRun = await runAxe(page);
      report.results.default = summarize(defaultRun);
      report.incomplete.default = defaultRun.incomplete.length;

      await setSeason(page, "blood-moon");
      const seasonRun = await runAxe(page, ["color-contrast", "link-in-text-block"]);
      report.results["blood-moon"] = summarize(seasonRun);
      report.incomplete["blood-moon"] = seasonRun.incomplete.length;
      await setSeason(page, "default");

      if (isPhone) {
        report.text = await probeText(page);
        report.overflow = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        }));
      }

      writeReport(report, testInfo);

      if (REPORT_ONLY) return;

      const failures: string[] = [];
      for (const season of ["default", "blood-moon"] as const) {
        const blocking = report.results[season].filter(
          (violation) =>
            (violation.impact === "serious" || violation.impact === "critical") &&
            !isAllowed(violation, route, project, season)
        );
        if (blocking.length) failures.push(`[${season}]\n${describeViolations(blocking)}`);
      }
      if (isPhone && report.text) {
        if (report.text.under12 > 0) {
          failures.push(
            `[phone text] ${report.text.under12} of ${report.text.measured} visible text runs are under ${PHONE_MIN_TEXT_PX}px:\n` +
              Object.entries(report.text.under12ByStyle)
                .map(([style, count]) => `    - ${count}x ${style}`)
                .join("\n")
          );
        }
        if (report.text.bodyUnder14 > 0) {
          failures.push(
            `[phone text] ${report.text.bodyUnder14} reading-text runs (p/li/article) are under ${PHONE_MIN_BODY_TEXT_PX}px:\n` +
              Object.entries(report.text.bodyUnder14ByStyle)
                .map(([style, count]) => `    - ${count}x ${style}`)
                .join("\n")
          );
        }
      }
      if (isPhone && report.overflow && report.overflow.scrollWidth > report.overflow.innerWidth + 1) {
        failures.push(
          `[phone overflow] documentElement.scrollWidth=${report.overflow.scrollWidth}px > innerWidth=${report.overflow.innerWidth}px`
        );
      }

      expect(failures, `${project} ${route}\n${failures.join("\n\n")}`).toEqual([]);
    });
  }
});
