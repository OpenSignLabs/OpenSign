// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { readFile } from "node:fs/promises";
import { PDFDocument, PDFRadioGroup } from "pdf-lib";

vi.mock("../constant/runtimeConfig", async (importOriginal) => ({
  ...(await importOriginal()),
  getRuntimePdfFontUrl: () => "https://example.invalid/test-font"
}));
globalThis.window = globalThis.window || {
  innerWidth: 1024,
  RUNTIME_ENV: {},
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  location: { origin: "http://localhost", pathname: "/", search: "" },
  navigator: { userAgent: "" }
};
const { embedWidgetsToDoc } = await import("../constant/Utils");

describe("PDF radio options", () => {
  it.each([
    ["imported object response", { name: "Yes" }, undefined, "Yes"],
    ["string response", "Yes", undefined, "Yes"],
    ["default without response", undefined, "No", "No"],
    ["stale response", "old", undefined, null],
    ["NaN response", NaN, undefined, null],
    ["malformed response", {}, undefined, null],
    ["missing response", undefined, undefined, null]
  ])("embeds %s safely in a real PDF", async (_label, response, defaultValue, expected) => {
    const bytes = await readFile("node_modules/pdfjs-dist/standard_fonts/LiberationSans-Regular.ttf");
    vi.stubGlobal("fetch", vi.fn(async () => ({ arrayBuffer: async () => bytes })));
    const select = vi.spyOn(PDFRadioGroup.prototype, "select");
    try {
      const pdf = await PDFDocument.create();
      pdf.addPage([612, 792]);
      const widgets = [{ pageNumber: 1, pos: [{
        key: "radio-1", type: "radio button", xPosition: 40, yPosition: 100,
        Width: 180, Height: 60, options: {
          values: [{ name: "Yes", checked: true }, { name: "No", checked: false }],
          response, defaultValue, fontSize: 12, fontColor: "black"
        }
      }] }];
      const result = await embedWidgetsToDoc(widgets, pdf, true, 1, []);
      expect(result).toBeTypeOf("string");
      if (expected === null) expect(select).not.toHaveBeenCalled();
      else expect(select).toHaveBeenCalledWith(expected);
      const saved = await PDFDocument.load(result);
      expect(saved.getPageCount()).toBe(1);
    } finally {
      select.mockRestore();
      vi.unstubAllGlobals();
    }
  });
});
