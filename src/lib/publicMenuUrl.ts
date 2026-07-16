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

/** Display host for a menu slug, e.g. `my-menu.ensmenu.com`. */
export function publicMenuHostDisplay(slug: string | undefined | null): string {
  const trimmed = slug?.trim();
  const suffix = menuHostSuffix();
  if (!trimmed) return `your-slug${suffix}`;
  return `${trimmed}${suffix}`;
}

/**
 * Normalize slug field input (typing or paste).
 * Strips full URLs / host suffixes so pasting `slug.ensmenu.com` keeps only `slug`.
 */
export function sanitizeMenuSlugInput(raw: string): string {
  let value = raw.trim().toLowerCase();
  if (!value) return "";

  value = value.replace(/^https?:\/\//, "").replace(/^\/\//, "");
  value = value.split(/[/?#]/)[0] ?? "";
  value = value.replace(/^www\./, "");

  const suffix = menuHostSuffix().toLowerCase();
  const suffixNoDot = suffix.startsWith(".") ? suffix.slice(1) : suffix;

  // Strip duplicated host suffixes from paste (e.g. slug.ensmenu.com.ensmenu.com)
  let prev = "";
  while (value !== prev) {
    prev = value;
    if (suffix && value.endsWith(suffix)) {
      value = value.slice(0, -suffix.length);
      continue;
    }
    if (suffixNoDot && value.endsWith(`.${suffixNoDot}`)) {
      value = value.slice(0, -(suffixNoDot.length + 1));
      continue;
    }
    if (suffixNoDot && value.endsWith(suffixNoDot) && value.includes(".")) {
      value = value.slice(0, -suffixNoDot.length).replace(/\.$/, "");
    }
  }

  return value
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
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
