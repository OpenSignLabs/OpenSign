import fs from "node:fs";
import path from "node:path";

const PDFJS_DIR = path.resolve("node_modules/pdfjs-dist/build");
const ORIGIN = "https://e2e-render.invalid";

/** Page that loads pdf.js as a module and exposes a render helper. */
const HTML = `<!doctype html><html><body><canvas id="c"></canvas><script type="module">
import * as pdfjs from "${ORIGIN}/pdf.min.mjs";
pdfjs.GlobalWorkerOptions.workerSrc = "${ORIGIN}/pdf.worker.min.mjs";
window.renderPage = async (scale) => {
  const pdf = await pdfjs.getDocument("${ORIGIN}/doc.pdf").promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale });
  const canvas = document.getElementById("c");
  canvas.width = viewport.width; canvas.height = viewport.height;
  await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
  return { width: viewport.width, height: viewport.height };
};
window.findText = async (labels, scale) => {
  const pdf = await pdfjs.getDocument("${ORIGIN}/doc.pdf").promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale });
  const { items } = await page.getTextContent();
  return labels.map((label) => {
    const item = items.find((i) => i.str.trim() === label);
    if (!item) return null;
    const [x, y] = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
    return { x, y, size: Math.hypot(item.transform[2], item.transform[3]) * scale };
  });
};
window.darkness = (x, y, w, h) => {
  const data = document.getElementById("c").getContext("2d").getImageData(x, y, w, h).data;
  let dark = 0;
  for (let i = 0; i < data.length; i += 4) if (data[i] + data[i + 1] + data[i + 2] < 300) dark += 1;
  return dark / (w * h);
};
window.ready = true;
</script></body></html>`;

/**
 * Render page 1 of a PDF and measure how much of the radio circle left of each label is dark.
 * The circle is drawn just left of its label (see pdfWidgetDrawing.js), so the label
 * position found by pdf.js locates it without copying the layout math.
 * @param {import("@playwright/test").Browser} browser Playwright browser.
 * @param {Uint8Array} pdfBytes PDF content.
 * @param {string[]} labels Radio option labels.
 * @param {number} [scale] Render scale.
 * @returns {Promise<Array<number|null>>} Share of dark pixels per circle, null if the label is absent.
 */
export const measureRadioMarks = async (browser, pdfBytes, labels, scale = 3) => {
  const page = await browser.newPage();
  try {
    await page.route(`${ORIGIN}/**`, (route) => {
      const name = new URL(route.request().url()).pathname.slice(1);
      if (name === "index.html") return route.fulfill({ contentType: "text/html", body: HTML });
      if (name === "doc.pdf") return route.fulfill({ contentType: "application/pdf", body: Buffer.from(pdfBytes) });
      return route.fulfill({ contentType: "text/javascript", body: fs.readFileSync(path.join(PDFJS_DIR, name)) });
    });
    await page.goto(`${ORIGIN}/index.html`);
    await page.waitForFunction(() => window.ready === true);
    await page.evaluate((s) => window.renderPage(s), scale);
    const found = await page.evaluate(({ l, s }) => window.findText(l, s), { l: labels, s: scale });
    const marks = [];
    for (const label of found) {
      if (!label) { marks.push(null); continue; }
      // The circle spans [x - (size + 3), x - 3] horizontally and sits on the baseline.
      const inner = label.size * 0.4;
      const cx = label.x - label.size * 0.5 - 3 * scale;
      const cy = label.y - label.size * 0.35;
      marks.push(await page.evaluate((b) => window.darkness(b.x, b.y, b.w, b.h), {
        x: Math.round(cx - inner / 2), y: Math.round(cy - inner / 2), w: Math.round(inner), h: Math.round(inner)
      }));
    }
    return marks;
  } finally {
    await page.close();
  }
};
