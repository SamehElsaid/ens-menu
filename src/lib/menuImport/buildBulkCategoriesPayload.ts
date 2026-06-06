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
