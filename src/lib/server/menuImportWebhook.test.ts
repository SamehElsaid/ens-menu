import { describe, expect, it } from "vitest";
import { resolveMenuImportWebhook } from "./menuImportWebhook";

describe("menu import webhook configuration", () => {
  it.each([undefined, "", "not a URL", "javascript:alert(1)"])(
    "fails closed for missing or invalid configuration",
    (value) => {
      expect(resolveMenuImportWebhook(value, "production")).toEqual({
        ok: false,
        error: "menu_import_not_configured",
      });
    },
  );

  it("requires HTTPS in production", () => {
    expect(
      resolveMenuImportWebhook("http://internal.example/webhook", "production"),
    ).toEqual({
      ok: false,
      error: "menu_import_not_configured",
    });
  });

  it("rejects credential-bearing and fragment-bearing URLs", () => {
    expect(
      resolveMenuImportWebhook(
        "https://user:secret@n8n.example/webhook",
        "production",
      ).ok,
    ).toBe(false);
    expect(
      resolveMenuImportWebhook(
        "https://n8n.example/webhook#secret",
        "production",
      ).ok,
    ).toBe(false);
  });

  it("accepts only the configured server-side HTTPS endpoint", () => {
    expect(
      resolveMenuImportWebhook(
        "https://n8n.example/webhook/menu-import",
        "production",
      ),
    ).toEqual({
      ok: true,
      url: "https://n8n.example/webhook/menu-import",
    });
  });
});
