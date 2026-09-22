import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

/** True when git would ignore the path (exit 0 from check-ignore). */
function ignored(path: string): boolean {
  try {
    execFileSync("git", ["check-ignore", "-q", "--no-index", path], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

describe(".gitignore", () => {
  it("ignores secret and editor MCP files", () => {
    for (const path of [".env", ".env.local", ".env.production", ".dev.vars", "server.pem", "cloud.key", ".cursor/mcp.json", ".mcp.json"]) {
      expect(ignored(path), path).toBe(true);
    }
  });

  it("tracks no secret or editor MCP file (an ignore rule never untracks what was committed before it)", () => {
    const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
    const leaks = tracked.filter(
      (path) =>
        /(^|\/)\.env($|\.)/.test(path) && path !== ".env.example" ||
        /\.(pem|key|p12)$/.test(path) ||
        /(^|\/)(\.cursor\/mcp\.json|\.vscode\/mcp\.json|\.mcp\.json|\.gemini\/settings\.json|\.dev\.vars.*)$/.test(path)
    );
    expect(leaks).toEqual([]);
  });

  it("never hides source files or assets whose names merely mention tokens or secrets", () => {
    for (const path of [
      ".env.example",
      "src/lib/builder/edit-token.ts",
      "src/lib/auth/session-token.ts",
      "src/lib/secrets-plan.ts",
      "public/images/in_game_cards/secret_agent.png",
      "src/components/credential-form.tsx"
    ]) {
      expect(ignored(path), path).toBe(false);
    }
  });
});
