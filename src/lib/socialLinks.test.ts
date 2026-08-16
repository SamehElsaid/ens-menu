import { describe, expect, it } from "vitest";
import { normalizeSocialLink, normalizeSocialLinks } from "./socialLinks";

describe("social link persistence", () => {
  it.each([
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    'https://example.com/"><img src=x onerror=alert(1)>',
  ])("rejects unsafe and XSS-bearing social URLs", (value) => {
    expect(normalizeSocialLink("facebook", value)).toBeNull();
  });

  it("normalizes safe social links through strict HTTP(S) validation", () => {
    expect(normalizeSocialLink("instagram", "instagram.com/ens")).toBe(
      "https://instagram.com/ens",
    );
  });

  it("normalizes WhatsApp phone numbers to safe wa.me links", () => {
    expect(normalizeSocialLink("whatsapp", "+20 100-000-0000")).toBe(
      "https://wa.me/201000000000",
    );
  });

  it("rejects unsafe and non-WhatsApp URLs for WhatsApp", () => {
    expect(
      normalizeSocialLink("whatsapp", "javascript:alert(1)"),
    ).toBeNull();
    expect(
      normalizeSocialLink("whatsapp", "https://example.com/contact"),
    ).toBeNull();
  });

  it("fails the complete payload when any row is unsafe", () => {
    expect(
      normalizeSocialLinks([
        { id: "facebook", value: "https://facebook.com/ens" },
        { id: "instagram", value: "data:text/html,bad" },
        { id: "twitter", value: "" },
        { id: "whatsapp", value: "+201000000000" },
      ]),
    ).toBeNull();
  });
});
