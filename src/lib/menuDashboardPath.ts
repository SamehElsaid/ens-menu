type MenuRefSource =
  | { uuid?: string; id?: number }
  | null
  | undefined;

/** Public segment for /dashboard/:ref routes (prefers UUID). */
export function getMenuDashboardRef(menu: MenuRefSource): string {
  if (!menu) return "";
  if (typeof menu.uuid === "string" && menu.uuid.length > 0) {
    return menu.uuid;
  }
  if (menu.id != null) return String(menu.id);
  return "";
}

export function menuDashboardPath(
  menu: MenuRefSource,
  ...segments: string[]
): string {
  const ref = getMenuDashboardRef(menu);
  if (!ref) return "/dashboard";
  const suffix = segments.filter(Boolean).join("/");
  return suffix ? `/dashboard/${ref}/${suffix}` : `/dashboard/${ref}`;
}

export function menuRefFromRouteParam(
  menu: string | string[] | undefined,
): string {
  if (typeof menu === "string") return menu;
  return menu?.[0] ?? "";
}
