"use client";

import { useTranslations } from "next-intl";
import LinkTo from "@/components/Global/LinkTo";
import type { SaveMenuImportResponse } from "@/types/menuImport";
import {
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoAlertCircleOutline,
  IoImageOutline,
} from "react-icons/io5";

interface SaveResultPanelProps {
  result: SaveMenuImportResponse;
  menuId: string;
  onNewUpload: () => void;
}

function reasonLabel(
  t: ReturnType<typeof useTranslations<"MenuImport">>,
  reason: string,
): string {
  const known = [
    "create_failed",
    "update_failed",
    "token_expired",
    "network_error",
    "invalid_response",
    "duplicate_skipped",
  ] as const;
  if (known.includes(reason as (typeof known)[number])) {
    return t(`saveReason_${reason}` as "saveReason_create_failed");
  }
  return reason;
}

export default function SaveResultPanel({
  result,
  menuId,
  onNewUpload,
}: SaveResultPanelProps) {
  const t = useTranslations("MenuImport");
  const { summary, errors, ok, partial } = result;

  const Icon = ok
    ? IoCheckmarkCircleOutline
    : partial
      ? IoWarningOutline
      : IoAlertCircleOutline;

  const iconClass = ok
    ? "text-emerald-500"
    : partial
      ? "text-amber-500"
      : "text-red-500";

  const allSkipped =
    ok &&
    summary.itemsAdded === 0 &&
    summary.itemsUpdated === 0 &&
    summary.itemsSkippedDuplicate > 0;

  return (
    <div className="max-w-lg mx-auto text-center py-8 space-y-6">
      <Icon className={`text-5xl mx-auto ${iconClass}`} />
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {ok
            ? allSkipped
              ? t("saveAllSkippedTitle")
              : t("saveSuccessTitle")
            : partial
              ? t("savePartialTitle")
              : t("saveFailTitle")}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {ok && !allSkipped
            ? t("saveSuccessDetail", {
                categories: summary.categoriesAdded + summary.categoriesReused,
                items: summary.itemsAdded + summary.itemsUpdated,
              })
            : partial
              ? t("savePartialDetail")
              : t("saveFailDetail")}
        </p>
      </div>

      <div className="text-start rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden text-sm">
        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
          <li className="flex justify-between px-4 py-2.5">
            <span className="text-slate-600 dark:text-slate-400">
              {t("reportCategoriesAdded")}
            </span>
            <span className="font-semibold tabular-nums">
              {summary.categoriesAdded}
            </span>
          </li>
          <li className="flex justify-between px-4 py-2.5">
            <span className="text-slate-600 dark:text-slate-400">
              {t("reportCategoriesReused")}
            </span>
            <span className="font-semibold tabular-nums">
              {summary.categoriesReused}
            </span>
          </li>
          <li className="flex justify-between px-4 py-2.5">
            <span className="text-slate-600 dark:text-slate-400">
              {t("reportItemsAdded")}
            </span>
            <span className="font-semibold tabular-nums text-emerald-600">
              {summary.itemsAdded}
            </span>
          </li>
          <li className="flex justify-between px-4 py-2.5">
            <span className="text-slate-600 dark:text-slate-400">
              {t("reportItemsUpdated")}
            </span>
            <span className="font-semibold tabular-nums text-primary">
              {summary.itemsUpdated}
            </span>
          </li>
          <li className="flex justify-between px-4 py-2.5">
            <span className="text-slate-600 dark:text-slate-400">
              {t("reportItemsSkipped")}
            </span>
            <span className="font-semibold tabular-nums text-slate-500">
              {summary.itemsSkippedDuplicate}
            </span>
          </li>
          {summary.itemsFailed > 0 && (
            <li className="flex justify-between px-4 py-2.5 bg-red-50 dark:bg-red-900/10">
              <span className="text-red-700 dark:text-red-300">
                {t("reportItemsFailed")}
              </span>
              <span className="font-semibold tabular-nums text-red-600">
                {summary.itemsFailed}
              </span>
            </li>
          )}
        </ul>
      </div>

      {errors.length > 0 && (
        <div className="text-start rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <p className="px-4 py-2 text-sm font-medium bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {t("saveErrorsTitle", { count: errors.length })}
          </p>
          <ul className="max-h-48 overflow-auto divide-y divide-slate-100 dark:divide-slate-700">
            {errors.slice(0, 20).map((err, i) => (
              <li
                key={`${err.refId ?? i}`}
                className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400"
              >
                <span className="font-medium">
                  {err.nameAr || err.nameEn || err.type}
                </span>
                {" — "}
                {reasonLabel(t, err.reason)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {ok && (
        <div className="text-start rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 space-y-2">
          <div className="flex items-start gap-3">
            <IoImageOutline className="text-2xl text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {t("saveNextStepImagesTitle")}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {t("saveNextStepImagesBody")}
              </p>
              <LinkTo
                href={`/dashboard/${menuId}/items`}
                className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-primary hover:underline"
              >
                {t("saveNextStepImagesCta")}
              </LinkTo>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <LinkTo
          href={`/dashboard/${menuId}/items`}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90"
        >
          {t("goToItems")}
        </LinkTo>
        <button
          type="button"
          onClick={onNewUpload}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium"
        >
          {t("newUpload")}
        </button>
      </div>
    </div>
  );
}

