"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { useAppSelector } from "@/store/hooks";
import { axiosPut, axiosPost } from "@/shared/axiosCall";
import { fetchAllMenuPages } from "@/lib/fetchAllMenuPages";
import { useDisplayOrderItemsPagination } from "@/hooks/useDisplayOrderItemsPagination";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import {
  DISPLAY_ORDER_ALL_CATEGORY_ID,
  DisplayOrderCategoryStrip,
  DisplayOrderProductGrid,
  toCategoryScopedPayload,
  type DisplayOrderRow,
} from "@/components/Dashboard/DisplayOrderList";
import { IoGridOutline, IoImageOutline } from "react-icons/io5";
import {
  Badge,
  Button,
  EmptyState,
  LoadingBlock,
  PageShell,
  SectionHeader,
} from "@/components/ui";
import type { Category, Item } from "@/types/Menu";

function bySortOrderThenId<T extends { id: number; sortOrder?: number }>(
  a: T,
  b: T,
) {
  const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  return orderDiff !== 0 ? orderDiff : a.id - b.id;
}

function idsMatch(a: DisplayOrderRow[], b: DisplayOrderRow[]) {
  if (a.length !== b.length) return false;
  return a.every((row, index) => row.id === b[index]?.id);
}

function toPayload(rows: DisplayOrderRow[]) {
  return rows.map((row, index) => ({ id: row.id, sortOrder: index }));
}

function isAllCategory(categoryId: number | null) {
  return categoryId === DISPLAY_ORDER_ALL_CATEGORY_ID;
}

