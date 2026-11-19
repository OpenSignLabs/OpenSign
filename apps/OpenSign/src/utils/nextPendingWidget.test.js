// @vitest-environment node
import { describe, expect, it } from "vitest";
globalThis.window = globalThis.window || {
  RUNTIME_ENV: {},
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  location: { origin: "http://localhost", pathname: "/", search: "" },
  navigator: { userAgent: "" }
};
const utils = await import("../constant/Utils");

const item = (key, response, extra = {}) => ({
  key,
  options: { response },
  ...extra
});

describe("next pending widget", () => {
  it("skips answered fields and preserves page order after the current field", () => {
    const pages = [
      { pageNumber: 1, pos: [item("before", ""), item("current", "done"), item("checked", [0])] },
      { pageNumber: 2, pos: [item("signed", "", { SignUrl: "signed" }), item("next", "")] }
    ];
    expect(utils.nextPendingWidget(pages, "current")).toMatchObject({
      pageNumber: 2,
      widget: { key: "next" }
    });
  });
  it("wraps to the beginning and ignores read-only fields", () => {
    const pages = [{ pageNumber: 1, pos: [item("first", ""), item("current", "done"), { key: "locked", options: { isReadOnly: true } }] }];
    expect(utils.nextPendingWidget(pages, "current").widget.key).toBe("first");
  });
  it("returns no field when all are answered or read-only", () => {
    const pages = [{ pageNumber: 1, pos: [item("current", "done"), item("zero", 0), item("checked", [0])] }];
    expect(utils.nextPendingWidget(pages, "current")).toBeNull();
  });
});
