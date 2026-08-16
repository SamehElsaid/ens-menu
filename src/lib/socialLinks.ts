import { toSafeExternalUrl } from "./normalizeExternalUrl";

export type SocialLinkKind =
  | "facebook"
  | "instagram"
  | "twitter"
  | "whatsapp";

function normalizeWhatsAppPhone(raw: string): string | null {
  const compact = raw.replace(/[\s()+.-]/g, "");
  const international = compact.replace(/^00/, "");
  return /^\d{7,15}$/.test(international)
    ? `https://wa.me/${international}`
    : null;
}

export function normalizeSocialLink(
  kind: SocialLinkKind,
  value: string,
): string | null {
  const raw = value.trim();
  if (!raw) return "";

  if (kind === "whatsapp") {
    const phoneUrl = normalizeWhatsAppPhone(raw);
    if (phoneUrl) return phoneUrl;

    const safeUrl = toSafeExternalUrl(raw);
    if (!safeUrl) return null;
    const hostname = new URL(safeUrl).hostname.toLowerCase();
    return hostname === "wa.me" ||
      hostname === "api.whatsapp.com" ||
      hostname === "whatsapp.com" ||
      hostname === "www.whatsapp.com"
      ? safeUrl
      : null;
  }

  return toSafeExternalUrl(raw);
}

export function normalizeSocialLinks(
  rows: ReadonlyArray<{ id: SocialLinkKind; value: string }>,
): Record<SocialLinkKind, string> | null {
  const normalized: Record<SocialLinkKind, string> = {
    facebook: "",
    instagram: "",
    twitter: "",
    whatsapp: "",
  };
  for (const row of rows) {
    const value = normalizeSocialLink(row.id, row.value);
    if (value === null) return null;
    normalized[row.id] = value;
  }
  return normalized;
}
