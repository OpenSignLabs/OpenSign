import { readEnv } from "./env.js";

/**
 * Log in through the login form.
 * @param {import("@playwright/test").Page} page Browser page.
 * @param {string} [email] Account email, the admin by default.
 * @returns {Promise<void>} Resolves on the dashboard.
 */
export const login = async (page, email) => {
  const env = readEnv();
  await page.goto("/");
  await page.locator("input[type=email], input[name=email], input#email").first().fill(email || env.E2E_ADMIN_EMAIL);
  await page.locator("input[type=password]").fill(env.E2E_ADMIN_PASSWORD);
  await page.keyboard.press("Enter");
  await page.waitForURL(/\/dashboard\//);
};

/**
 * Log in as the admin user.
 * @param {import("@playwright/test").Page} page Browser page.
 * @returns {Promise<void>} Resolves on the dashboard.
 */
export const loginAsAdmin = (page) => login(page);
