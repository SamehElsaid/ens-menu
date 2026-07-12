import type { CallItem, CallItemOption } from "@/lib/tableOrders";
import type { Item, ItemSizeOption, ItemVariantOption } from "@/types/Menu";

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export function resolveMenuItemName(item: Item, locale: string): string {
  const ar = String(
    item.nameAr ?? item.name_ar ?? item.name ?? item.nameEn ?? item.name_en ?? "",
  ).trim();
  const en = String(
    item.nameEn ?? item.name_en ?? item.name ?? item.nameAr ?? item.name_ar ?? "",
  ).trim();
  return locale === "ar" ? ar || en : en || ar;
}

export function getMenuItemSizes(item: Item): ItemSizeOption[] {
  if (!Array.isArray(item.sizes)) return [];
  return item.sizes.filter(
    (s) => s && Number.isFinite(Number(s.price)) && Number(s.price) >= 0,
  );
}

export function getMenuItemVariants(item: Item): ItemVariantOption[] {
  if (!Array.isArray(item.variants)) return [];
  return item.variants.filter(
    (v) => v && Number.isFinite(Number(v.price)) && Number(v.price) >= 0,
  );
}

export function menuItemHasOptions(item: Item): boolean {
  return getMenuItemSizes(item).length > 0 || getMenuItemVariants(item).length > 0;
}

export function computeDraftUnitPrice(
  item: Item,
  size?: ItemSizeOption | null,
  variant?: ItemVariantOption | null,
): number {
  const base = size ? Number(size.price) : Number(item.price ?? 0);
  const addon = variant ? Number(variant.price) : 0;
  return roundMoney((Number.isFinite(base) ? base : 0) + (Number.isFinite(addon) ? addon : 0));
}

function optionKey(opt: CallItemOption | null | undefined): string {
  if (!opt) return "";
  return [
    opt.nameAr,
    opt.nameEn,
    opt.labelAr,
    opt.labelEn,
    opt.price,
  ]
    .map((v) => String(v ?? ""))
    .join("|");
}

export function callItemsMatch(a: CallItem, b: CallItem): boolean {
  return (
    String(a.menuItemId ?? "") === String(b.menuItemId ?? "") &&
    optionKey(a.size) === optionKey(b.size) &&
    optionKey(a.variant) === optionKey(b.variant)
  );
}

function appendOptionLabels(
  baseName: string,
  size?: ItemSizeOption | null,
  variant?: ItemVariantOption | null,
  locale?: string,
): string {
  const parts = [baseName];
  if (size) {
    parts.push(
      locale === "ar"
        ? size.nameAr || size.nameEn
        : size.nameEn || size.nameAr,
    );
  }
  if (variant) {
    parts.push(
      locale === "ar"
        ? variant.labelAr || variant.labelEn
        : variant.labelEn || variant.labelAr,
    );
  }
  return parts.length > 1 ? parts.join(" · ") : baseName;
}

export function buildCallItemFromMenuItem(
  item: Item,
  locale: string,
  size?: ItemSizeOption | null,
  variant?: ItemVariantOption | null,
  quantity = 1,
): CallItem {
  const baseName = resolveMenuItemName(item, locale);
  const unitPrice = computeDraftUnitPrice(item, size, variant);
  const qty = Math.max(1, Math.floor(quantity));
  const callSize: CallItemOption | null = size
    ? {
        nameAr: size.nameAr,
        nameEn: size.nameEn,
        price: size.price,
      }
    : null;
  const callVariant: CallItemOption | null = variant
    ? {
        labelAr: variant.labelAr,
        labelEn: variant.labelEn,
        price: variant.price,
      }
    : null;

  return {
    menuItemId: item.id,
    name: appendOptionLabels(baseName, size, variant, locale),
    price: unitPrice,
    quantity: qty,
    total: roundMoney(unitPrice * qty),
    size: callSize,
    variant: callVariant,
  };
}

export function mergeCallItemIntoDraft(
  draft: CallItem[],
  line: CallItem,
): CallItem[] {
  const idx = draft.findIndex((d) => callItemsMatch(d, line));
  if (idx < 0) return [...draft, line];
  return draft.map((d, i) => {
    if (i !== idx) return d;
    const qty = (d.quantity ?? 1) + (line.quantity ?? 1);
    const unit = d.price ?? line.price ?? 0;
    return { ...d, quantity: qty, total: roundMoney(unit * qty) };
  });
}
