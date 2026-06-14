import type {
  BulkImportCategory,
  BulkImportItem,
  ExpandedSaveItem,
  ImportDraft,
  SaveImportErrorEntry,
  SaveMenuImportResponse,
} from "@/types/menuImport";
import {
  collectAllBlockingErrors,
  countExpandedItems,
  expandItemForSave,
} from "./draftSaveUtils";

function shouldIncludeSaveItem(saveItem: ExpandedSaveItem): boolean {
  const meta = saveItem.duplicateMeta;
  if (meta?.resolution === "skip") return false;
  if (meta?.status === "exact_duplicate") return false;
  return true;
}

function toBulkItem(saveItem: ExpandedSaveItem): BulkImportItem {
  const descriptionAr = saveItem.descriptionAr?.trim();
  const descriptionEn = saveItem.descriptionEn?.trim();

  return {
    id: saveItem.refId,
    nameAr: saveItem.nameAr.trim() || saveItem.nameEn.trim(),
    nameEn: saveItem.nameEn.trim() || saveItem.nameAr.trim(),
    ...(descriptionAr ? { descriptionAr } : {}),
    ...(descriptionEn ? { descriptionEn } : {}),
    price: saveItem.price,
    isAvailable: saveItem.isAvailable,
    ...(saveItem.imageUrl
      ? { imageUrl: saveItem.imageUrl, image: saveItem.imageUrl }
      : {}),
  };
}

export function buildBulkCategoriesPayload(
  draft: ImportDraft,
): BulkImportCategory[] {
  const categories: BulkImportCategory[] = [];

  for (const category of draft.categories) {
    const items: BulkImportItem[] = [];

    for (const item of category.items) {
      const expanded = expandItemForSave(item).filter(
        (saveItem) =>
          saveItem.price !== null &&
          Number.isFinite(saveItem.price) &&
          shouldIncludeSaveItem(saveItem),
      );

      for (const saveItem of expanded) {
        items.push(toBulkItem(saveItem));
      }
    }

    if (items.length === 0) continue;

    categories.push({
      id: category.id,
      nameAr: category.nameAr.trim() || category.nameEn.trim(),
      nameEn: category.nameEn.trim() || category.nameAr.trim(),
      ...(category.imageUrl
        ? { imageUrl: category.imageUrl, image: category.imageUrl }
        : {}),
      items,
    });
  }

  return categories;
}

export function countBulkSaveStats(draft: ImportDraft) {
  const payload = buildBulkCategoriesPayload(draft);
  const itemsInPayload = payload.reduce(
    (sum, category) => sum + category.items.length,
    0,
  );

  let itemsSkippedDuplicate = 0;
  let itemsUpdated = 0;

  for (const category of draft.categories) {
    for (const item of category.items) {
      for (const saveItem of expandItemForSave(item)) {
        if (saveItem.price === null || !Number.isFinite(saveItem.price)) continue;

        if (!shouldIncludeSaveItem(saveItem)) {
          itemsSkippedDuplicate++;
          continue;
        }

        if (saveItem.duplicateMeta?.resolution === "update_price") {
          itemsUpdated++;
        }
      }
    }
  }

  const itemsAdded = itemsInPayload - itemsUpdated;
  const categoriesRequested = draft.categories.filter((c) => c.items.length > 0)
    .length;

  return {
    payload,
    categoriesRequested,
    categoriesInPayload: payload.length,
    itemsInPayload,
    itemsAdded,
    itemsUpdated,
    itemsSkippedDuplicate,
  };
}

export interface ConfirmSavePreview {
  categoriesInPayload: number;
  itemsInPayload: number;
  itemsAdded: number;
  itemsUpdated: number;
  itemsSkippedDuplicate: number;
  variantCount: number;
  missingPriceCount: number;
  avgPrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  categoryBreakdown: { id: string; name: string; count: number }[];
}

