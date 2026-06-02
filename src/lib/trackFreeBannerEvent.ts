export type FreeBannerEventType = "impression" | "click";

/**
 * Records a free-menu bottom branding banner event.
 * Backend: POST /public/menus/:slug/branding-events { type: "impression" | "click" }
 */
export async function trackFreeBannerEvent(
  menuSlug: string,
  type: FreeBannerEventType,
): Promise<void> {
  const slug = menuSlug?.trim();
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  if (!slug || !base) return;

  try {
    await fetch(
      `${base}/public/menus/${encodeURIComponent(slug)}/branding-events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
        keepalive: type === "click",
      },
    );
  } catch {
    // Analytics must not break the public menu experience
  }
}
