import { describe, expect, it } from "vitest";
import { resolveMailFromSender } from "./mailUtils";

describe("resolveMailFromSender", () => {
  it("prefers the explicit sender name when present", () => {
    expect(
      resolveMailFromSender({
        senderName: "Contract Team",
        useNameAsSender: true,
        extUserName: "Owner Name",
        senderEmail: "owner@example.com"
      })
    ).toBe("Contract Team");
  });

  it("falls back to the owner name only when UseNameAsSender is enabled", () => {
    expect(
      resolveMailFromSender({
        senderName: "",
        useNameAsSender: true,
        extUserName: "Owner Name",
        senderEmail: "owner@example.com"
      })
    ).toBe("Owner Name");
  });

  it("falls back to the sender email when no sender name should be used", () => {
    expect(
      resolveMailFromSender({
        senderName: "",
        useNameAsSender: false,
        extUserName: "Owner Name",
        senderEmail: "owner@example.com"
      })
    ).toBe("owner@example.com");
  });
});
