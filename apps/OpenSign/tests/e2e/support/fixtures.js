import { test as base, expect } from "@playwright/test";

/**
 * Test fixture that fails a test when the page throws an uncaught error.
 * Network 404s are ignored: the app requests optional resources.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await use(page);
    expect(pageErrors, "uncaught page errors").toEqual([]);
  }
});

export { expect };
