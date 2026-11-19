// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  DEFAULT_COMPLETION_DAYS,
  DEFAULT_GOOGLE_TAG_IDS,
  OPEN_SIGN_EMAIL_ACCENT,
  OPEN_SIGN_EMAIL_LOGO_URL,
  resolveRuntimeConfig
} from "./runtimeConfig";

// Centralized client defaults (issue #72): identical behavior, single source.
describe("centralized completion default", () => {
  it("keeps the 15-day completion default", () => {
    expect(DEFAULT_COMPLETION_DAYS).toBe(15);
  });
});

describe("centralized analytics defaults", () => {
  it("keeps the deployment Google tag IDs", () => {
    expect([...DEFAULT_GOOGLE_TAG_IDS]).toEqual([
      "G-BHNNETZRTY",
      "AW-17487135887"
    ]);
  });

  it("uses the centralized tag IDs when nothing is configured", () => {
    const config = resolveRuntimeConfig({ schemaVersion: 1 }, () => {});
    expect(config.analytics.googleTagIds).toEqual([...DEFAULT_GOOGLE_TAG_IDS]);
  });

  it("honors configured tag ID overrides", () => {
    const config = resolveRuntimeConfig(
      { schemaVersion: 1, analytics: { googleTagIds: ["G-OVERRIDE1"] } },
      () => {}
    );
    expect(config.analytics.googleTagIds).toEqual(["G-OVERRIDE1"]);
  });
});

describe("centralized mail brand fallbacks", () => {
  it("keeps the OpenSign logo and accent fallbacks", () => {
    expect(OPEN_SIGN_EMAIL_LOGO_URL).toBe(
      "https://qikinnovation.ams3.digitaloceanspaces.com/logo.png"
    );
    expect(OPEN_SIGN_EMAIL_ACCENT).toBe("#47a3ad");
  });

  it("falls back to the OpenSign product name by default", () => {
    const config = resolveRuntimeConfig(null, () => {});
    expect(config.productName).toBe("OpenSign™");
    expect(config.brandKey).toBe("opensign");
  });
});
