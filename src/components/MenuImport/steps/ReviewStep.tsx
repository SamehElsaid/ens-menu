"use client";

import { useMemo, useRef, useState } from "react";
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
import {
  IoAddCircleOutline,
  IoCopyOutline,
  IoWarningOutline,
} from "react-icons/io5";
import {
  Alert,
  Button,
  EmptyState,
  SectionHeader,
  Spinner,
  StatCard,
  StatGrid,
} from "@/components/ui";

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

/**
 * The parse, as a ledger.
 *
 * This is the screen the whole feature is for, and it used to be a run of
 * floating cards separated by ground, with the counts set as small pills in the
 * header. Two changes carry the rethink. The counts are figures in an
 * instrument rail, because "how many items did it find" is the first question
 * anyone asks. And every category is now a section of one bordered panel
 * divided by hairlines, so forty parsed dishes read as a single list with one
 * margin to scan down instead of a stack of separate objects.
 */
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
    <div className="flex flex-col gap-4">
      <SectionHeader
        eyebrow={t("stepReview")}
        title={t("reviewTitle")}
        description={t("reviewDescription")}
        ruled
      />

      {/* The counts are the first thing read on this screen, so they are
          figures in an instrument rail rather than pills in the header. Each
          one still jumps to the next entry in its group. */}
      <div>
        <StatGrid columns={4}>
          <StatCard
            label={t("statLabelCategories")}
            value={draft.stats.categoryCount}
            onClick={() => scrollToRefGroup(categoryRefIds, "categories")}
          />
          <StatCard
            label={t("statLabelItems")}
            value={draft.stats.itemCount}
            onClick={() => scrollToRefGroup(itemRefIds, "items")}
          />
          <StatCard
            label={t("statLabelToSave")}
            value={draft.stats.expandedItemCount}
            onClick={() =>
              scrollToRefGroup(expandedItemRefIds, "expandedItems")
            }
          />
          {dupStats.exactDuplicates > 0 ? (
            <StatCard
              label={t("statLabelDuplicates")}
              value={dupStats.exactDuplicates}
              icon={<IoCopyOutline />}
              hint={t("duplicateExactSkip")}
              onClick={() =>
                scrollToRefGroup(exactDuplicateRefIds, "exactDuplicates")
              }
            />
          ) : null}
          {dupStats.priceConflicts > 0 ? (
            <StatCard
              label={t("statLabelPriceConflicts")}
              value={dupStats.priceConflicts}
              icon={<IoWarningOutline />}
              onClick={() =>
                scrollToRefGroup(priceConflictRefIds, "priceConflicts")
              }
            />
          ) : null}
        </StatGrid>
        <p className="ui-label mt-1.5">{t("statClickHint")}</p>
      </div>

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
                  title={t("missingPriceBlockHint")}
                >
                  {t("goToIssue")}
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
                  title={t("missingNameBlockHint")}
                >
                  {t("goToIssue")}
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
                  title={t("statClickHint")}
                >
                  {t("goToIssue")}
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

      {/* One panel, hairline-divided. Categories share edges with each other
          instead of floating on ground, which is what turns a long parse into
          something that can be read down a single margin. */}
      {/* Not `overflow-hidden`: the row overflow menus open inside this panel
          and would be clipped by it. */}
      <div className="rounded-xl border border-line bg-surface">
        {draft.categories.length === 0 ? (
          <div className="p-3 sm:p-4">
            <EmptyState size="sm" title={t("emptyCategory")} />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {draft.categories.map((category, index) => (
              <ReviewCategoryBlock
                key={category.id}
                index={index}
                category={category}
                currency={draft.currency}
                locale={locale}
                scrollTargetRefId={scrollTargetRefId}
                onUpdateCategory={(patch) =>
                  onUpdateCategory(category.id, patch)
                }
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
        )}

        <div className="rounded-b-xl border-t border-line bg-surface-2/40 px-3 py-2 sm:px-4">
          <Button
            variant="link"
            size="sm"
            onClick={onAddCategory}
            disabled={isSaving}
            startIcon={<IoAddCircleOutline className="text-base" />}
          >
            {t("addCategory")}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <p className="max-w-md text-xs leading-relaxed text-fg-muted">
          {t("reuploadHint")}
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          <Button
            variant="secondary"
            onClick={onNewUpload}
            disabled={isSaving}
            fullWidth
            className="sm:w-auto"
          >
            {t("newUpload")}
          </Button>
          <Button
            size="lg"
            disabled={!canProceedToConfirm || isSaving}
            onClick={onOpenConfirm}
            title={!canProceedToConfirm ? t("blockingHint") : undefined}
            fullWidth
            className="sm:w-auto"
          >
            {t("proceedToConfirm")}
          </Button>
        </div>
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