export default function DisplayOrderPage() {
  const t = useTranslations("DisplayOrder");
  const tStaff = useTranslations("Staff");
  const locale = useLocale();
  const params = useParams();
  const menuId =
    typeof params.menu === "string"
      ? params.menu
      : ((params.menu as string[])?.[0] ?? "");
  const menuCurrency =
    useAppSelector((s) => s.menuData.menu?.currency) ?? "EGP";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [categoryRows, setCategoryRows] = useState<DisplayOrderRow[]>([]);
  const [savedCategoryRows, setSavedCategoryRows] = useState<DisplayOrderRow[]>(
    [],
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    DISPLAY_ORDER_ALL_CATEGORY_ID,
  );

  const getCategoryLabel = useCallback(
    (cat: Category) =>
      locale === "ar"
        ? cat.nameAr || cat.nameEn || "—"
        : cat.nameEn || cat.nameAr || "—",
    [locale],
  );

  const getItemLabel = useCallback(
    (item: Item) =>
      item.name ??
      (locale === "ar"
        ? item.nameAr || item.nameEn
        : item.nameEn || item.nameAr) ??
      "—",
    [locale],
  );

  const getItemDescription = useCallback(
    (item: Item) =>
      (locale === "ar"
        ? item.descriptionAr || item.descriptionEn || item.description
        : item.descriptionEn || item.descriptionAr || item.description) ?? "",
    [locale],
  );

  const categoryLabelById = useMemo(() => {
    const map = new Map<number, string>();
    for (const row of categoryRows) {
      map.set(row.id, row.label);
    }
    return map;
  }, [categoryRows]);

  const mapItem = useCallback(
    (item: Item): DisplayOrderRow => {
      const categoryId =
        typeof item.categoryId === "number" ? item.categoryId : undefined;
      return {
        id: item.id,
        label: getItemLabel(item),
        imageUrl: item.imageUrl ?? item.image ?? "",
        description: getItemDescription(item),
        price: item.price,
        available: item.isAvailable ?? item.available,
        categoryId,
        categoryLabel:
          (categoryId != null
            ? categoryLabelById.get(categoryId)
            : undefined) ??
          item.categoryName ??
          "",
      };
    },
    [getItemLabel, getItemDescription, categoryLabelById],
  );

  const categoryOrder = useMemo(
    () => categoryRows.map((row) => row.id),
    [categoryRows],
  );

  const showingAll = isAllCategory(selectedCategoryId);

  const {
    rows: itemRows,
    setRows: setItemRows,
    savedRows: savedItemRows,
    markSaved: markItemsSaved,
    initialLoading: itemsInitialLoading,
    loadingMore: itemsLoadingMore,
    hasMore: itemsHasMore,
    sentinelRef,
  } = useDisplayOrderItemsPagination({
    menuId,
    locale,
    categoryId: selectedCategoryId,
    mapItem,
    enabled: !loading && selectedCategoryId != null,
  });

  const selectedCategoryLabel = useMemo(() => {
    if (selectedCategoryId == null) return "";
    if (selectedCategoryId === DISPLAY_ORDER_ALL_CATEGORY_ID) {
      return t("allCategories");
    }
    return categoryLabelById.get(selectedCategoryId) ?? "";
  }, [selectedCategoryId, categoryLabelById, t]);

  const loadCategories = useCallback(async () => {
    if (!menuId) return;
    setLoading(true);
    try {
      const list = await fetchAllMenuPages<Category>(
        `/menus/${menuId}/categories`,
        "categories",
        locale,
      );
      const rows = [...list].sort(bySortOrderThenId).map((cat) => ({
        id: cat.id,
        label: getCategoryLabel(cat),
        imageUrl: cat.imageUrl ?? cat.image ?? "",
      }));
      setCategoryRows(rows);
      setSavedCategoryRows(rows);
    } finally {
      setLoading(false);
    }
  }, [menuId, locale, getCategoryLabel]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const categoriesDirty = useMemo(
    () => !idsMatch(categoryRows, savedCategoryRows),
    [categoryRows, savedCategoryRows],
  );
  const itemsDirty = useMemo(
    () => !idsMatch(itemRows, savedItemRows),
    [itemRows, savedItemRows],
  );
  const isDirty = categoriesDirty || itemsDirty;

  const handleSave = useCallback(async () => {
    if (!menuId || !isDirty || saving) return;
    setSaving(true);
    try {
      if (categoriesDirty) {
        const results = await Promise.all(
          toPayload(categoryRows).map((entry) =>
            axiosPut<{ sortOrder: number }, unknown>(
              `/menus/${menuId}/categories/${entry.id}`,
              locale,
              { sortOrder: entry.sortOrder },
            ),
          ),
        );
        if (results.some((result) => !result.status)) {
          toast.error(t("saveError"));
          return;
        }
        setSavedCategoryRows(categoryRows);
      }

      if (itemsDirty) {
        const items = showingAll
          ? toCategoryScopedPayload(itemRows, categoryOrder)
          : toPayload(itemRows);
        const result = await axiosPost<
          { items: { id: number; sortOrder: number }[] },
          { message?: string }
        >(`/menus/${menuId}/items/reorder`, locale, {
          items,
        });
        if (!result.status) {
          toast.error(t("saveError"));
          return;
        }
        markItemsSaved(itemRows);
      }

      toast.success(t("saved"));
    } catch {
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  }, [
    menuId,
    isDirty,
    saving,
    categoriesDirty,
    itemsDirty,
    categoryRows,
    itemRows,
    locale,
    t,
    markItemsSaved,
    showingAll,
    categoryOrder,
  ]);

  return (
    <PageShell
      kind="wide"
      header={
        <PageTitleWithHelp
          title={t("title")}
          description={t("subtitle")}
          breadcrumbs={[
            { label: tStaff("backToOverview"), href: `/dashboard/${menuId}` },
            { label: t("title") },
          ]}
          breadcrumbsLabel={t("title")}
        />
      }
      /* Save is pinned to the floor rather than sitting in the header: the item
         grid pages in as you scroll, so dragging a product into place used to
         leave the only Save button several screens above the change. */
      footerSticky
      footer={
        <div className="flex flex-wrap items-center justify-end gap-3">
          {isDirty ? (
            <Badge tone="warning" dot size="md">
              {t("unsavedChanges")}
            </Badge>
          ) : null}
          <Button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || saving || loading}
            loading={saving}
          >
            {saving ? t("saving") : t("save")}
          </Button>
        </div>
      }
    >
      {loading ? (
        <LoadingBlock label={t("loading")} />
      ) : categoryRows.length === 0 ? (
        <EmptyState
          icon={<IoGridOutline aria-hidden />}
          title={t("emptyCategories")}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <DisplayOrderCategoryStrip
            rows={categoryRows}
            locale={locale}
            selectedId={selectedCategoryId}
            disabled={saving}
            onSelect={setSelectedCategoryId}
            onReorder={setCategoryRows}
          />

          <SectionHeader
            ruled
            eyebrow={showingAll ? t("allCategories") : selectedCategoryLabel}
            title={showingAll ? t("allGroupedHint") : t("productsInCategory")}
          />

          {itemsInitialLoading ? (
            <LoadingBlock label={t("loading")} />
          ) : itemRows.length === 0 ? (
            <EmptyState
              icon={<IoImageOutline aria-hidden />}
              title={t("emptyItems")}
            />
          ) : (
            <>
              <DisplayOrderProductGrid
                rows={itemRows}
                locale={locale}
                currency={menuCurrency}
                disabled={saving}
                onReorder={setItemRows}
                groupByCategory={showingAll}
                categoryOrder={categoryOrder}
              />

              <div
                ref={sentinelRef}
                className="flex h-12 items-center justify-center"
                aria-hidden={!itemsHasMore && !itemsLoadingMore}
              >
                <span className="ui-label text-fg-subtle">
                  {itemsLoadingMore
                    ? t("loadingMore")
                    : itemsHasMore
                      ? t("scrollForMore")
                      : t("endOfList")}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </PageShell>
  );
}
