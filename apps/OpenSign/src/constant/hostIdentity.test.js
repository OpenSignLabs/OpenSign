// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  LOCALHOST_HOSTNAMES,
  isOpenSignFirstPartyOrigin,
  isReservedFirstPartyOrigin
} from "./hostIdentity";

// Single shared localhost list (issue #72): identical behavior, one source.
describe("LOCALHOST_HOSTNAMES", () => {
  it("covers loopback names", () => {
    expect([...LOCALHOST_HOSTNAMES]).toEqual([
      "localhost",
      "127.0.0.1",
      "::1"
    ]);
    expect(Object.isFrozen(LOCALHOST_HOSTNAMES)).toBe(true);
  });

  it("treats loopback origins as first-party only when asked", () => {
    expect(isOpenSignFirstPartyOrigin("http://localhost:3000", true)).toBe(true);
    expect(isOpenSignFirstPartyOrigin("http://localhost:3000")).toBe(false);
    expect(isReservedFirstPartyOrigin("http://127.0.0.1:3000", true)).toBe(
      true
    );
  });

  it("rejects origins that are neither first-party nor loopback", () => {
    expect(isOpenSignFirstPartyOrigin("http://localhost:3000")).toBe(false);
    expect(isOpenSignFirstPartyOrigin("not-a-url", true)).toBe(false);
    expect(isOpenSignFirstPartyOrigin("https://evil.example.com", true)).toBe(
      false
    );
  });
});
