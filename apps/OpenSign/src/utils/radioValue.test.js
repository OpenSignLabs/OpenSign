// @vitest-environment node
import { describe, expect, it } from "vitest";
globalThis.window = globalThis.window || {
  RUNTIME_ENV: {},
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  location: { origin: "http://localhost", pathname: "/", search: "" },
  navigator: { userAgent: "" }
};
const utils = await import("../constant/Utils");

describe("radio selection", () => {
  it("compares normalized string values", () => {
    expect(utils.isRadioSelected("  Yes ", "Yes")).toBe(true);
    expect(utils.isRadioSelected("No", "Yes")).toBe(false);
  });
  it("accepts imported option objects", () => {
    expect(utils.isRadioSelected({ name: "Yes", checked: true }, { name: "Yes" })).toBe(true);
  });
  it("handles array and absent defaults without throwing", () => {
    expect(utils.isRadioSelected([{ name: "Yes", checked: true }], "Yes")).toBe(true);
    expect(utils.isRadioSelected(undefined, "Yes")).toBe(false);
  });
});
