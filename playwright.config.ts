import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for guest (signed-out) smoke tests.
 * Runs against a local `next dev` server unless E2E_BASE_URL is set.
 */
export default defineConfig({
  testDir: "e2e",
  retries: 1,
  reporter: "list",
  outputDir: "e2e/.output",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    reducedMotion: "reduce",
    screenshot: "only-on-failure"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 360, height: 800 }
      }
    }
  ],
  webServer: {
    command: "npm run dev",
    url: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000
  }
});
