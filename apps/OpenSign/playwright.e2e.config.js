import { defineConfig, devices } from "@playwright/test";

/**
 * Browser tests that run against an isolated stack (client, server and Mongo).
 * Every setting comes from the environment, see tests/e2e/README.md.
 */
const chromePath = process.env.E2E_CHROME_PATH;

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.pw.js",
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    ...devices["Desktop Chrome"],
    viewport: { width: 1366, height: 900 },
    launchOptions: chromePath ? { executablePath: chromePath } : {}
  }
});
