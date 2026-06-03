export type FreeBannerEventType = "impression" | "click";

/** Records a free-menu bottom branding banner event. */
export function trackFreeBannerEvent(
  menuSlug: string,
  type: FreeBannerEventType,
): void {
  const slug = menuSlug?.trim();
  const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (!slug || !base) return;

  const url = `${base}/public/menus/${encodeURIComponent(slug)}/branding-events`;
  const body = JSON.stringify({ type });

  if (
    type === "click" &&
    typeof navigator !== "undefined" &&
    typeof navigator.sendBeacon === "function"
  ) {
    navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
    return;
  }

  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}
