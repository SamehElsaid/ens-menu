"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { ImportDraft } from "@/types/menuImport";
import { computeConfirmSavePreview } from "@/lib/menuImport/buildBulkCategoriesPayload";
import {
  formatMenuPrice,
  formatMenuPriceRange,
} from "@/lib/formatMenuPrice";
import { cn } from "@/lib/cn";
import { Alert, Button, Card, Checkbox, Modal } from "@/components/ui";

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
  return (
    <li className="flex items-start justify-between gap-3 border-b border-line py-2 last:border-0">
      <span className="min-w-0 flex-1 text-[13px] leading-snug text-fg-muted">
        {label}
      </span>
      <span
        dir="ltr"
        className={cn(
          "shrink-0 text-end text-[13px] font-semibold tabular-nums",
          tone === "warning" && "text-warning",
          tone === "success" && "text-success",
          tone === "muted" && "text-fg-muted",
          tone === "default" && "text-fg",
        )}
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
  const tCommon = useTranslations("common");
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

  const handleClose = () => {
    if (!isSaving) onClose();
  };

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
          <Button
            onClick={onConfirm}
            disabled={!agreed}
            loading={isSaving}
          >
            {isSaving ? t("saving") : t("confirmSave")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Card variant="ghost" padded="sm">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-fg-subtle">
            {t("confirmAnalyticsTitle")}
          </p>

          <ul>
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
            <div className="mt-3 border-t border-line pt-3">
              <p className="mb-2 text-xs text-fg-muted">
                {t("confirmCategoryBreakdown")}
              </p>
              <ul className="flex flex-col gap-1.5">
                {preview.categoryBreakdown.slice(0, 8).map((category) => (
                  <li
                    key={category.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs"
                  >
                    <span className="min-w-0 truncate text-fg">
                      {category.name}
                    </span>
                    <span
                      dir="ltr"
                      className="shrink-0 font-semibold tabular-nums text-fg-muted"
                    >
                      {category.count}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

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
