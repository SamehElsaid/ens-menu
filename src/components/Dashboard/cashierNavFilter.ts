import type { NavSection } from "@/components/Dashboard/data";

/** Cashier ACL: show sidebar items whose `key` is in allowedKeys (overview always allowed if present in list). */
export function filterNavSectionsForCashier(
  sections: NavSection[],
  allowedKeys: string[],
): NavSection[] {
  const set = new Set(allowedKeys);
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        const k = item.key;
        if (!k) return true;
        return set.has(k);
      }),
    }))
    .filter((s) => s.items.length > 0);
}
