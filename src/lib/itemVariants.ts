import type { Item, ItemVariantOption } from "@/types/Menu";

function parseVariantsField(raw: unknown): ItemVariantOption[] {
  if (raw === null || raw === undefined || raw === "") return [];

  let value: unknown = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value) as unknown;
    } catch {
      return [];
    }
  }

  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      const row = entry as Record<string, unknown>;
      const price = Number(row.price);
      return {
        labelAr: String(row.labelAr ?? row.label_ar ?? row.label ?? "").trim(),
        labelEn: String(row.labelEn ?? row.label_en ?? row.label ?? "").trim(),
        price,
      };
    })
    .filter(
      (row) =>
        row.labelAr &&
        row.labelEn &&
        Number.isFinite(row.price) &&
        row.price >= 0,
    );
}

export function getItemVariants(item: Item): ItemVariantOption[] {
  return parseVariantsField(item.variants);
}

export function itemHasVariants(item: Item): boolean {
  return getItemVariants(item).length > 0;
}