export function computeConfirmSavePreview(
  draft: ImportDraft,
): ConfirmSavePreview {
  const bulk = countBulkSaveStats(draft);
  const prices: number[] = [];

  for (const category of bulk.payload) {
    for (const item of category.items) {
      if (item.price != null && Number.isFinite(item.price)) {
        prices.push(item.price);
      }
    }
  }

  const categoryBreakdownRaw = bulk.payload
    .map((category) => ({
      id: category.id,
      name:
        (draft.locale === "ar" ? category.nameAr : category.nameEn) ||
        category.nameAr ||
        category.nameEn,
      count: category.items.length,
    }))
    .sort((a, b) => b.count - a.count);

  const categoryBreakdownMerged = new Map<
    string,
    { id: string; name: string; count: number }
  >();
  for (const category of categoryBreakdownRaw) {
    const mergeKey = category.name.trim().toLowerCase();
    const existing = categoryBreakdownMerged.get(mergeKey);
    if (existing) {
      existing.count += category.count;
    } else {
      categoryBreakdownMerged.set(mergeKey, { ...category });
    }
  }
  const categoryBreakdown = [...categoryBreakdownMerged.values()].sort(
    (a, b) => b.count - a.count,
  );

  return {
    categoriesInPayload: bulk.categoriesInPayload,
    itemsInPayload: bulk.itemsInPayload,
    itemsAdded: bulk.itemsAdded,
    itemsUpdated: bulk.itemsUpdated,
    itemsSkippedDuplicate: bulk.itemsSkippedDuplicate,
    variantCount: draft.stats.variantCount,
    missingPriceCount: draft.stats.missingPriceCount,
    avgPrice: prices.length
      ? prices.reduce((sum, price) => sum + price, 0) / prices.length
      : null,
    minPrice: prices.length ? Math.min(...prices) : null,
    maxPrice: prices.length ? Math.max(...prices) : null,
    categoryBreakdown,
  };
}

function buildSummary(
  draft: ImportDraft,
  counts: {
    categoriesAdded: number;
    categoriesReused: number;
    categoriesFailed: number;
    itemsAdded: number;
    itemsUpdated: number;
    itemsSkippedDuplicate: number;
    itemsFailed: number;
  },
) {
  const categoriesRequested = draft.categories.filter((c) => c.items.length > 0)
    .length;
  const itemsRequested = countExpandedItems(draft);

  return {
    categoriesRequested,
    categoriesSaved: counts.categoriesAdded + counts.categoriesReused,
    categoriesFailed: counts.categoriesFailed,
    itemsRequested,
    itemsSaved: counts.itemsAdded + counts.itemsUpdated,
    itemsFailed: counts.itemsFailed,
    categoriesAdded: counts.categoriesAdded,
    categoriesReused: counts.categoriesReused,
    itemsAdded: counts.itemsAdded,
    itemsSkippedDuplicate: counts.itemsSkippedDuplicate,
    itemsUpdated: counts.itemsUpdated,
  };
}

function emptySummary(draft: ImportDraft) {
  return buildSummary(draft, {
    categoriesAdded: 0,
    categoriesReused: 0,
    categoriesFailed: 0,
    itemsAdded: 0,
    itemsUpdated: 0,
    itemsSkippedDuplicate: 0,
    itemsFailed: 0,
  });
}

export function buildMenuImportSaveResponse(
  draft: ImportDraft,
  options: {
    ok: boolean;
    partial?: boolean;
    stats?: ReturnType<typeof countBulkSaveStats>;
    errors?: SaveImportErrorEntry[];
    blockingErrors?: ReturnType<typeof collectAllBlockingErrors>;
    failed?: boolean;
  },
): SaveMenuImportResponse {
  const stats = options.stats ?? countBulkSaveStats(draft);

  if (options.blockingErrors?.length) {
    return {
      ok: false,
      partial: false,
      summary: emptySummary(draft),
      errors: [],
      blockingErrors: options.blockingErrors,
    };
  }

  if (options.ok) {
    return {
      ok: true,
      summary: buildSummary(draft, {
        categoriesAdded: stats.categoriesInPayload,
        categoriesReused: 0,
        categoriesFailed: 0,
        itemsAdded: stats.itemsAdded,
        itemsUpdated: stats.itemsUpdated,
        itemsSkippedDuplicate: stats.itemsSkippedDuplicate,
        itemsFailed: 0,
      }),
      errors: options.errors ?? [],
    };
  }

  if (options.failed) {
    return {
      ok: false,
      partial: false,
      summary: buildSummary(draft, {
        categoriesAdded: 0,
        categoriesReused: 0,
        categoriesFailed: stats.categoriesInPayload,
        itemsAdded: 0,
        itemsUpdated: 0,
        itemsSkippedDuplicate: stats.itemsSkippedDuplicate,
        itemsFailed: stats.itemsInPayload,
      }),
      errors: options.errors ?? [],
    };
  }

  return {
    ok: false,
    partial: options.partial ?? false,
    summary: emptySummary(draft),
    errors: options.errors ?? [],
  };
}
