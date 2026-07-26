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

/** Default delivery role — seeded but not assignable in the UI yet. */
const COMING_SOON_DEFAULT_ROLE_NAMES = new Set([
  "ديلفري",
  "delivery",
]);

/**
 * Frontend-only gate: the seeded Delivery role is shown as disabled /
 * "Coming soon" until the feature ships. Match by default flag + name so
 * custom roles named similarly stay usable.
 */
export function isComingSoonStaffRole(
  role: Pick<MenuStaffRole, "name" | "nameEn" | "isDefault">,
): boolean {
  if (!role.isDefault) return false;
  const candidates = [role.name, role.nameEn ?? ""]
    .map((n) => n.trim().toLowerCase())
    .filter(Boolean);
  return candidates.some((n) => COMING_SOON_DEFAULT_ROLE_NAMES.has(n));
}
