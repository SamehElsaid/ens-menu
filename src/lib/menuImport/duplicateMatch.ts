import type {
  ImportCategory,
  ImportDraft,
  ImportFlag,
  ImportItem,
  ImportVariant,
} from "@/types/menuImport";
import {
  menuNamesMatch,
  normalizeMenuName,
  pricesMatch,
} from "./normalizeMenuName";
import type {
  MenuSnapshot,
  MenuSnapshotCategory,
  MenuSnapshotItem,
} from "./menuSnapshot";

export type ItemMatchResult =
  | { kind: "none" }
  | { kind: "exact"; existing: MenuSnapshotItem }
  | { kind: "price_conflict"; existing: MenuSnapshotItem };

export function findMatchingCategory(
  nameAr: string,
  nameEn: string,
  categories: MenuSnapshotCategory[],
): MenuSnapshotCategory | null {
  for (const cat of categories) {
    if (menuNamesMatch(nameAr, nameEn, cat.nameAr, cat.nameEn)) {
      return cat;
    }
  }
  return null;
}

export function findMatchingItemInCategory(
  nameAr: string,
  nameEn: string,
  price: number,
  categoryId: number,
  items: MenuSnapshotItem[],
): ItemMatchResult {
  const inCategory = items.filter((item) => item.categoryId === categoryId);

  for (const existing of inCategory) {
    if (!menuNamesMatch(nameAr, nameEn, existing.nameAr, existing.nameEn)) {
      continue;
    }
    if (pricesMatch(price, existing.price)) {
      return { kind: "exact", existing };
    }
    return { kind: "price_conflict", existing };
  }

  return { kind: "none" };
}

function clearItemDuplicateMeta(item: ImportItem): ImportItem {
  const rest = { ...item };
  delete rest.duplicateMeta;
  return {
    ...rest,
    flags: item.flags.filter(
      (f) => f !== "duplicate" && f !== "price_conflict",
    ),
  };
}

function clearVariantDuplicateMeta(variant: ImportVariant): ImportVariant {
  const rest = { ...variant };
  delete rest.duplicateMeta;
  return {
    ...rest,
    flags: variant.flags.filter(
      (f) => f !== "duplicate" && f !== "price_conflict",
    ),
  };
}

function applyItemDuplicateMeta(
  item: ImportItem,
  nameAr: string,
  nameEn: string,
  price: number,
  categoryId: number,
  snapshot: MenuSnapshot,
): ImportItem {
  const match = findMatchingItemInCategory(
    nameAr,
    nameEn,
    price,
    categoryId,
    snapshot.items,
  );

  if (match.kind === "none") {
    return clearItemDuplicateMeta(item);
  }

  if (match.kind === "exact") {
    return {
      ...item,
      flags: [...item.flags.filter((f) => f !== "price_conflict"), "duplicate"],
      duplicateMeta: {
        status: "exact_duplicate",
        existingItemId: match.existing.id,
        existingPrice: match.existing.price,
        resolution: "skip",
      },
    };
  }

  return {
    ...item,
    flags: [
      ...item.flags.filter((f) => f !== "duplicate"),
      "price_conflict",
    ],
    duplicateMeta: {
      status: "price_conflict",
      existingItemId: match.existing.id,
      existingPrice: match.existing.price,
      resolution: item.duplicateMeta?.resolution,
    },
  };
}

function resolveCategoryIdForDraftCategory(
  category: ImportCategory,
  snapshot: MenuSnapshot,
): number | null {
  const matched = findMatchingCategory(
    category.nameAr,
    category.nameEn,
    snapshot.categories,
  );
  return matched?.id ?? null;
}

export function annotateDraftWithSnapshot(
  draft: ImportDraft,
  snapshot: MenuSnapshot,
): ImportDraft {
  const categories = draft.categories.map((category) => {
    const matchedCategoryId = resolveCategoryIdForDraftCategory(
      category,
      snapshot,
    );

    const items = category.items.map((item) => {
      if ((item.sizes?.length ?? 0) > 0) {
        const sizes = item.sizes!.map((variant) => {
          if (matchedCategoryId === null) {
            return clearVariantDuplicateMeta(variant);
          }
          const vAr = variant.labelAr ?? variant.label;
          const vEn = variant.labelEn ?? variant.label;
          const nameAr = item.nameAr.trim()
            ? `${item.nameAr.trim()} - ${vAr.trim()}`
            : vAr.trim();
          const nameEn = item.nameEn.trim()
            ? `${item.nameEn.trim()} - ${vEn.trim()}`
            : vEn.trim();
          if (variant.price === null || !Number.isFinite(variant.price)) {
            return clearVariantDuplicateMeta(variant);
          }

          const match = findMatchingItemInCategory(
            nameAr,
            nameEn,
            variant.price,
            matchedCategoryId,
            snapshot.items,
          );
          return applyVariantDuplicateMeta(variant, match);
        });

        const hasPriceConflict = sizes.some((v) =>
          v.flags.includes("price_conflict"),
        );
        const allExact =
          sizes.length > 0 &&
          sizes.every(
            (v) =>
              v.duplicateMeta?.status === "exact_duplicate" || !v.duplicateMeta,
          );

        const itemFlags: ImportFlag[] = hasPriceConflict
          ? [...item.flags.filter((f) => f !== "duplicate"), "price_conflict"]
          : allExact && sizes.some((v) => v.flags.includes("duplicate"))
            ? [...item.flags.filter((f) => f !== "price_conflict"), "duplicate"]
            : item.flags.filter(
                (f) => f !== "duplicate" && f !== "price_conflict",
              );

        const itemRest = { ...item };
        delete itemRest.duplicateMeta;
        return {
          ...itemRest,
          sizes,
          flags: itemFlags,
        };
      }

      if (matchedCategoryId === null || item.price === null) {
        return clearItemDuplicateMeta(item);
      }

      return applyItemDuplicateMeta(
        item,
        item.nameAr,
        item.nameEn,
        item.price,
        matchedCategoryId,
        snapshot,
      );
    });

    const matchedCategory = matchedCategoryId
      ? snapshot.categories.find((c) => c.id === matchedCategoryId)
      : null;

    return {
      ...category,
      matchedCategoryId: matchedCategoryId ?? undefined,
      duplicateMeta: matchedCategory
        ? {
            status: "exact_duplicate" as const,
            existingCategoryId: matchedCategory.id,
            resolution: "reuse" as const,
          }
        : undefined,
      items,
    };
  });

  return { ...draft, categories };
}

