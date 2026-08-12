"use client";

import { useTranslations } from "next-intl";
import LinkTo from "@/components/Global/LinkTo";
import type { SaveMenuImportResponse } from "@/types/menuImport";
import {
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoAlertCircleOutline,
  IoImageOutline,
  IoRefreshOutline,
} from "react-icons/io5";
import { cn } from "@/lib/cn";
import { Button, Card, buttonClasses } from "@/components/ui";

interface SaveResultPanelProps {
  result: SaveMenuImportResponse;
  menuId: string;
  onNewUpload: () => void;
  onRetrySave?: () => void;
  isRetrying?: boolean;
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
    "bulk_import_limit",
    "bulk_save_failed",
  ] as const;
  if (known.includes(reason as (typeof known)[number])) {
    return t(`saveReason_${reason}` as "saveReason_create_failed");
  }
  return reason;
}

const NON_RETRYABLE_REASONS = new Set(["bulk_import_limit"]);

function isRetryableFailure(result: SaveMenuImportResponse): boolean {
  if (result.ok) return false;
  if (result.errors.some((err) => NON_RETRYABLE_REASONS.has(err.reason))) {
    return false;
  }
  return true;
}

type ReportTone = "default" | "success" | "brand" | "muted" | "danger";

/**
 * The receipt.
 *
 * What came back from a save is a report, so it is drawn as one: a tone-filled
 * header that says how it went, the counts as a divided list of figures, the
 * failures as rows underneath, and the ways onward in a strip at the foot. The
 * previous version scattered those four things across three floating cards and
 * a centred icon medallion, which made the numbers — the only part anyone reads
 * twice — the quietest thing on the screen.
 */
