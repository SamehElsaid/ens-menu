import type { Item, ItemSizeOption } from "@/types/Menu";

function parseSizesField(raw: unknown): ItemSizeOption[] {
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
        nameAr: String(row.nameAr ?? row.name_ar ?? row.labelAr ?? row.label ?? "").trim(),
        nameEn: String(row.nameEn ?? row.name_en ?? row.labelEn ?? row.label ?? "").trim(),
        price,
      };
    })
    .filter(
      (row) =>
        row.nameAr &&
        row.nameEn &&
        Number.isFinite(row.price) &&
        row.price >= 0,
    );
}

export function getItemSizes(item: Item): ItemSizeOption[] {
  return parseSizesField(item.sizes);
}

export function itemHasSizes(item: Item): boolean {
  return getItemSizes(item).length > 0;
}

export function getItemDisplayPrice(item: Item): number {
  const sizes = getItemSizes(item);
  if (sizes.length > 0) {
    return Math.min(...sizes.map((size) => size.price));
  }
  return item.price;
}
