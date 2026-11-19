// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import {
  OPEN_SIGN_EMAIL_ACCENT,
  OPEN_SIGN_EMAIL_LOGO_URL
} from "./runtimeConfig";

globalThis.window = globalThis.window || {};

// Mail brand fallbacks (issue #72): identical behavior through shared config.
describe("resolveMailBrandPresentation", () => {
  afterEach(() => {
    delete globalThis.window.RUNTIME_CONFIG;
    delete globalThis.window.location;
  });

  it("falls back to the centralized OpenSign brand", async () => {
    const { resolveMailBrandPresentation } = await import("./mailBrand");
    const presentation = resolveMailBrandPresentation("");
    expect(presentation.appName).toBe("OpenSign™");
    expect(presentation.logoUrl).toBe(OPEN_SIGN_EMAIL_LOGO_URL);
    expect(presentation.accentColor).toBe(OPEN_SIGN_EMAIL_ACCENT);
  });

  it("honors the deployment brand from runtime config", async () => {
    globalThis.window.RUNTIME_CONFIG = {
      schemaVersion: 1,
      brandKey: "acme",
      productName: "Acme Sign",
      assets: { logoUrl: "https://acme.example/logo.png" },
      theme: { emailAccent: "#123456" }
    };
    const { resolveMailBrandPresentation } = await import("./mailBrand");
    const presentation = resolveMailBrandPresentation("");
    expect(presentation.appName).toBe("Acme Sign");
    expect(presentation.logoUrl).toBe("https://acme.example/logo.png");
    expect(presentation.accentColor).toBe("#123456");
  });
});
