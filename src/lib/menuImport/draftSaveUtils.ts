import type {
  ImportCategory,
  ImportDraft,
  ImportDraftStats,
  ImportItem,
  ImportVariant,
  ExpandedSaveItem,
  SaveBlockingError,
} from "@/types/menuImport";
import { generateImportId } from "./generateImportId";

const VARIANT_NAME_SEP = " - ";

export function expandItemForSave(item: ImportItem): ExpandedSaveItem[] {
  if ((item.sizes?.length ?? 0) > 0) {
    return item.sizes!.map((size) => ({
      refId: size.id,
      sourceItemRefId: item.id,
      nameAr: joinName(item.nameAr, size.labelAr ?? size.label),
      nameEn: joinName(item.nameEn, size.labelEn ?? size.label),
      descriptionAr: item.descriptionAr,
      descriptionEn: item.descriptionEn,
      price: size.price as number,
      isAvailable: item.isAvailable,
      imageUrl: item.imageUrl,
      duplicateMeta: size.duplicateMeta ?? item.duplicateMeta,
    }));
  }

  return [
    {
      refId: item.id,
      sourceItemRefId: item.id,
      nameAr: item.nameAr,
      nameEn: item.nameEn,
      descriptionAr: item.descriptionAr,
      descriptionEn: item.descriptionEn,
      price: item.price as number,
      isAvailable: item.isAvailable,
      imageUrl: item.imageUrl,
      duplicateMeta: item.duplicateMeta,
    },
  ];
}

function joinName(base: string, variantLabel: string): string {
  const label = variantLabel.trim();
  if (!label) return base.trim();
  if (!base.trim()) return label;
  return `${base.trim()}${VARIANT_NAME_SEP}${label}`;
}

export function collectBlockingPriceErrors(
  draft: ImportDraft,
): SaveBlockingError[] {
  const errors: SaveBlockingError[] = [];

  for (const category of draft.categories) {
    for (const item of category.items) {
      const sizes = item.sizes ?? [];
      if (sizes.length > 0) {
        for (const size of sizes) {
          if (size.price === null || !Number.isFinite(size.price)) {
            errors.push({
              refId: size.id,
              type: "variant",
              nameAr: joinName(item.nameAr, size.labelAr ?? size.label),
              nameEn: joinName(item.nameEn, size.labelEn ?? size.label),
              reason: "missing_price",
            });
          }
        }
      } else if (item.price === null || !Number.isFinite(item.price)) {
        errors.push({
          refId: item.id,
          type: "item",
          nameAr: item.nameAr,
          nameEn: item.nameEn,
          reason: "missing_price",
        });
      }
      for (const variant of item.variants) {
        if (variant.price === null || !Number.isFinite(variant.price)) {
          errors.push({
            refId: variant.id,
            type: "variant",
            nameAr: joinName(item.nameAr, variant.labelAr ?? variant.label),
            nameEn: joinName(item.nameEn, variant.labelEn ?? variant.label),
            reason: "missing_price",
          });
        }
      }
    }
  }

  return errors;
}

function pushNameError(
  errors: SaveBlockingError[],
  refId: string,
  type: SaveBlockingError["type"],
  nameAr: string,
  nameEn: string,
  reason: SaveBlockingError["reason"],
) {
  errors.push({ refId, type, nameAr, nameEn, reason });
}

export function collectBlockingNameErrors(
  draft: ImportDraft,
): SaveBlockingError[] {
  const errors: SaveBlockingError[] = [];

  for (const category of draft.categories) {
    if (!category.nameAr.trim()) {
      pushNameError(
        errors,
        category.id,
        "category",
        category.nameAr,
        category.nameEn,
        "missing_name_ar",
      );
    }
    if (!category.nameEn.trim()) {
      pushNameError(
        errors,
        category.id,
        "category",
        category.nameAr,
        category.nameEn,
        "missing_name_en",
      );
    }

    for (const item of category.items) {
      if (!item.nameAr.trim()) {
        pushNameError(
          errors,
          item.id,
          "item",
          item.nameAr,
          item.nameEn,
          "missing_name_ar",
        );
      }
      if (!item.nameEn.trim()) {
        pushNameError(
          errors,
          item.id,
          "item",
          item.nameAr,
          item.nameEn,
          "missing_name_en",
        );
      }

      for (const variant of [...(item.sizes ?? []), ...item.variants]) {
        const vAr = variant.labelAr ?? variant.label;
        const vEn = variant.labelEn ?? variant.label;
        if (!vAr.trim()) {
          pushNameError(
            errors,
            variant.id,
            "variant",
            joinName(item.nameAr, vAr),
            joinName(item.nameEn, vEn),
            "missing_name_ar",
          );
        }
        if (!vEn.trim()) {
          pushNameError(
            errors,
            variant.id,
            "variant",
            joinName(item.nameAr, vAr),
            joinName(item.nameEn, vEn),
            "missing_name_en",
          );
        }
      }
    }
  }

  return errors;
}

export function collectAllBlockingErrors(
  draft: ImportDraft,
): SaveBlockingError[] {
  return [
    ...collectBlockingPriceErrors(draft),
    ...collectBlockingNameErrors(draft),
  ];
}

