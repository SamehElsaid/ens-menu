import type {
  ItemOptionId,
  ItemSizeOption,
  ItemVariantOption,
} from "@/types/Menu";
import {
  createPersistentOptionId,
  persistentOptionIdForLegacy,
} from "@/lib/optionIds";

export interface EditableItemSize {
  id: ItemOptionId;
  nameAr: string;
  nameEn: string;
  price: string;
}

export interface EditableItemVariant {
  id: ItemOptionId;
  labelAr: string;
  labelEn: string;
  price: string;
}

type UuidFactory = () => string;

function readOptionList(raw: unknown): Record<string, unknown>[] {
  let value = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value) as unknown;
    } catch {
      return [];
    }
  }
  return Array.isArray(value)
    ? value.filter(
        (entry): entry is Record<string, unknown> =>
          Boolean(entry) && typeof entry === "object",
      )
    : [];
}

export function createItemSizeRow(
  createUuid: UuidFactory = () => crypto.randomUUID(),
): EditableItemSize {
  return {
    id: createPersistentOptionId(createUuid),
    nameAr: "",
    nameEn: "",
    price: "",
  };
}

export function createItemVariantRow(
  createUuid: UuidFactory = () => crypto.randomUUID(),
): EditableItemVariant {
  return {
    id: createPersistentOptionId(createUuid),
    labelAr: "",
    labelEn: "",
    price: "",
  };
}

export function parseEditableItemSizes(
  item: { sizes?: unknown },
): EditableItemSize[] {
  return readOptionList(item.sizes).map((row) => ({
    id: persistentOptionIdForLegacy(
      row.id,
      `size:${String(
        row.nameAr ?? row.name_ar ?? row.label ?? "",
      )}:${Number(row.price)}`,
    ),
    nameAr: String(
      row.nameAr ?? row.name_ar ?? row.labelAr ?? row.label ?? "",
    ),
    nameEn: String(
      row.nameEn ?? row.name_en ?? row.labelEn ?? row.label ?? "",
    ),
    price: row.price != null ? String(row.price) : "",
  }));
}

export function parseEditableItemVariants(
  item: { variants?: unknown },
): EditableItemVariant[] {
  return readOptionList(item.variants).map((row) => ({
    id: persistentOptionIdForLegacy(
      row.id,
      `variant:${String(
        row.labelAr ?? row.label_ar ?? row.label ?? "",
      )}:${Number(row.price)}`,
    ),
    labelAr: String(row.labelAr ?? row.label_ar ?? row.label ?? ""),
    labelEn: String(row.labelEn ?? row.label_en ?? row.label ?? ""),
    price: row.price != null ? String(row.price) : "",
  }));
}

export function serializeItemSizes(
  sizes: EditableItemSize[],
): ItemSizeOption[] {
  return sizes.map((size) => ({
    id: size.id,
    nameAr: size.nameAr.trim(),
    nameEn: size.nameEn.trim(),
    price: Number(size.price),
  }));
}

export function serializeItemVariants(
  variants: EditableItemVariant[],
): ItemVariantOption[] {
  return variants.map((variant) => ({
    id: variant.id,
    labelAr: variant.labelAr.trim(),
    labelEn: variant.labelEn.trim(),
    price: Number(variant.price),
  }));
}
