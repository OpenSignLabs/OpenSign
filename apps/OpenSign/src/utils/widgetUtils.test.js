// @vitest-environment node
import { describe, it, expect } from "vitest";
import { sanitizeFileName } from "./sanitizeFileName";

// widgetUtils pulls in the app configuration, which reads window on import.
// A minimal stub keeps this suite free of a DOM implementation.
globalThis.window = globalThis.window || {
  RUNTIME_ENV: {},
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  location: { origin: "http://localhost", pathname: "/", search: "" },
  navigator: { userAgent: "" },
};

const {
  getInitials,
  isValidBase64,
  hasSignatureWidget,
  hasDuplicateWidgetNames,
  applyNumberFormulasToPages
} = await import("./widgetUtils");

describe("sanitizeFileName", () => {
  it("keeps letters, digits, dots, dashes and underscores", () => {
    expect(sanitizeFileName("contract_v2-final.pdf")).toBe("contract_v2-final.pdf");
  });

  it("removes spaces and path separators", () => {
    expect(sanitizeFileName("../my file.pdf")).toBe("myfile.pdf");
    expect(sanitizeFileName("a/b\\c.pdf")).toBe("abc.pdf");
  });

  it("keeps only the last dot", () => {
    expect(sanitizeFileName("a.b.c.pdf")).toBe("abc.pdf");
  });

  it("tolerates an empty value", () => {
    expect(sanitizeFileName("")).toBe("");
    expect(sanitizeFileName(undefined)).toBeUndefined();
  });
});

describe("getInitials", () => {
  it("takes the initial of the first two words", () => {
    expect(getInitials("Ada Lovelace")).toBe("A L");
  });

  it("takes the first letter of a single word", () => {
    expect(getInitials("Ada")).toBe("A");
  });

  it("tolerates an empty value", () => {
    expect(getInitials("")).toBe("");
    expect(getInitials(null)).toBe("");
  });
});

describe("isValidBase64", () => {
  it("accepts a valid base64 string", () => {
    expect(isValidBase64("SGVsbG8=")).toBe(true);
  });

  it("accepts a data URI", () => {
    expect(isValidBase64("data:image/png;base64,SGVsbG8=")).toBe(true);
  });

  it("rejects plain text and empty values", () => {
    expect(isValidBase64("not base64 !!")).toBe(false);
    expect(isValidBase64("")).toBe(false);
  });
});

describe("hasSignatureWidget", () => {
  const withSignature = {
    placeHolder: [{ pos: [{ type: "signature" }] }]
  };
  const withTextOnly = { placeHolder: [{ pos: [{ type: "text" }] }] };

  it("detects a signature widget in the signer placeholders", () => {
    expect(hasSignatureWidget(withSignature)).toBe(true);
  });

  it("returns false when the signer only has text widgets", () => {
    expect(hasSignatureWidget(withTextOnly)).toBe(false);
  });

  it("returns false for a signer without placeholders", () => {
    expect(hasSignatureWidget({})).toBe(false);
    expect(hasSignatureWidget({ placeHolder: [] })).toBe(false);
  });
});

describe("hasDuplicateWidgetNames", () => {
  it("ignores repetitions inside the same signer", () => {
    const placeholders = [
      { placeHolder: [{ pos: [{ options: { name: "a" } }, { options: { name: "a" } }] }] }
    ];
    expect(hasDuplicateWidgetNames(placeholders)).toBe(false);
  });

  it("detects a name shared by two signers", () => {
    const placeholders = [
      { placeHolder: [{ pos: [{ options: { name: "a" } }] }] },
      { placeHolder: [{ pos: [{ options: { name: "a" } }] }] }
    ];
    expect(hasDuplicateWidgetNames(placeholders)).toBe(true);
  });

  it("accepts distinct names and widgets without a name", () => {
    const placeholders = [
      { placeHolder: [{ pos: [{ options: { name: "a" } }] }] },
      { placeHolder: [{ pos: [{ options: {} }] }] },
      { placeHolder: [{ pos: [{ options: { name: "b" } }] }] }
    ];
    expect(hasDuplicateWidgetNames(placeholders)).toBe(false);
  });
});

describe("applyNumberFormulasToPages", () => {
  it("returns a deep clone instead of mutating the caller data", () => {
    const pages = [{ pos: [{ options: { response: "keep" } }] }];
    const result = applyNumberFormulasToPages(pages);
    expect(result).not.toBe(pages);
    expect(result[0]).not.toBe(pages[0]);
    expect(result[0].pos[0]).not.toBe(pages[0].pos[0]);
    expect(result[0].pos[0].options).not.toBe(pages[0].pos[0].options);
  });

  it("preserves the widget options", () => {
    const pages = [{ pos: [{ options: { response: "keep" } }] }];
    expect(applyNumberFormulasToPages(pages)[0].pos[0].options.response).toBe("keep");
  });

  it("returns empty and non-array input untouched", () => {
    expect(applyNumberFormulasToPages([])).toEqual([]);
    expect(applyNumberFormulasToPages(null)).toBe(null);
  });
});
