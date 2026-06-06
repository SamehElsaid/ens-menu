import type { Menu } from "@/types/Menu";

/** Normalize menu payloads from POST/GET (flat or nested under `menu`). */
export function normalizeMenuFromApi(data: unknown): Menu | null {
  if (!data || typeof data !== "object") return null;

  const record = data as Record<string, unknown>;
  const candidate =
    record.menu && typeof record.menu === "object"
      ? (record.menu as Record<string, unknown>)
      : record;

  const idRaw = candidate.id ?? candidate.menuId;
  const id =
    typeof idRaw === "number"
      ? idRaw
      : typeof idRaw === "string"
        ? Number.parseInt(idRaw, 10)
        : NaN;

  if (!Number.isFinite(id)) return null;

  const slug = String(candidate.slug ?? id);
  const nameEn =
    (candidate.nameEn as string | undefined) ??
    (candidate.name as string | undefined) ??
    "";
  const nameAr = (candidate.nameAr as string | undefined) ?? nameEn;

  return {
    ...(candidate as Menu),
    id,
    uuid:
      typeof candidate.uuid === "string" && candidate.uuid.length > 0
        ? candidate.uuid
        : undefined,
    slug,
    nameEn,
    nameAr,
    currency: String(candidate.currency ?? "EGP"),
    isActive: candidate.isActive !== false,
    activeItemsCount: Number(candidate.activeItemsCount ?? 0),
    categoriesCount: Number(candidate.categoriesCount ?? 0),
    itemsCount: Number(candidate.itemsCount ?? 0),
    views: Number(candidate.views ?? 0),
    workingHours: (candidate.workingHours as Menu["workingHours"]) ?? {},
    createdAt: String(candidate.createdAt ?? new Date().toISOString()),
    updatedAt: String(candidate.updatedAt ?? new Date().toISOString()),
  };
}

export function menuMatchesRouteKey(
  menu: Menu | null | undefined,
  routeKey: string | null,
): boolean {
  if (!menu || !routeKey) return false;
  return menu.slug === routeKey || String(menu.id) === routeKey;
}

export function extractDashboardMenuRouteKey(pathname: string): string | null {
  const match = pathname.match(/^\/dashboard\/([^/]+)/);
  if (!match) return null;
  const key = match[1];
  if (key === "subscription" || key === "advertisements") return null;
  return key;
}
