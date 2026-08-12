"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { ImportDraft } from "@/types/menuImport";
import { computeConfirmSavePreview } from "@/lib/menuImport/buildBulkCategoriesPayload";
import { formatMenuPrice, formatMenuPriceRange } from "@/lib/formatMenuPrice";
import { cn } from "@/lib/cn";
import { Alert, Button, Checkbox, Modal } from "@/components/ui";

interface ConfirmSavePanelProps {
  draft: ImportDraft;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

type LedgerTone = "default" | "muted" | "warning" | "success";

type LedgerLine = {
  key: string;
  label: string;
  value: ReactNode;
  tone?: LedgerTone;
};

/**
 * The bill before it is paid.
 *
 * Everything the save will do is a ledger line: a label in prose on the inline
 * start, the figure in the ticket face on the end, hairlines between. The
 * summary used to be a nested card of bold sans numbers with the category
 * breakdown drawn as a stack of small bordered pills — two panel styles for one
 * list. Now it is one measure of ruled lines, which is what a receipt is.
 */
export default function ConfirmSavePanel({
  draft,
  isSaving,
  onClose,
  onConfirm,
}: ConfirmSavePanelProps) {
  const t = useTranslations("MenuImport");
  const tCommon = useTranslations("common");
  const [agreed, setAgreed] = useState(false);
  const preview = useMemo(() => computeConfirmSavePreview(draft), [draft]);
  const locale = draft.locale;
  const currency = draft.currency;

  const showVariants =
    preview.variantCount > 0 && preview.variantCount !== preview.itemsInPayload;

  const handleClose = () => {
    if (!isSaving) onClose();
  };

  const lines: LedgerLine[] = [
    {
      key: "categories",
      label: t("confirmCategories"),
      value: preview.categoriesInPayload,
    },
    {
      key: "items",
      label: t("confirmItemsReady"),
      value: preview.itemsInPayload,
    },
  ];

  if (showVariants) {
    lines.push({
      key: "variants",
      label: t("confirmVariants"),
      value: preview.variantCount,
      tone: "muted",
    });
  }
  if (preview.itemsAdded > 0 && preview.itemsUpdated > 0) {
    lines.push({
      key: "added",
      label: t("confirmNewItems"),
      value: preview.itemsAdded,
      tone: "success",
    });
  }
  if (preview.itemsUpdated > 0) {
    lines.push({
      key: "updated",
      label: t("confirmPriceUpdates"),
      value: preview.itemsUpdated,
      tone: "success",
    });
  }
  if (preview.missingPriceCount > 0) {
    lines.push({
      key: "missing-price",
      label: t("confirmMissingPriceExcluded"),
      value: preview.missingPriceCount,
      tone: "warning",
    });
  }
  if (preview.itemsSkippedDuplicate > 0) {
    lines.push({
      key: "skipped",
      label: t("confirmSkippedDuplicates"),
      value: preview.itemsSkippedDuplicate,
      tone: "muted",
    });
  }
  if (preview.avgPrice != null) {
    lines.push({
      key: "avg-price",
      label: t("confirmAvgPrice"),
      value: formatMenuPrice(preview.avgPrice, currency, locale),
    });
  }
  if (
    preview.minPrice != null &&
    preview.maxPrice != null &&
    preview.minPrice !== preview.maxPrice
  ) {
    lines.push({
      key: "price-range",
      label: t("confirmPriceRange"),
      value: formatMenuPriceRange(
        preview.minPrice,
        preview.maxPrice,
        currency,
        locale,
      ),
      tone: "muted",
    });
  }

  return (
    <Modal
      open
      onClose={handleClose}
      dismissible={!isSaving}
      title={t("confirmTitle")}
      description={t("confirmDescription")}
      closeLabel={tCommon("close")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            {t("backToEdit")}
          </Button>
          <Button onClick={onConfirm} disabled={!agreed} loading={isSaving}>
            {isSaving ? t("saving") : t("confirmSave")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <p className="ui-label">{t("confirmAnalyticsTitle")}</p>
          <ul className="mt-1.5 divide-y divide-line border-y border-line">
            {lines.map((line) => (
              <li
                key={line.key}
                className="flex items-baseline justify-between gap-3 py-2"
              >
                <span className="min-w-0 text-[13px] leading-snug text-fg-muted">
                  {line.label}
                </span>
                <span
                  dir="ltr"
                  className={cn(
                    "ui-figure shrink-0 text-end text-[13px]",
                    line.tone === "warning" && "text-warning",
                    line.tone === "success" && "text-success",
                    line.tone === "muted" && "text-fg-muted",
                    (line.tone ?? "default") === "default" && "text-fg",
                  )}
                >
                  {line.value}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {preview.categoryBreakdown.length > 0 && (
          <div>
            <p className="ui-label">{t("confirmCategoryBreakdown")}</p>
            <ul className="mt-1.5 divide-y divide-line border-y border-line">
              {preview.categoryBreakdown.slice(0, 8).map((category) => (
                <li
                  key={category.id}
                  className="flex items-baseline justify-between gap-3 py-1.5"
                >
                  <span className="min-w-0 truncate text-[13px] text-fg">
                    {category.name}
                  </span>
                  <span
                    dir="ltr"
                    className="ui-figure shrink-0 text-[13px] text-fg-muted"
                  >
                    {category.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Alert tone="warning">{t("confirmWarning")}</Alert>

        <Checkbox
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          disabled={isSaving}
          label={t("confirmCheckbox")}
        />
      </div>
    </Modal>
  );
}
