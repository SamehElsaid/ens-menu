"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { ImportDraft, ImportError } from "@/types/menuImport";
import type { SaveBlockingError } from "@/types/menuImport";
import ReviewCategoryBlock from "../review/ReviewCategoryBlock";
import ConfirmSavePanel from "../review/ConfirmSavePanel";
import SaveResultPanel from "../review/SaveResultPanel";
import SaveProgressOverlay from "../shared/SaveProgressOverlay";
import {
  collectExactDuplicateRefIds,
  collectPriceConflictRefIds,
  countDuplicateStats,
} from "@/lib/menuImport/duplicateMatch";
import { expandItemForSave } from "@/lib/menuImport/draftSaveUtils";
import { scrollToImportRef } from "@/lib/menuImport/importRefDomId";
import { IoAddCircleOutline, IoWarningOutline } from "react-icons/io5";
import { cn } from "@/lib/cn";
import {
  Alert,
  Badge,
  Button,
  SectionHeader,
  Spinner,
  focusRing,
  type StatusTone,
} from "@/components/ui";

/** Clickable summary pill that jumps to the next entry in a problem group. */
function StatPill({
  tone = "neutral",
  title,
  onClick,
  children,
}: {
  tone?: StatusTone;
  title: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "rounded-full transition-opacity hover:opacity-80",
        focusRing,
      )}
    >
      <Badge
        tone={tone}
        size="md"
        icon={
          tone === "warning" ? <IoWarningOutline aria-hidden /> : undefined
        }
      >
        {children}
      </Badge>
    </button>
  );
}

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
  onRetrySave: () => void;
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
  onRetrySave,
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
  const [scrollTargetRefId, setScrollTargetRefId] = useState<string | null>(
    null,
  );
  const scrollIndexRef = useRef<Record<string, number>>({});

  const categoryRefIds = useMemo(
    () => draft.categories.map((category) => category.id),
    [draft.categories],
  );
  const itemRefIds = useMemo(
    () =>
      draft.categories.flatMap((category) =>
        category.items.map((item) => item.id),
      ),
    [draft.categories],
  );
  const expandedItemRefIds = useMemo(
    () =>
      draft.categories.flatMap((category) =>
        category.items.flatMap((item) =>
          expandItemForSave(item).map((saveItem) => saveItem.refId),
        ),
      ),
    [draft.categories],
  );
  const priceConflictRefIds = useMemo(
    () => collectPriceConflictRefIds(draft),
    [draft],
  );
  const exactDuplicateRefIds = useMemo(
    () => collectExactDuplicateRefIds(draft),
    [draft],
  );
  const missingPriceRefIds = useMemo(
    () => blockingPriceErrors.map((error) => error.refId),
    [blockingPriceErrors],
  );
  const missingNameRefIds = useMemo(
    () => blockingNameErrors.map((error) => error.refId),
    [blockingNameErrors],
  );
  const unresolvedConflictRefIds = useMemo(
    () => unresolvedPriceConflicts.map((conflict) => conflict.refId),
    [unresolvedPriceConflicts],
  );

  const scrollToRefGroup = (
    refIds: string[],
    groupKey: string,
    options?: { focusMissing?: boolean },
  ) => {
    if (refIds.length === 0) return;

    const idx = scrollIndexRef.current[groupKey] ?? 0;
    scrollIndexRef.current[groupKey] = idx + 1;

    const refId = refIds[idx % refIds.length];
    if (!refId) return;

    setScrollTargetRefId(refId);
    scrollToImportRef(refId, { focusMissing: options?.focusMissing });
  };

  if (saveResult) {
    return (
      <>
        <SaveResultPanel
          result={saveResult}
          menuId={menuId}
          onNewUpload={onNewUpload}
          onRetrySave={onRetrySave}
          isRetrying={isSaving}
        />
        <SaveProgressOverlay visible={isSaving} />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title={t("reviewTitle")}
        description={t("reviewDescription")}
        actions={
          <div className="flex flex-wrap gap-2">
            <StatPill
              title={t("statClickHint")}
              onClick={() => scrollToRefGroup(categoryRefIds, "categories")}
            >
              {t("statCategories", { count: draft.stats.categoryCount })}
            </StatPill>
            <StatPill
              title={t("statClickHint")}
              onClick={() => scrollToRefGroup(itemRefIds, "items")}
            >
              {t("statItems", { count: draft.stats.itemCount })}
            </StatPill>
            <StatPill
              title={t("statClickHint")}
              onClick={() =>
                scrollToRefGroup(expandedItemRefIds, "expandedItems")
              }
            >
              {t("statExpandedItems", {
                count: draft.stats.expandedItemCount,
              })}
            </StatPill>
            {dupStats.exactDuplicates > 0 && (
              <StatPill
                title={t("statClickHint")}
                onClick={() =>
                  scrollToRefGroup(exactDuplicateRefIds, "exactDuplicates")
                }
              >
                {t("statDuplicates", { count: dupStats.exactDuplicates })}
              </StatPill>
            )}
            {dupStats.priceConflicts > 0 && (
              <StatPill
                tone="warning"
                title={t("statClickHint")}
                onClick={() =>
                  scrollToRefGroup(priceConflictRefIds, "priceConflicts")
                }
              >
                {t("statPriceConflicts", { count: dupStats.priceConflicts })}
              </StatPill>
            )}
            {blockingPriceErrors.length > 0 && (
              <StatPill
                tone="warning"
                title={t("missingPriceBlockHint")}
                onClick={() =>
                  scrollToRefGroup(missingPriceRefIds, "missingPrices", {
                    focusMissing: true,
                  })
                }
              >
                {t("statMissingPrices", { count: blockingPriceErrors.length })}
              </StatPill>
            )}
            {blockingNameErrors.length > 0 && (
              <StatPill
                tone="warning"
                title={t("missingNameBlockHint")}
                onClick={() =>
                  scrollToRefGroup(missingNameRefIds, "missingNames", {
                    focusMissing: true,
                  })
                }
              >
                {t("statMissingNames", { count: blockingNameErrors.length })}
              </StatPill>
            )}
          </div>
        }
      />

      {duplicatesLoading && (
        <Alert tone="neutral" icon={<Spinner size="sm" />}>
          {t("checkingDuplicates")}
        </Alert>
      )}

      {saveError?.message === "save_timeout_long" && (
        <Alert tone="warning">{t("saveTimeoutLong")}</Alert>
      )}

      {!canProceedToConfirm && !duplicatesLoading && (
        <div className="flex flex-col gap-2">
          {blockingPriceErrors.length > 0 && (
            <Alert
              tone="warning"
              title={t("missingPriceBlock", {
                count: blockingPriceErrors.length,
              })}
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    scrollToRefGroup(missingPriceRefIds, "missingPricesBlock", {
                      focusMissing: true,
                    })
                  }
                >
                  {t("missingPriceBlockHint")}
                </Button>
              }
            />
          )}
          {blockingNameErrors.length > 0 && (
            <Alert
              tone="warning"
              title={t("missingNameBlock", {
                count: blockingNameErrors.length,
              })}
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    scrollToRefGroup(missingNameRefIds, "missingNamesBlock", {
                      focusMissing: true,
                    })
                  }
                >
                  {t("missingNameBlockHint")}
                </Button>
              }
            />
          )}
          {unresolvedPriceConflicts.length > 0 && (
            <Alert
              tone="warning"
              title={t("unresolvedPriceConflicts", {
                count: unresolvedPriceConflicts.length,
              })}
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    scrollToRefGroup(
                      unresolvedConflictRefIds,
                      "unresolvedConflictsBlock",
                    )
                  }
                >
                  {t("statClickHint")}
                </Button>
              }
            />
          )}
        </div>
      )}

      {parseErrors.length > 0 && (
        <Alert tone="neutral">
          {t("parseErrorsNotice", { count: parseErrors.length })}
        </Alert>
      )}

      <div className="flex flex-col gap-3">
        {draft.categories.map((category) => (
          <ReviewCategoryBlock
            key={category.id}
            category={category}
            currency={draft.currency}
            locale={locale}
            scrollTargetRefId={scrollTargetRefId}
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

      <div>
        <Button
          variant="secondary"
          onClick={onAddCategory}
          disabled={isSaving}
          startIcon={<IoAddCircleOutline className="text-lg" />}
          className="border-dashed"
        >
          {t("addCategory")}
        </Button>
      </div>

      <div className="flex flex-col items-stretch justify-between gap-4 border-t border-line pt-4 sm:flex-row sm:items-end">
        <div className="flex max-w-md flex-col items-stretch gap-2">
          <Button
            variant="secondary"
            onClick={onNewUpload}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {t("newUpload")}
          </Button>
          <p className="px-0.5 text-xs leading-relaxed text-fg-muted sm:text-[13px]">
            {t("reuploadHint")}
          </p>
        </div>
        <Button
          size="lg"
          disabled={!canProceedToConfirm || isSaving}
          onClick={onOpenConfirm}
          title={!canProceedToConfirm ? t("blockingHint") : undefined}
        >
          {t("proceedToConfirm")}
        </Button>
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
