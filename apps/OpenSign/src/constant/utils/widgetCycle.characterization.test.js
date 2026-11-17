// @vitest-environment node
// Characterization + spec tests for #68:
// - lock the observable behavior of UtilsPart04 / UtilsPart08
// - specify the dependency-free cycle break (Part04 <-> Part08)
// - lock the facade export names (constant/Utils.js)
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (name) => fs.readFileSync(path.join(here, name), "utf8");

// Minimal browser stubs: UtilsPart01 reads window.innerWidth at import time.
globalThis.window = globalThis.window || {
  innerWidth: 1280,
  devicePixelRatio: 1,
  RUNTIME_ENV: {},
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  location: { origin: "http://localhost", pathname: "/", search: "" },
  navigator: { userAgent: "vitest" }
};

const Part04 = await import("./UtilsPart04.js");
const Part08 = await import("./UtilsPart08.js");

describe("#68 facade exports stay unchanged", () => {
  it("keeps every Part04/Part08 export name in constant/Utils.js", () => {
    const facade = fs.readFileSync(
      path.join(here, "..", "Utils.js"),
      "utf8"
    );
    for (const name of [
      "defaultWidthHeight",
      "arrayBufferToBase64",
      "getBase64FromIMG",
      "convertPNGtoJPEG",
      "handleSignYourselfWidgetResize",
      "onChangeHeightOfTextArea",
      "calculateInitialWidthHeight",
      "widgetDataValue",
      "addInitialData",
      "embedDocId",
      "convertTextToImg"
    ]) {
      expect(facade.includes(name), `facade still exports ${name}`).toBe(true);
    }
  });
});

describe("#68 dependency-free cycle break", () => {
  it("UtilsPart04 no longer imports UtilsPart08", () => {
    expect(/from\s+["']\.\/UtilsPart08(\.js)?["']/.test(read("UtilsPart04.js"))).toBe(
      false
    );
  });

  it("UtilsPart08 no longer imports UtilsPart04", () => {
    expect(/from\s+["']\.\/UtilsPart04(\.js)?["']/.test(read("UtilsPart08.js"))).toBe(
      false
    );
  });

  it("both sides share one dependency-free primitive module", () => {
    const names = fs.readdirSync(here);
    const primitive = names.find(
      (n) =>
        /^widget[A-Za-z]*\.js$/.test(n) &&
        !n.startsWith("widgetUtils") &&
        read(n).includes("defaultWidthHeight") &&
        !/from\s+["']\.\/UtilsPart(0[2-9]|1[0-9]|2[0-2])(\.js)?["']/.test(
          read(n)
        ) &&
        !/from\s+["']\.\/UtilsPart0[48](\.js)?["']/.test(read(n))
    );
    expect(
      primitive,
      "a dependency-free widget primitive module exists"
    ).toBeTruthy();
  });

  it("the leaf constant module imports no widget part (acyclic base)", () => {
    expect(/from\s+["']\.\/UtilsPart/.test(read("UtilsPart01.js"))).toBe(false);
  });
});

describe("#68 defaultWidthHeight behavior", () => {
  it("sizes signature, checkbox, dropdown, initials and image", () => {
    expect(Part04.defaultWidthHeight("signature")).toEqual({
      width: 150,
      height: 60
    });
    expect(Part04.defaultWidthHeight("checkbox")).toEqual({
      width: 15,
      height: 19
    });
    expect(Part04.defaultWidthHeight("dropdown")).toEqual({
      width: 120,
      height: 22
    });
    expect(Part04.defaultWidthHeight("initials")).toEqual({
      width: 50,
      height: 50
    });
    expect(Part04.defaultWidthHeight("image")).toEqual({
      width: 70,
      height: 70
    });
  });

  it("falls back to 150x60 for unknown types", () => {
    expect(Part04.defaultWidthHeight("nope")).toEqual({
      width: 150,
      height: 60
    });
  });
});

describe("#68 arrayBufferToBase64 behavior", () => {
  it("encodes bytes to base64", () => {
    const bytes = new Uint8Array([72, 105]);
    expect(Part04.arrayBufferToBase64(bytes.buffer)).toBe("SGk=");
  });
});

describe("#68 handleSignYourselfWidgetResize behavior", () => {
  const xyPosition = [
    {
      pos: [
        { key: "a", Width: 10, Height: 10, options: {} },
        { key: "b", Width: 10, Height: 10, options: {} }
      ]
    }
  ];

  it("resizes only the targeted widget and flags IsResize", () => {
    let next;
    Part04.handleSignYourselfWidgetResize(
      { offsetWidth: 300, offsetHeight: 120 },
      "b",
      xyPosition,
      (v) => (next = v),
      0,
      2
    );
    expect(next[0].pos[0].key).toBe("a");
    expect("IsResize" in next[0].pos[0]).toBe(false);
    expect(next[0].pos[1]).toMatchObject({
      key: "b",
      Width: 150,
      Height: 60,
      IsResize: true
    });
  });

  it("ignores an invalid index without calling the setter", () => {
    let called = false;
    Part04.handleSignYourselfWidgetResize(
      { offsetWidth: 300, offsetHeight: 120 },
      "b",
      xyPosition,
      () => (called = true),
      5,
      1
    );
    expect(called).toBe(false);
  });
});

describe("#68 onChangeHeightOfTextArea behavior", () => {
  it("grows the targeted widget in the self-sign path", () => {
    const xyPosition = [{ pos: [{ key: "k", Height: 20 }] }];
    let next;
    Part08.onChangeHeightOfTextArea(
      5,
      "text",
      "k",
      xyPosition,
      0,
      (v) => (next = v)
    );
    expect(next[0].pos[0].Height).toBe(25);
  });

  it("falls back to the default height when none is stored", () => {
    const xyPosition = [{ pos: [{ key: "k" }] }];
    let next;
    Part08.onChangeHeightOfTextArea(
      5,
      "checkbox",
      "k",
      xyPosition,
      0,
      (v) => (next = v)
    );
    expect(next[0].pos[0].Height).toBe(19 + 5);
  });
});

describe("#68 widgetDataValue behavior", () => {
  it("maps profile fields case-insensitively", () => {
    expect(Part08.widgetDataValue("name", { Name: "Ada" })).toBe("Ada");
    expect(Part08.widgetDataValue("email", { email: "a@b.c" })).toBe("a@b.c");
    expect(Part08.widgetDataValue("job title", { JobTitle: "Eng" })).toBe("Eng");
  });

  it("returns an empty string for unknown types", () => {
    expect(Part08.widgetDataValue("signature", {})).toBe("");
  });
});
