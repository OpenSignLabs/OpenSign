// @vitest-environment node
// Characterization + spec tests for #60:
// - checkbox, radio and dropdown edit in place (inline allowlist)
// - radio stays interactive under canEditInline and persists through the
//   same onChangeInput path the checkbox uses
// - signature, stamp, initials and image stay on the modal
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (name) => fs.readFileSync(path.join(here, name), "utf8");

globalThis.window = globalThis.window || {
  innerWidth: 1280,
  devicePixelRatio: 1,
  RUNTIME_ENV: {},
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  location: { origin: "http://localhost", pathname: "/", search: "" },
  navigator: { userAgent: "vitest" }
};

const { onChangeInput } = await import("../../constant/utils/widgetInput.js");

// Every `inlineTypes = [...]` block in Placeholder.jsx.
const inlineBlocks = () => {
  const src = read("Placeholder.jsx");
  const blocks = [...src.matchAll(/inlineTypes\s*=\s*\[([\s\S]*?)\]/g)].map(
    (m) => m[1]
  );
  expect(blocks.length, "Placeholder.jsx defines inline allowlists").toBeGreaterThan(0);
  return blocks;
};

describe("#60 inline allowlist", () => {
  it("edits checkbox, radio and dropdown in place", () => {
    for (const block of inlineBlocks()) {
      expect(block.includes('"checkbox"'), "checkbox is inline").toBe(true);
      expect(block.includes('"dropdown"'), "dropdown is inline").toBe(true);
      expect(
        block.includes("radioButtonWidget"),
        "radio button is inline"
      ).toBe(true);
    }
  });

  it("keeps signature, stamp, initials and image on the modal", () => {
    for (const block of inlineBlocks()) {
      for (const modal of ['"signature"', '"stamp"', '"initials"', '"image"']) {
        expect(block.includes(modal), `${modal} stays modal`).toBe(false);
      }
    }
  });
});

describe("#60 radio mirrors checkbox persistence", () => {
  it("radio input persists through persistInlineValue/onChangeInput", () => {
    const src = read("PlaceholderTypeRadio.jsx");
    expect(src.includes("persistInlineValue("), "radio calls persist").toBe(true);
    expect(src.includes("if (!canEditInline) return;"), "radio gated").toBe(true);
  });

  it("dropdown renders an inline select under canEditInline", () => {
    const src = read("PlaceholderTypeFields.jsx");
    expect(src.includes("canEditInline ? ("), "dropdown inline branch").toBe(true);
    expect(src.includes("<select"), "dropdown select rendered").toBe(true);
  });

  const radioPos = (key) => ({
    key,
    type: "radio button",
    options: { values: ["Yes", "No"] }
  });

  // Self-sign path: positions live directly on the page entry.
  const persistSelfSign = (value, pos) => {
    const xyPosition = [{ pos: [{ ...pos, options: { ...pos.options } }] }];
    let updater;
    onChangeInput(value, pos, xyPosition, 0, (u) => (updater = u), "user-1");
    return updater(xyPosition)[0].pos[0].options.response;
  };

  it("stores the picked radio option as the response", () => {
    expect(persistSelfSign("Yes", radioPos("r1"))).toBe("Yes");
  });

  it("stores the checkbox selection through the same path", () => {
    const pos = { key: "c1", type: "checkbox", options: { values: ["a", "b"] } };
    expect(persistSelfSign([1], pos)).toEqual([1]);
  });
});
