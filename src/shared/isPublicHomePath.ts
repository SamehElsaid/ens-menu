/** True on the marketing homepage (any locale prefix). */
export function isPublicHomePath(pathname: string): boolean {
  const normalized = pathname.replace(/\/$/, "") || "/";
  return normalized === "/" || normalized === "/en" || normalized === "/ar";
}

/** Client pathname — works with locale-as-needed routing. */
export function isCurrentPublicHome(): boolean {
  if (typeof window === "undefined") return false;
  return isPublicHomePath(window.location.pathname);
}
