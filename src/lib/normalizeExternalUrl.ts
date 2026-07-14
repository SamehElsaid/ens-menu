/** Ensures external links work as hrefs even when paste lacks a protocol. */
export function normalizeExternalUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return `https://${trimmed}`;
}

export function isValidExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(normalizeExternalUrl(url));
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
