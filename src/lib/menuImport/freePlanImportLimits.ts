import type { ImportDraft } from "@/types/menuImport";
import { countBulkSaveStats } from "./buildBulkCategoriesPayload";

export const FREE_PLAN_DEFAULT_MAX_PRODUCTS = 50;

export function getImportProductLimitInfo(
  draft: ImportDraft,
  currentItemCount: number,
  maxProductsPerMenu: number = FREE_PLAN_DEFAULT_MAX_PRODUCTS,
) {
  const importCount = countBulkSaveStats(draft).itemsInPayload;
  const totalAfter = currentItemCount + importCount;

  return {
    importCount,
    currentCount: currentItemCount,
    maxProducts: maxProductsPerMenu,
    totalAfter,
    exceedsLimit: totalAfter > maxProductsPerMenu,
    remaining: Math.max(0, maxProductsPerMenu - currentItemCount),
  };
}
