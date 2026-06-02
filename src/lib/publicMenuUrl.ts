/** Query param on public menu URLs encoded in QR codes (tracked as a scan). */
export const MENU_QR_ENTRY_PARAM = "src";
export const MENU_QR_ENTRY_VALUE = "qr";

export function buildPublicMenuBaseUrl(slug: string | undefined | null): string {
  if (!slug) return "";
  return `https://${slug}${process.env.NEXT_PUBLIC_MENU_URL || ""}`.replace(
    /^https:\/\//,
    "https://",
  );
}

export function appendQueryParams(
  baseUrl: string,
  params: Record<string, string | undefined>,
): string {
  if (!baseUrl) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== "") search.set(key, value);
  }
  const qs = search.toString();
  if (!qs) return baseUrl;
  const sep = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${sep}${qs}`;
}

/** URL embedded in QR codes — includes src=qr for scan analytics. */
export function publicMenuQrUrl(
  slug: string | undefined | null,
  options?: { table?: string },
): string {
  const base = buildPublicMenuBaseUrl(slug);
  return appendQueryParams(base, {
    [MENU_QR_ENTRY_PARAM]: MENU_QR_ENTRY_VALUE,
    table: options?.table,
  });
}

/** Direct link to the menu (not counted as a QR scan). */
export function publicMenuLinkUrl(slug: string | undefined | null): string {
  return buildPublicMenuBaseUrl(slug);
}
