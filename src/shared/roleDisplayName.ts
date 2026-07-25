import type { MenuStaffRole } from "@/types/Menu";

/**
 * Role name for the active locale. `name` holds the Arabic name and is always
 * present; `nameEn` is optional, so English falls back to `name`.
 */
export function roleDisplayName(
  role: Pick<MenuStaffRole, "name" | "nameEn">,
  locale: string,
): string {
  if (locale === "en") return role.nameEn?.trim() || role.name;
  return role.name;
}
