import type {
  BulkImportCategory,
  BulkImportItem,
  ExpandedSaveItem,
  ImportDraft,
} from "@/types/menuImport";
import { expandItemForSave } from "./draftSaveUtils";

function shouldIncludeSaveItem(saveItem: ExpandedSaveItem): boolean {
  const meta = saveItem.duplicateMeta;
  if (meta?.resolution === "skip") return false;
  if (meta?.status === "exact_duplicate") return false;
  return true;
}

function toBulkItem(saveItem: ExpandedSaveItem): BulkImportItem {
  return {
    id: saveItem.refId,
    nameAr: saveItem.nameAr.trim() || saveItem.nameEn.trim(),
    nameEn: saveItem.nameEn.trim() || saveItem.nameAr.trim(),
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
