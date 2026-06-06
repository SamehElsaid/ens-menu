"use client";

import { useLocale, useTranslations } from "next-intl";
import type { ImportDraft, ImportError } from "@/types/menuImport";
import type { SaveBlockingError } from "@/types/menuImport";
import ReviewCategoryBlock from "../review/ReviewCategoryBlock";
import ConfirmSavePanel from "../review/ConfirmSavePanel";
import SaveResultPanel from "../review/SaveResultPanel";
import SaveProgressOverlay from "../shared/SaveProgressOverlay";
import { countDuplicateStats } from "@/lib/menuImport/duplicateMatch";
import { IoAddCircleOutline } from "react-icons/io5";

interface ReviewStepProps {
  draft: ImportDraft;
  parseErrors: string[];
  blockingErrors: SaveBlockingError[];
  blockingPriceErrors: SaveBlockingError[];
  blockingNameErrors: SaveBlockingError[];
  unresolvedPriceConflicts: { refId: string; nameAr: string; nameEn: string }[];
  canProceedToConfirm: boolean;
  duplicatesLoading: boolean;
  confirmOpen: boolean;
  isSaving: boolean;
  saveResult: import("@/types/menuImport").SaveMenuImportResponse | null;
  saveError: ImportError | null;
  menuId: string;
  onNewUpload: () => void;
  onOpenConfirm: () => void;
  onCloseConfirm: () => void;
  onConfirmSave: () => void;
  onUpdateCategory: (
    categoryId: string,
    patch: Partial<ImportDraft["categories"][0]>,
  ) => void;
  onUpdateItem: (
    categoryId: string,
    itemId: string,
    patch: Partial<ImportDraft["categories"][0]["items"][0]>,
  ) => void;
  onUpdateVariant: (
    categoryId: string,
    itemId: string,
    variantId: string,
    patch: Partial<ImportDraft["categories"][0]["items"][0]["variants"][0]>,
  ) => void;
  onDeleteItem: (categoryId: string, itemId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onAddItem: (categoryId: string) => void;
  onAddCategory: () => void;
  onAddVariant: (categoryId: string, itemId: string) => void;
  onRemoveVariant: (
    categoryId: string,
    itemId: string,
    variantId: string,
  ) => void;
  onItemImage: (
    categoryId: string,
    itemId: string,
    imageUrl: string | undefined,
  ) => void;
  onResolveDuplicate: (
    categoryId: string,
    itemId: string,
    resolution: "skip" | "update_price",
    variantId?: string,
  ) => void;
}

export default function ReviewStep({
  draft,
  parseErrors,
  blockingPriceErrors,
  blockingNameErrors,
  unresolvedPriceConflicts,
  canProceedToConfirm,
  duplicatesLoading,
  confirmOpen,
  isSaving,
  saveResult,
  saveError,
  menuId,
  onNewUpload,
  onOpenConfirm,
  onCloseConfirm,
  onConfirmSave,
  onUpdateCategory,
  onUpdateItem,
  onUpdateVariant,
  onDeleteItem,
  onDeleteCategory,
  onAddItem,
  onAddCategory,
  onAddVariant,
  onRemoveVariant,
  onItemImage,
  onResolveDuplicate,
}: ReviewStepProps) {
  const t = useTranslations("MenuImport");
  const locale = useLocale();
  const dupStats = countDuplicateStats(draft);

  if (saveResult) {
    return (
      <SaveResultPanel
        result={saveResult}
        menuId={menuId}
        onNewUpload={onNewUpload}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {t("reviewTitle")}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("reviewDescription")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
            {t("statCategories", { count: draft.stats.categoryCount })}
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
            {t("statItems", { count: draft.stats.itemCount })}
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
            {t("statExpandedItems", {
              count: draft.stats.expandedItemCount,
            })}
          </span>
          {dupStats.exactDuplicates > 0 && (
            <span className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium">
              {t("statDuplicates", { count: dupStats.exactDuplicates })}
            </span>
          )}
          {dupStats.priceConflicts > 0 && (
            <span className="px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 font-medium">
              {t("statPriceConflicts", { count: dupStats.priceConflicts })}
            </span>
          )}
          {draft.stats.missingPriceCount > 0 && (
            <span className="px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 font-medium">
              {t("statMissingPrices", {
                count: draft.stats.missingPriceCount,
              })}
            </span>
          )}
          {draft.stats.missingNameCount > 0 && (
            <span className="px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 font-medium">
              {t("statMissingNames", {
                count: draft.stats.missingNameCount,
              })}
            </span>
          )}
        </div>
      </div>

      {duplicatesLoading && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
          {t("checkingDuplicates")}
        </div>
      )}

      {saveError?.message === "save_timeout_long" && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-900 dark:text-amber-200">
          {t("saveTimeoutLong")}
        </div>
      )}

      {!canProceedToConfirm && !duplicatesLoading && (
        <div className="space-y-2">
          {blockingPriceErrors.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-200">
              {t("missingPriceBlock", { count: blockingPriceErrors.length })}
            </div>
          )}
          {blockingNameErrors.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-200">
              {t("missingNameBlock", { count: blockingNameErrors.length })}
            </div>
          )}
          {unresolvedPriceConflicts.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-200">
              {t("unresolvedPriceConflicts", {
                count: unresolvedPriceConflicts.length,
              })}
            </div>
          )}
        </div>
      )}

      {parseErrors.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">
          {t("parseErrorsNotice", { count: parseErrors.length })}
        </div>
      )}

      <div className="space-y-3">
        {draft.categories.map((category) => (
          <ReviewCategoryBlock
            key={category.id}
            category={category}
            currency={draft.currency}
            locale={locale}
            onUpdateCategory={(patch) => onUpdateCategory(category.id, patch)}
            onUpdateItem={(itemId, patch) =>
              onUpdateItem(category.id, itemId, patch)
            }
            onUpdateVariant={(itemId, variantId, patch) =>
              onUpdateVariant(category.id, itemId, variantId, patch)
            }
            onDeleteItem={(itemId) => onDeleteItem(category.id, itemId)}
            onDeleteCategory={() => onDeleteCategory(category.id)}
            onAddItem={() => onAddItem(category.id)}
            onAddVariant={(itemId) => onAddVariant(category.id, itemId)}
            onRemoveVariant={(itemId, variantId) =>
              onRemoveVariant(category.id, itemId, variantId)
            }
            onItemImage={(itemId, url) =>
              onItemImage(category.id, itemId, url)
            }
            onResolveDuplicate={(itemId, resolution, variantId) =>
              onResolveDuplicate(category.id, itemId, resolution, variantId)
            }
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onAddCategory}
        disabled={isSaving}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary transition-colors text-sm font-medium disabled:opacity-50"
      >
        <IoAddCircleOutline className="text-lg" />
        {t("addCategory")}
      </button>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={onNewUpload}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          {t("newUpload")}
        </button>
        <button
          type="button"
          disabled={!canProceedToConfirm || isSaving}
          onClick={onOpenConfirm}
          title={!canProceedToConfirm ? t("blockingHint") : undefined}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {t("proceedToConfirm")}
        </button>
      </div>

      {confirmOpen && (
        <ConfirmSavePanel
          draft={draft}
          isSaving={isSaving}
          onClose={onCloseConfirm}
          onConfirm={onConfirmSave}
        />
      )}

      <SaveProgressOverlay visible={isSaving && !saveResult} />
    </div>
  );
}

