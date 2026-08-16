import { describe, expect, it } from "vitest";
import {
  isValidExternalUrl,
  normalizeExternalUrl,
  toSafeExternalUrl,
} from "./normalizeExternalUrl";

describe("strict external URL validation", () => {
  it.each([
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    "file:///etc/passwd",
    "https://user:password@example.com/path",
    'https://example.com/"><script>alert(1)</script>',
    "https://example.com/\u0000evil",
  ])("rejects unsafe or XSS-bearing URL %s", (value) => {
    expect(isValidExternalUrl(value)).toBe(false);
    expect(toSafeExternalUrl(value)).toBeNull();
  });

  it("accepts and canonicalizes only HTTP(S) links", () => {
    expect(normalizeExternalUrl("example.com/path")).toBe(
      "https://example.com/path",
    );
    expect(toSafeExternalUrl("example.com/path")).toBe(
      "https://example.com/path",
    );
    expect(toSafeExternalUrl("//example.com/path")).toBe(
      "https://example.com/path",
    );
    expect(toSafeExternalUrl("http://example.com")).toBe(
      "http://example.com/",
    );
  });
});
