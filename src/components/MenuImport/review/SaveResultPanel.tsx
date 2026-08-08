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

function ReportRow({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "success" | "brand" | "muted" | "danger";
}) {
  return (
    <li
      className={cn(
        "flex justify-between gap-3 border-b border-line px-4 py-2.5 last:border-b-0",
        tone === "danger" && "bg-danger-soft",
      )}
    >
      <span
        className={cn(
          "text-[13px]",
          tone === "danger" ? "text-danger-fg" : "text-fg-muted",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "text-[13px] font-semibold tabular-nums",
          tone === "success" && "text-success",
          tone === "brand" && "text-brand",
          tone === "muted" && "text-fg-muted",
          tone === "danger" && "text-danger",
          tone === "default" && "text-fg",
        )}
      >
        {value}
      </span>
    </li>
  );
}

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

  const iconWell = ok
    ? "bg-success-soft text-success-fg"
    : partial
      ? "bg-warning-soft text-warning-fg"
      : "bg-danger-soft text-danger-fg";

  const allSkipped =
    ok &&
    summary.itemsAdded === 0 &&
    summary.itemsUpdated === 0 &&
    summary.itemsSkippedDuplicate > 0;

  const hasBulkImportLimit = errors.some(
    (err) => err.reason === "bulk_import_limit",
  );

  const canRetry = isRetryableFailure(result) && !!onRetrySave;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 py-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <span
          className={cn(
            "flex size-14 items-center justify-center rounded-full text-3xl",
            iconWell,
          )}
          aria-hidden
        >
          <Icon />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.011em] text-fg">
            {ok
              ? allSkipped
                ? t("saveAllSkippedTitle")
                : t("saveSuccessTitle")
              : partial
                ? t("savePartialTitle")
                : t("saveFailTitle")}
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">
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
      </div>

      <Card padded="none" className="overflow-hidden text-start">
        <ul>
          <ReportRow
            label={t("reportCategoriesAdded")}
            value={summary.categoriesAdded}
          />
          <ReportRow
            label={t("reportCategoriesReused")}
            value={summary.categoriesReused}
          />
          <ReportRow
            label={t("reportItemsAdded")}
            value={summary.itemsAdded}
            tone="success"
          />
          <ReportRow
            label={t("reportItemsUpdated")}
            value={summary.itemsUpdated}
            tone="brand"
          />
          <ReportRow
            label={t("reportItemsSkipped")}
            value={summary.itemsSkippedDuplicate}
            tone="muted"
          />
          {summary.itemsFailed > 0 && (
            <ReportRow
              label={t("reportItemsFailed")}
              value={summary.itemsFailed}
              tone="danger"
            />
          )}
        </ul>
      </Card>

      {errors.length > 0 && (
        <Card padded="none" className="overflow-hidden text-start">
          <p className="border-b border-line bg-surface-2 px-4 py-2 text-[13px] font-medium text-fg">
            {t("saveErrorsTitle", { count: errors.length })}
          </p>
          <ul className="max-h-48 overflow-auto">
            {errors.slice(0, 20).map((err, i) => (
              <li
                key={`${err.refId ?? i}`}
                className="border-b border-line px-4 py-2 text-xs text-fg-muted last:border-b-0"
              >
                <span className="font-medium text-fg">
                  {err.nameAr || err.nameEn || err.type}
                </span>
                {" — "}
                {reasonLabel(t, err.reason)}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {ok && (
        <Card variant="ghost" className="text-start">
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-lg text-brand-soft-fg"
              aria-hidden
            >
              <IoImageOutline />
            </span>
            <div>
              <p className="text-[15px] font-semibold text-fg">
                {t("saveNextStepImagesTitle")}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
                {t("saveNextStepImagesBody")}
              </p>
              <LinkTo
                href={`/dashboard/${menuId}/items`}
                className={buttonClasses({
                  variant: "link",
                  size: "sm",
                  className: "mt-3",
                })}
              >
                {t("saveNextStepImagesCta")}
              </LinkTo>
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        {hasBulkImportLimit && (
          <LinkTo
            href={`/dashboard/${menuId}/subscription`}
            className={buttonClasses({ variant: "primary" })}
          >
            {t("freePlanLimitUpgrade")}
          </LinkTo>
        )}
        {canRetry && (
          <Button
            onClick={onRetrySave}
            loading={isRetrying}
            startIcon={<IoRefreshOutline className="text-lg" />}
          >
            {isRetrying ? t("saving") : t("retryAnalysis")}
          </Button>
        )}
        {ok && (
          <LinkTo
            href={`/dashboard/${menuId}/items`}
            className={buttonClasses({ variant: "primary" })}
          >
            {t("goToItems")}
          </LinkTo>
        )}
        {!ok && !hasBulkImportLimit && (
          <LinkTo
            href={`/dashboard/${menuId}/items`}
            className={buttonClasses({ variant: "secondary" })}
          >
            {t("goToItems")}
          </LinkTo>
        )}
        <Button variant="secondary" onClick={onNewUpload}>
          {t("newUpload")}
        </Button>
      </div>
    </div>
  );
}
