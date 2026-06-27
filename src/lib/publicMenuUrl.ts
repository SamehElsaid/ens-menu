/** Query param on public menu URLs encoded in QR codes (tracked as a scan). */
export const MENU_QR_ENTRY_PARAM = "src";
export const MENU_QR_ENTRY_VALUE = "qr";

/** Matches a raw UUID — these are never valid human-readable subdomains. */
export const MENU_UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DEFAULT_MENU_HOST_SUFFIX = ".ensmenu.com";

function menuHostSuffix(): string {
  const fromEnv = process.env.NEXT_PUBLIC_MENU_URL?.trim();
  return fromEnv || DEFAULT_MENU_HOST_SUFFIX;
}

/** Normalized slug for public URLs.
 *  Returns empty string if the slug is absent or looks like a raw UUID. */
export function resolvePublicMenuSlug(
  slug: string | undefined | null,
  menuId?: number | string | null,
): string {
  const trimmed = slug?.trim();
  if (trimmed && !MENU_UUID_REGEX.test(trimmed)) return trimmed;
  if (menuId != null && String(menuId).trim()) {
    return String(menuId).trim();
  }
  return "";
}

export function buildPublicMenuBaseUrl(slug: string | undefined | null): string {
  const normalized = resolvePublicMenuSlug(slug);
  if (!normalized) return "";
  return `https://${normalized}${menuHostSuffix()}`;
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

/** Direct link to the menu (not counted as a QR scan).
 *  Uses a protocol-relative URL (//) so it inherits the current page protocol
 *  (HTTP in local dev, HTTPS in production), matching what cards display. */
export function publicMenuLinkUrl(slug: string | undefined | null): string {
  const normalized = resolvePublicMenuSlug(slug);
  if (!normalized) return "";
  return `//${normalized}${menuHostSuffix()}`;
}
