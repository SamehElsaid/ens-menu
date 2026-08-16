import type { ImportDraft } from "@/types/menuImport";
import { countBulkSaveStats } from "./buildBulkCategoriesPayload";

export const FREE_PLAN_DEFAULT_MAX_PRODUCTS = -1;

export function getImportProductLimitInfo(
  draft: ImportDraft,
  currentItemCount: number,
  _maxProductsPerMenu: number = FREE_PLAN_DEFAULT_MAX_PRODUCTS,
) {
  void _maxProductsPerMenu;
  const importCount = countBulkSaveStats(draft).itemsInPayload;
  const totalAfter = currentItemCount + importCount;

  return {
    importCount,
    currentCount: currentItemCount,
    maxProducts: -1,
    totalAfter,
    exceedsLimit: false,
    remaining: -1,
  };
}
