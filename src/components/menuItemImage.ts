import placeholder from "@/components/img/30690.png";

/** Bundled default used when a menu item has no image URL and no menu logo fallback. */
export const DEFAULT_MENU_ITEM_IMAGE_SRC = placeholder.src;

const LOCAL_UPLOAD_HOSTS = new Set(["localhost", "127.0.0.1"]);

const REMOTE_UPLOAD_HOST = "https://ensapi.ensbot.net";

function isLocalUploadHost(host: string): boolean {
  const normalized = host.trim();
  if (!normalized) return false;

  try {
    const withProtocol = normalized.includes("://")
      ? normalized
      : `http://${normalized}`;
    return LOCAL_UPLOAD_HOSTS.has(new URL(withProtocol).hostname);
  } catch {
    const hostname = normalized.replace(/^https?:\/\//, "").split(/[/:]/)[0] ?? "";
    return LOCAL_UPLOAD_HOSTS.has(hostname);
  }
}

function getUploadsServeHost(baseHost: string): string {
  if (!baseHost || isLocalUploadHost(baseHost)) {
    return REMOTE_UPLOAD_HOST;
  }
  return baseHost;
}

function resolveUploadsHost(trimmed: string, baseHost: string): string | null {
  const uploadsIndex = trimmed.indexOf("/uploads/");
  if (uploadsIndex === -1) return null;

  const uploadsPath = trimmed.slice(uploadsIndex);
  const serveHost = getUploadsServeHost(baseHost);
  return `${serveHost}${uploadsPath}`;
}

function resolveAssetUrl(trimmed: string): string {
  const publicBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const imageResizeUrl = process.env.NEXT_PUBLIC_IMAGE_RESIZE_URL;
  const baseApi = process.env.NEXT_PUBLIC_DEV ? imageResizeUrl : publicBaseUrl;
  const baseHost = baseApi?.replace(/\/api\/?$/, "") ?? "";

  if (trimmed.startsWith("data:")) {
    return trimmed;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const rewritten = resolveUploadsHost(trimmed, baseHost);
    if (rewritten) return rewritten;
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
