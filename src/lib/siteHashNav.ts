/**
 * Same-page hash links (`/#features`) are a no-op in the App Router once the
 * pathname is already `/` — Next treats the navigation as unchanged and never
 * scrolls. Call this from click handlers (and after cross-page arrivals) so
 * every press reaches the section.
 */
export function scrollToHash(
  hash: string,
  { behavior = "smooth" }: { behavior?: ScrollBehavior } = {},
) {
  const id = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior, block: "start" });
  return true;
}

/** True when `href` is a hash on the public home page (`/#section`). */
export function homeHashTarget(href: string): string | null {
  const i = href.indexOf("#");
  if (i < 0) return null;
  const path = href.slice(0, i);
  if (path !== "" && path !== "/") return null;
  const id = href.slice(i + 1);
  return id || null;
}