function applyVariantDuplicateMeta(
  variant: ImportVariant,
  match: ItemMatchResult,
): ImportVariant {
  if (match.kind === "none") {
    return clearVariantDuplicateMeta(variant);
  }

  if (match.kind === "exact") {
    return {
      ...variant,
      flags: [
        ...variant.flags.filter((f) => f !== "price_conflict"),
        "duplicate",
      ],
      duplicateMeta: {
        status: "exact_duplicate",
        existingItemId: match.existing.id,
        existingPrice: match.existing.price,
        resolution: "skip",
      },
    };
  }

  return {
    ...variant,
    flags: [
      ...variant.flags.filter((f) => f !== "duplicate"),
      "price_conflict",
    ],
    duplicateMeta: {
      status: "price_conflict",
      existingItemId: match.existing.id,
      existingPrice: match.existing.price,
      resolution: variant.duplicateMeta?.resolution,
    },
  };
}

export function collectUnresolvedPriceConflicts(
  draft: ImportDraft,
): { refId: string; nameAr: string; nameEn: string }[] {
  const unresolved: { refId: string; nameAr: string; nameEn: string }[] = [];

  for (const category of draft.categories) {
    for (const item of category.items) {
      if ((item.sizes?.length ?? 0) > 0) {
        for (const variant of item.sizes!) {
          if (
            variant.flags.includes("price_conflict") &&
            !variant.duplicateMeta?.resolution
          ) {
            unresolved.push({
              refId: variant.id,
              nameAr: item.nameAr,
              nameEn: item.nameEn,
            });
          }
        }
      } else if (
        item.flags.includes("price_conflict") &&
        !item.duplicateMeta?.resolution
      ) {
        unresolved.push({
          refId: item.id,
          nameAr: item.nameAr,
          nameEn: item.nameEn,
        });
      }
    }
  }

  return unresolved;
}

export function collectPriceConflictRefIds(draft: ImportDraft): string[] {
  const refIds: string[] = [];

  for (const category of draft.categories) {
    for (const item of category.items) {
      if ((item.sizes?.length ?? 0) > 0) {
        for (const variant of item.sizes!) {
          if (variant.flags.includes("price_conflict")) {
            refIds.push(variant.id);
          }
        }
      } else if (item.flags.includes("price_conflict")) {
        refIds.push(item.id);
      }
    }
  }

  return refIds;
}

export function collectExactDuplicateRefIds(draft: ImportDraft): string[] {
  const refIds: string[] = [];

  for (const category of draft.categories) {
    for (const item of category.items) {
      if ((item.sizes?.length ?? 0) > 0) {
        for (const variant of item.sizes!) {
          if (variant.duplicateMeta?.status === "exact_duplicate") {
            refIds.push(variant.id);
          }
        }
      } else if (item.duplicateMeta?.status === "exact_duplicate") {
        refIds.push(item.id);
      }
    }
  }

  return refIds;
}

export function countDuplicateStats(draft: ImportDraft) {
  let exactDuplicates = 0;
  let priceConflicts = 0;
  let unresolvedConflicts = 0;
  let reusedCategories = 0;

  for (const category of draft.categories) {
    if (category.matchedCategoryId) reusedCategories++;
    for (const item of category.items) {
      if ((item.sizes?.length ?? 0) > 0) {
        for (const variant of item.sizes!) {
          if (variant.duplicateMeta?.status === "exact_duplicate") {
            exactDuplicates++;
          }
          if (variant.flags.includes("price_conflict")) {
            priceConflicts++;
            if (!variant.duplicateMeta?.resolution) unresolvedConflicts++;
          }
        }
      } else {
        if (item.duplicateMeta?.status === "exact_duplicate") {
          exactDuplicates++;
        }
        if (item.flags.includes("price_conflict")) {
          priceConflicts++;
          if (!item.duplicateMeta?.resolution) unresolvedConflicts++;
        }
      }
    }
  }

  return {
    exactDuplicates,
    priceConflicts,
    unresolvedConflicts,
    reusedCategories,
  };
}

/** Lookup key for in-memory dedup during a single save run */
export function itemDedupKey(
  categoryId: number,
  nameAr: string,
  nameEn: string,
): string {
  return `${categoryId}:${normalizeMenuName(nameAr)}|${normalizeMenuName(nameEn)}`;
}
