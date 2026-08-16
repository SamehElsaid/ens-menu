export type MenuImportWebhookResolution =
  | { ok: true; url: string }
  | { ok: false; error: "menu_import_not_configured" };

export function resolveMenuImportWebhook(
  configuredValue: string | undefined,
  nodeEnv: string | undefined,
): MenuImportWebhookResolution {
  const raw = configuredValue?.trim();
  if (!raw) return { ok: false, error: "menu_import_not_configured" };

  try {
    const url = new URL(raw);
    const validProtocol =
      url.protocol === "https:" ||
      (nodeEnv !== "production" && url.protocol === "http:");
    if (
      !validProtocol ||
      !url.hostname ||
      url.username ||
      url.password ||
      url.hash
    ) {
      return { ok: false, error: "menu_import_not_configured" };
    }
    return { ok: true, url: url.toString() };
  } catch {
    return { ok: false, error: "menu_import_not_configured" };
  }
}
