export function normalizeExternalUrl(url: string): string {
  const trimmed = url.trim();
  if (/^www\./i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export function isValidExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(normalizeExternalUrl(url));
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
