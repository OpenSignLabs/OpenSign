import { test, expect } from "./support/fixtures.js";
import { createSignerDocument } from "./support/parse.js";
import { openSigner } from "./support/signer.js";
import { dateWidget } from "./support/widgets.js";

/**
 * Chunk file names are hashed, so the bundle split is checked by grepping
 * the loaded JS bodies for the react-datepicker marker (the package.json
 * version string also mentions the library name, so the bare name would
 * match everywhere) and the pdf-lib PDFDocument marker. Only JS bodies
 * are grepped: the project theme (index.css) holds a few datepicker
 * overrides by design. Network requests are watched too, so any
 * separately fetched DatePicker file or PDF worker fails the login test.
 */
const watchBundles = (page, state) => {
  page.on("response", async (response) => {
    try {
      const path = response.url().split("?")[0];
      if (/\.m?js$/.test(path)) {
        // Redirects are followed by the browser (for example the
        // http->https hop of the CDN worker under an http preview),
        // so only 4xx/5xx responses count as failed chunks.
        if (response.status() >= 400) {
          state.failedChunks.push(`${response.status()} ${response.url()}`);
        } else {
          state.bodies.push(await response.text());
        }
      }
    } catch (e) {
      // Ignore aborted or redirected bodies.
    }
  });
  page.on("request", (request) => {
    if (/pdf\.worker/i.test(request.url())) {
      state.workerRequests.push(request.url());
    }
    if (/datepicker/i.test(request.url())) {
      state.datepickerRequests.push(request.url());
    }
  });
  page.on("console", (message) => {
    // "Failed to load resource" echoes a network failure the response
    // watcher already records; the app also requests optional resources
    // (the fixture ignores their 404s too).
    if (
      message.type() === "error" &&
      !/ResizeObserver loop/.test(message.text()) &&
      !/^Failed to load resource/.test(message.text())
    ) {
      state.consoleErrors.push(message.text());
    }
  });
};

const bundleState = () => ({
  bodies: [],
  workerRequests: [],
  datepickerRequests: [],
  failedChunks: [],
  consoleErrors: []
});

const expectCleanLoad = (state, where) => {
  expect(state.failedChunks, `a JS chunk fails to load on ${where}`).toEqual(
    []
  );
  expect(state.consoleErrors, `console errors on ${where}`).toEqual([]);
};

const bundleText = (state) => state.bodies.join("\n");

test("the login page loads without the PDF editor bundle (#55)", async ({
  page
}) => {
  const state = bundleState();
  watchBundles(page, state);
  await page.goto("/");
  await expect(
    page.locator("input[type=email], input[name=email], input#email").first()
  ).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(
    bundleText(state),
    "login bundle contains react-datepicker code"
  ).not.toContain("react-datepicker__");
  expect(bundleText(state), "login bundle contains pdf-lib code").not.toContain(
    "PDFDocument"
  );
  expect(state.workerRequests, "login page requests the PDF worker").toEqual(
    []
  );
  expect(
    state.datepickerRequests,
    "login page requests a DatePicker file"
  ).toEqual([]);
  expectCleanLoad(state, "the login page");
});

test("the signer page loads the PDF bundle on demand (#55)", async ({
  page
}) => {
  const ids = await createSignerDocument({
    name: "e2e bundle",
    pages: [{ pageNumber: 1, pos: [dateWidget("when", 700)] }]
  });
  const state = bundleState();
  watchBundles(page, state);
  await openSigner(page, ids);
  const input = page.locator(".react-datepicker-wrapper input").first();
  await input.scrollIntoViewIfNeeded();
  await input.click();
  await expect(page.locator(".react-datepicker").first()).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(
    bundleText(state),
    "signer page never loads react-datepicker code"
  ).toContain("react-datepicker__");
  expect(bundleText(state), "signer page never loads pdf-lib code").toContain(
    "PDFDocument"
  );
  expectCleanLoad(state, "the signer page");
});
