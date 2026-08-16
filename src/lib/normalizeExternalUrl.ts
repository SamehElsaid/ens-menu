const EXPLICIT_SCHEME = /^[a-z][a-z\d+.-]*:/i;
const UNSAFE_URL_CHARACTERS = /[\u0000-\u001f\u007f<>"'`]/;

/** Ensures external links work as hrefs even when paste lacks a protocol. */
export function normalizeExternalUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (EXPLICIT_SCHEME.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function toSafeExternalUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed || UNSAFE_URL_CHARACTERS.test(trimmed)) return null;
  try {
    const parsed = new URL(normalizeExternalUrl(trimmed));
    if (
      (parsed.protocol !== "http:" && parsed.protocol !== "https:") ||
      !parsed.hostname ||
      parsed.username ||
      parsed.password
    ) {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

export function isValidExternalUrl(url: string): boolean {
  return toSafeExternalUrl(url) !== null;
}
