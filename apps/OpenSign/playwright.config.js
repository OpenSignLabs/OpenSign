import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  testMatch: "**/*.pw.js",
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:4179",
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"]
  },
  webServer: {
    command: "npm run start-dev -- --host 127.0.0.1 --port 4179",
    url: "http://127.0.0.1:4179/tests/browser/tour-fixture.html",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
