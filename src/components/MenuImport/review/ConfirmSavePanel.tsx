"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { ImportDraft } from "@/types/menuImport";
import { computeConfirmSavePreview } from "@/lib/menuImport/buildBulkCategoriesPayload";
import {
  formatMenuPrice,
  formatMenuPriceRange,
} from "@/lib/formatMenuPrice";
import { IoCloseOutline } from "react-icons/io5";

interface ConfirmSavePanelProps {
  draft: ImportDraft;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function StatRow({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  tone?: "default" | "muted" | "warning" | "success";
}) {
  const valueClass =
    tone === "warning"
      ? "text-amber-700 dark:text-amber-300"
      : tone === "success"
        ? "text-emerald-700 dark:text-emerald-300"
        : tone === "muted"
          ? "text-slate-500 dark:text-slate-400"
          : "text-slate-900 dark:text-slate-100";

  return (
    <li className="flex items-start justify-between gap-3 py-2 border-b border-slate-100/80 last:border-0 dark:border-slate-700/60">
      <span className="min-w-0 flex-1 text-sm leading-snug text-slate-600 dark:text-slate-400">
        {label}
      </span>
      <span
        dir="ltr"
        className={`shrink-0 text-end text-sm font-semibold tabular-nums ${valueClass}`}
      >
        {value}
      </span>
    </li>
  );
}

export default function ConfirmSavePanel({
  draft,
  isSaving,
  onClose,
  onConfirm,
}: ConfirmSavePanelProps) {
  const t = useTranslations("MenuImport");
  const [agreed, setAgreed] = useState(false);
  const preview = useMemo(
    () => computeConfirmSavePreview(draft),
    [draft],
  );
  const locale = draft.locale;
  const currency = draft.currency;

  const showVariants =
    preview.variantCount > 0 &&
    preview.variantCount !== preview.itemsInPayload;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-h-[min(92dvh,720px)] w-full flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800 sm:max-w-lg sm:rounded-2xl animate-[fadeIn_0.2s_ease-out]"
      >
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-5 sm:px-6 sm:pt-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold leading-snug text-slate-900 dark:text-slate-100 sm:text-xl">
              {t("confirmTitle")}
            </h3>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="shrink-0 p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50"
            >
              <IoCloseOutline className="text-2xl" />
            </button>
          </div>

          <p className="mb-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {t("confirmDescription")}
          </p>

          <div className="mb-4 rounded-xl border border-purple-100/90 bg-gradient-to-br from-purple-50/70 via-white to-slate-50/60 p-3.5 dark:border-purple-900/35 dark:from-purple-950/25 dark:via-slate-800 dark:to-slate-900/40 sm:p-4">
            <p className="mb-2.5 text-xs font-semibold tracking-wide text-purple-800/70 dark:text-purple-300/70">
              {t("confirmAnalyticsTitle")}
            </p>

            <ul className="space-y-0">
              <StatRow
                label={t("confirmCategories")}
                value={preview.categoriesInPayload}
              />
              <StatRow
                label={t("confirmItemsReady")}
                value={preview.itemsInPayload}
              />
              {showVariants && (
                <StatRow
                  label={t("confirmVariants")}
                  value={preview.variantCount}
                  tone="muted"
                />
              )}
              {preview.itemsAdded > 0 && preview.itemsUpdated > 0 && (
                <StatRow
                  label={t("confirmNewItems")}
                  value={preview.itemsAdded}
                  tone="success"
                />
              )}
              {preview.itemsUpdated > 0 && (
                <StatRow
                  label={t("confirmPriceUpdates")}
                  value={preview.itemsUpdated}
                  tone="success"
                />
              )}
              {preview.missingPriceCount > 0 && (
                <StatRow
                  label={t("confirmMissingPriceExcluded")}
                  value={preview.missingPriceCount}
                  tone="warning"
                />
              )}
              {preview.itemsSkippedDuplicate > 0 && (
                <StatRow
                  label={t("confirmSkippedDuplicates")}
                  value={preview.itemsSkippedDuplicate}
                  tone="muted"
                />
              )}
              {preview.avgPrice != null && (
                <StatRow
                  label={t("confirmAvgPrice")}
                  value={formatMenuPrice(preview.avgPrice, currency, locale)}
                />
              )}
              {preview.minPrice != null &&
                preview.maxPrice != null &&
                preview.minPrice !== preview.maxPrice && (
                  <StatRow
                    label={t("confirmPriceRange")}
                    value={formatMenuPriceRange(
                      preview.minPrice,
                      preview.maxPrice,
                      currency,
                      locale,
                    )}
                    tone="muted"
                  />
                )}
            </ul>

            {preview.categoryBreakdown.length > 0 && (
              <div className="mt-3 border-t border-purple-100/80 pt-3 dark:border-purple-900/30">
                <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                  {t("confirmCategoryBreakdown")}
                </p>
                <ul className="space-y-1.5">
                  {preview.categoryBreakdown.slice(0, 8).map((category) => (
                    <li
                      key={category.id}
                      className="flex items-center justify-between gap-2 rounded-lg bg-white/80 px-2.5 py-1.5 text-xs ring-1 ring-slate-200/80 dark:bg-slate-900/50 dark:ring-slate-700/80"
                    >
                      <span className="min-w-0 truncate text-slate-700 dark:text-slate-300">
                        {category.name}
                      </span>
                      <span
                        dir="ltr"
                        className="shrink-0 font-semibold tabular-nums text-slate-500 dark:text-slate-400"
                      >
                        {category.count}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
            {t("confirmWarning")}
          </p>
        </div>

        <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-slate-700 dark:bg-slate-800 sm:px-6">
          <label className="mb-4 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={isSaving}
              className="mt-0.5 size-4 shrink-0 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className="text-sm leading-snug text-slate-700 dark:text-slate-300">
              {t("confirmCheckbox")}
            </span>
          </label>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
            <button
              type="button"
              disabled={!agreed || isSaving}
              onClick={onConfirm}
              className="min-h-11 flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? t("saving") : t("confirmSave")}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="min-h-11 flex-1 rounded-xl border-2 border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {t("backToEdit")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
