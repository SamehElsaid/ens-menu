import placeholder from "@/components/img/30690.png";

/** Bundled default used when a menu item has no image URL and no menu logo fallback. */
export const DEFAULT_MENU_ITEM_IMAGE_SRC = placeholder.src;

function resolveAssetUrl(trimmed: string): string {
  const publicBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const imageResizeUrl = process.env.NEXT_PUBLIC_IMAGE_RESIZE_URL;
  const baseApi = process.env.NEXT_PUBLIC_DEV  ? imageResizeUrl : publicBaseUrl;
  const baseHost = baseApi?.replace(/\/api\/?$/, "") ?? "";

  if (trimmed.startsWith("data:")) {
    return trimmed;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const uploadsIndex = trimmed.indexOf("/uploads/");
    if (uploadsIndex !== -1 && baseHost) {
      return `${baseHost}${trimmed.slice(uploadsIndex)}`;
    }
    return trimmed;
  }

  // Next.js bundled assets (default placeholder) — must not be sent to the API host.
  if (trimmed.startsWith("/_next/")) {
    return trimmed;
  }

  if (!baseHost) return trimmed;

  if (trimmed.startsWith(baseHost)) {
    return trimmed;
  }

  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${baseHost}${normalizedPath}`;
}

/**
 * Resolves a menu item image URL: empty/whitespace → menu logo (if provided) or default placeholder,
 * absolute/data URLs unchanged, relative paths joined to the API host (same as ImageLoad).
 */
export function resolveMenuItemImageSrc(
  src: string | undefined | null,
  logoFallback?: string | null,
): string {
  const trimmed = src?.trim();
  if (!trimmed) {
    const logoTrimmed = logoFallback?.trim();
    if (logoTrimmed) {
      return resolveAssetUrl(logoTrimmed);
    }
    return DEFAULT_MENU_ITEM_IMAGE_SRC;
  }

  return resolveAssetUrl(trimmed);
}