export function countExpandedItems(draft: ImportDraft): number {
  return draft.categories.reduce(
    (sum, cat) =>
      sum + cat.items.reduce((s, item) => s + expandItemForSave(item).length, 0),
    0,
  );
}

export function recomputeDraftStats(draft: ImportDraft): ImportDraftStats {
  let itemCount = 0;
  let variantCount = 0;
  let warningCount = 0;
  let missingPriceCount = 0;
  let missingNameCount = 0;

  for (const category of draft.categories) {
    const catFlags = refreshCategoryFlags(category);
    category.flags = catFlags;
    warningCount += catFlags.length;
    missingNameCount += countNameFlags(catFlags);

    for (const item of category.items) {
      itemCount++;
      const options = [...(item.sizes ?? []), ...item.variants];
      variantCount += options.length;
      const flags = refreshItemFlags(item);
      item.flags = flags;
      warningCount += flags.length;
      missingNameCount += countNameFlags(flags);

      for (const variant of options) {
        const vFlags = refreshVariantFlags(variant);
        variant.flags = vFlags;
        warningCount += vFlags.length;
        missingNameCount += countNameFlags(vFlags);
      }
    }
  }

  missingPriceCount = collectBlockingPriceErrors(draft).length;

  const expandedItemCount = countExpandedItems(draft);

  return {
    categoryCount: draft.categories.length,
    itemCount,
    variantCount,
    warningCount,
    expandedItemCount,
    missingPriceCount,
    missingNameCount,
  };
}

function countNameFlags(flags: ImportItem["flags"]): number {
  return flags.filter(
    (f) => f === "missing_name_ar" || f === "missing_name_en",
  ).length;
}

function refreshCategoryFlags(category: ImportCategory): ImportCategory["flags"] {
  const flags = category.flags.filter(
    (f) =>
      !["missing_name_ar", "missing_name_en", "needs_review", "unknown_category"].includes(f),
  );
  if (!category.nameAr.trim() && !category.nameEn.trim()) {
    flags.push("needs_review");
  } else {
    if (!category.nameAr.trim()) flags.push("missing_name_ar");
    if (!category.nameEn.trim()) flags.push("missing_name_en");
  }
  return flags;
}

export function withUpdatedDraftStats(draft: ImportDraft): ImportDraft {
  return {
    ...draft,
    stats: recomputeDraftStats(draft),
  };
}

function refreshItemFlags(item: ImportItem): ImportItem["flags"] {
  const flags: ImportItem["flags"] = item.flags.filter(
    (f) =>
      !["missing_price", "missing_name_ar", "missing_name_en", "needs_review"].includes(f),
  );
  if ((item.sizes?.length ?? 0) === 0 && (item.price === null || item.price < 0)) {
    flags.push("missing_price");
  }
  if (!item.nameAr.trim() && !item.nameEn.trim()) {
    flags.push("needs_review");
  } else {
    if (!item.nameAr.trim()) flags.push("missing_name_ar");
    if (!item.nameEn.trim()) flags.push("missing_name_en");
  }
  return flags;
}

function refreshVariantFlags(variant: ImportVariant): ImportVariant["flags"] {
  const flags: ImportVariant["flags"] = variant.flags.filter(
    (f) =>
      !["missing_price", "missing_name_ar", "missing_name_en"].includes(f),
  );
  if (variant.price === null || variant.price < 0) {
    flags.push("missing_price");
  }
  const ar = (variant.labelAr ?? variant.label).trim();
  const en = (variant.labelEn ?? variant.label).trim();
  if (!ar) flags.push("missing_name_ar");
  if (!en) flags.push("missing_name_en");
  return flags;
}

export function draftToSavePayload(draft: ImportDraft) {
  return {
    categories: draft.categories
      .filter((c) => c.items.length > 0)
      .map((c) => ({
        refId: c.id,
        nameAr: c.nameAr,
        nameEn: c.nameEn,
        items: c.items.map((item) => ({
          refId: item.id,
          nameAr: item.nameAr,
          nameEn: item.nameEn,
          descriptionAr: item.descriptionAr,
          descriptionEn: item.descriptionEn,
          price: item.price,
          sizes: (item.sizes ?? []).map((v) => ({
            refId: v.id,
            label: v.label,
            labelAr: v.labelAr,
            labelEn: v.labelEn,
            price: v.price,
          })),
          variants: item.variants.map((v) => ({
            refId: v.id,
            label: v.label,
            labelAr: v.labelAr,
            labelEn: v.labelEn,
            price: v.price,
          })),
          isAvailable: item.isAvailable,
          imageUrl: item.imageUrl,
        })),
      })),
  };
}

export function createEmptyItem(): ImportItem {
  return {
    id: generateImportId(),
    nameAr: "",
    nameEn: "",
    price: null,
    sizes: [],
    variants: [],
    isAvailable: true,
    flags: ["needs_review", "missing_price", "missing_name_ar", "missing_name_en"],
  };
}

export function createEmptyCategory(): ImportCategory {
  return {
    id: generateImportId(),
    nameAr: "",
    nameEn: "",
    items: [],
    flags: [],
    isCollapsed: false,
  };
}
