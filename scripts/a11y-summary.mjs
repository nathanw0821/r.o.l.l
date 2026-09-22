#!/usr/bin/env node
/**
 * Turns the JSON written by e2e/a11y.spec.ts (e2e/a11y-report/*.json) into Markdown tables
 * for the worklog: violations by rule and page, then the phone text-size counts.
 *
 *   A11Y_REPORT=1 npx playwright test e2e/a11y.spec.ts && node scripts/a11y-summary.mjs
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), "e2e", "a11y-report");
const reports = readdirSync(dir)
  .filter((name) => name.endsWith(".json"))
  .map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")))
  .sort((a, b) => a.project.localeCompare(b.project) || a.route.localeCompare(b.route));

const IMPACT_ORDER = { critical: 0, serious: 1, moderate: 2, minor: 3 };

// rule -> { impact, help, byPage: Map<"project route", nodes> }
const byRule = new Map();
for (const report of reports) {
  for (const season of ["default", "blood-moon"]) {
    for (const violation of report.results[season] ?? []) {
      const key = season === "default" ? violation.id : `${violation.id} [blood-moon]`;
      const entry = byRule.get(key) ?? { impact: violation.impact, help: violation.help, byPage: new Map(), nodes: 0 };
      const pageKey = `${report.project} ${report.route}`;
      entry.byPage.set(pageKey, (entry.byPage.get(pageKey) ?? 0) + violation.nodes);
      entry.nodes += violation.nodes;
      byRule.set(key, entry);
    }
  }
}

const rules = [...byRule.entries()].sort(
  (a, b) => IMPACT_ORDER[a[1].impact] - IMPACT_ORDER[b[1].impact] || b[1].nodes - a[1].nodes
);

console.log(`Routes checked: ${new Set(reports.map((r) => r.route)).size} × projects ${[...new Set(reports.map((r) => r.project))].join(", ")}\n`);
console.log("| Rule | Impact | Pages | Nodes | Where (project route: nodes) |");
console.log("| :--- | :--- | ---: | ---: | :--- |");
for (const [rule, entry] of rules) {
  const where = [...entry.byPage.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([page, nodes]) => `${page}: ${nodes}`)
    .join("; ");
  console.log(`| \`${rule}\` | ${entry.impact} | ${entry.byPage.size} | ${entry.nodes} | ${where} |`);
}
if (!rules.length) console.log("| (none) | | | | |");

const serious = rules.filter(([, e]) => e.impact === "serious" || e.impact === "critical");
console.log(`\nSerious/critical rules: ${serious.length}; total violating nodes: ${serious.reduce((n, [, e]) => n + e.nodes, 0)}`);

const phone = reports.filter((r) => r.text);
if (phone.length) {
  console.log("\n| Route (360 px) | Text runs | < 12 px | Reading text < 14 px | Overflow | Top small styles |");
  console.log("| :--- | ---: | ---: | ---: | :--- | :--- |");
  for (const report of phone) {
    const overflow =
      report.overflow && report.overflow.scrollWidth > report.overflow.innerWidth + 1
        ? `${report.overflow.scrollWidth}>${report.overflow.innerWidth}`
        : "no";
    const top = Object.entries(report.text.under12ByStyle)
      .slice(0, 3)
      .map(([style, count]) => `${count}× ${style}`)
      .join("; ");
    console.log(
      `| \`${report.route}\` | ${report.text.measured} | ${report.text.under12} | ${report.text.bodyUnder14} | ${overflow} | ${top} |`
    );
  }
}