export default function SaveResultPanel({
  result,
  menuId,
  onNewUpload,
  onRetrySave,
  isRetrying = false,
}: SaveResultPanelProps) {
  const t = useTranslations("MenuImport");
  const { summary, errors, ok, partial } = result;

  const Icon = ok
    ? IoCheckmarkCircleOutline
    : partial
      ? IoWarningOutline
      : IoAlertCircleOutline;

  const headerTone = ok
    ? "border-success-line bg-success-soft text-success-fg"
    : partial
      ? "border-warning-line bg-warning-soft text-warning-fg"
      : "border-danger-line bg-danger-soft text-danger-fg";

  const allSkipped =
    ok &&
    summary.itemsAdded === 0 &&
    summary.itemsUpdated === 0 &&
    summary.itemsSkippedDuplicate > 0;

  const hasBulkImportLimit = errors.some(
    (err) => err.reason === "bulk_import_limit",
  );

  const canRetry = isRetryableFailure(result) && !!onRetrySave;

  const reportRows: {
    key: string;
    label: string;
    value: number;
    tone: ReportTone;
  }[] = [
    {
      key: "categories-added",
      label: t("reportCategoriesAdded"),
      value: summary.categoriesAdded,
      tone: "default",
    },
    {
      key: "categories-reused",
      label: t("reportCategoriesReused"),
      value: summary.categoriesReused,
      tone: "default",
    },
    {
      key: "items-added",
      label: t("reportItemsAdded"),
      value: summary.itemsAdded,
      tone: "success",
    },
    {
      key: "items-updated",
      label: t("reportItemsUpdated"),
      value: summary.itemsUpdated,
      tone: "brand",
    },
    {
      key: "items-skipped",
      label: t("reportItemsSkipped"),
      value: summary.itemsSkippedDuplicate,
      tone: "muted",
    },
  ];

  if (summary.itemsFailed > 0) {
    reportRows.push({
      key: "items-failed",
      label: t("reportItemsFailed"),
      value: summary.itemsFailed,
      tone: "danger",
    });
  }

  return (
    <Card padded="none" className="mx-auto max-w-xl overflow-hidden text-start">
      <div
        className={cn(
          "flex items-start gap-2.5 border-b px-3 py-3 sm:px-4",
          headerTone,
        )}
      >
        <span
          className="mt-px flex size-7 shrink-0 items-center justify-center rounded-sm bg-surface/60 text-base"
          aria-hidden
        >
          <Icon />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-[-0.02em]">
            {ok
              ? allSkipped
                ? t("saveAllSkippedTitle")
                : t("saveSuccessTitle")
              : partial
                ? t("savePartialTitle")
                : t("saveFailTitle")}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-current/85">
            {ok && !allSkipped
              ? t("saveSuccessDetail", {
                  categories:
                    summary.categoriesAdded + summary.categoriesReused,
                  items: summary.itemsAdded + summary.itemsUpdated,
                })
              : partial
                ? t("savePartialDetail")
                : t("saveFailDetail")}
          </p>
        </div>
      </div>

      <div className="px-3 py-2.5 sm:px-4">
        <p className="ui-label">{t("reportTitle")}</p>
        {/* The counts are written out in order rather than appearing at once —
            35ms apart, capped at 280ms. It is the one stagger in the console,
            and it is here because this list is the answer to "did it work". */}
        <ul className="ui-tally mt-1.5 divide-y divide-line border-y border-line">
          {reportRows.map((row) => (
            <li
              key={row.key}
              className="flex items-baseline justify-between gap-3 py-2"
            >
              <span
                className={cn(
                  "min-w-0 text-[13px]",
                  row.tone === "danger" ? "text-danger-fg" : "text-fg-muted",
                )}
              >
                {row.label}
              </span>
              <span
                dir="ltr"
                className={cn(
                  "ui-figure shrink-0 text-[13px]",
                  row.tone === "success" && "text-success",
                  row.tone === "brand" && "text-brand",
                  row.tone === "muted" && "text-fg-muted",
                  row.tone === "danger" && "text-danger",
                  row.tone === "default" && "text-fg",
                )}
              >
                {row.value}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {errors.length > 0 && (
        <div className="border-t border-line">
          <p className="ui-label px-3 pt-2.5 sm:px-4">
            {t("saveErrorsTitle", { count: errors.length })}
          </p>
          <ul className="mt-1.5 max-h-48 divide-y divide-line overflow-auto border-t border-line">
            {errors.slice(0, 20).map((err, i) => (
              <li
                key={`${err.refId ?? i}`}
                className="px-3 py-1.5 text-xs text-fg-muted sm:px-4"
              >
                <span className="font-medium text-fg">
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
        <div className="flex items-start gap-2.5 border-t border-line bg-surface-2/40 px-3 py-3 sm:px-4">
          <span
            className="mt-px flex size-7 shrink-0 items-center justify-center rounded-sm border border-line bg-surface text-base text-fg-muted"
            aria-hidden
          >
            <IoImageOutline />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-fg">
              {t("saveNextStepImagesTitle")}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-fg-muted">
              {t("saveNextStepImagesBody")}
            </p>
            <LinkTo
              href={`/dashboard/${menuId}/items`}
              className={buttonClasses({
                variant: "link",
                size: "sm",
                className: "mt-1.5",
              })}
            >
              {t("saveNextStepImagesCta")}
            </LinkTo>
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-line px-3 py-3 sm:flex-row sm:justify-end sm:px-4">
        <Button variant="secondary" onClick={onNewUpload}>
          {t("newUpload")}
        </Button>
        {!ok && !hasBulkImportLimit && (
          <LinkTo
            href={`/dashboard/${menuId}/items`}
            className={buttonClasses({ variant: "secondary" })}
          >
            {t("goToItems")}
          </LinkTo>
        )}
        {canRetry && (
          <Button
            onClick={onRetrySave}
            loading={isRetrying}
            startIcon={<IoRefreshOutline className="text-base" />}
          >
            {isRetrying ? t("saving") : t("retryAnalysis")}
          </Button>
        )}
        {hasBulkImportLimit && (
          <LinkTo
            href={`/dashboard/${menuId}/subscription`}
            className={buttonClasses({ variant: "primary" })}
          >
            {t("freePlanLimitUpgrade")}
          </LinkTo>
        )}
        {ok && (
          <LinkTo
            href={`/dashboard/${menuId}/items`}
            className={buttonClasses({ variant: "primary" })}
          >
            {t("goToItems")}
          </LinkTo>
        )}
      </div>
    </Card>
  );
}
