import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * wrangler.toml is committed to a public repo, so its [vars] blocks must never hold secrets.
 * Secrets go through `wrangler secret put <NAME>` instead.
 */
const SECRET_NAME = /(SECRET|PASSWORD|TOKEN|PRIVATE|API_KEY|DATABASE_URL)/i;

describe("wrangler.toml", () => {
  const lines = readFileSync(join(process.cwd(), "wrangler.toml"), "utf8").split("\n");
  const assignments = lines
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.match(/^([A-Z0-9_]+)\s*=/)?.[1])
    .filter((name): name is string => Boolean(name));

  it("declares no secret-looking vars", () => {
    expect(assignments.filter((name) => SECRET_NAME.test(name))).toEqual([]);
  });

  it("does not grant admin through unverified email or placeholder usernames", () => {
    expect(assignments).not.toContain("ADMIN_EMAILS");
    const admins = lines.filter((l) => l.trim().startsWith("ADMIN_USERNAMES"));
    expect(admins.length).toBeGreaterThan(0);
    for (const line of admins) expect(line.toLowerCase()).not.toMatch(/\btest\b/);
  });
});
