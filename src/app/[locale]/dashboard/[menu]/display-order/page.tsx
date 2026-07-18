"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { useAppSelector } from "@/store/hooks";
import { axiosPatch, axiosPost } from "@/shared/axiosCall";
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
import LinkTo from "@/components/Global/LinkTo";
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
          (categoryId != null ? categoryLabelById.get(categoryId) : undefined) ??
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
            axiosPatch<{ sortOrder: number }, unknown>(
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
    <>
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <PageTitleWithHelp>
            <h1 className="text-2xl font-bold text-slate-800 md:text-3xl dark:text-slate-100">
              {t("title")}
            </h1>
          </PageTitleWithHelp>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <LinkTo
            href={`/dashboard/${menuId}`}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:border-primary/30 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-primary/50 dark:hover:bg-slate-700"
          >
            {tStaff("backToOverview")}
          </LinkTo>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || saving || loading}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-lg transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {saving ? t("saving") : t("save")}
          </button>
        </div>
      </div>

      {isDirty ? (
        <p className="mb-4 text-sm font-medium text-amber-600 dark:text-amber-400">
          {t("unsavedChanges")}
        </p>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400">
          {t("loading")}
        </div>
      ) : categoryRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center dark:border-slate-600 dark:bg-slate-800/40">
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {t("emptyCategories")}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <DisplayOrderCategoryStrip
            rows={categoryRows}
            locale={locale}
            selectedId={selectedCategoryId}
            disabled={saving}
            onSelect={setSelectedCategoryId}
            onReorder={setCategoryRows}
          />

          {!showingAll && selectedCategoryLabel ? (
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-primary">
                  {selectedCategoryLabel}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t("productsInCategory")}
                </p>
              </div>
            </div>
          ) : showingAll ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("allGroupedHint")}
            </p>
          ) : null}

          {itemsInitialLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400">
              {t("loading")}
            </div>
          ) : itemRows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center dark:border-slate-600 dark:bg-slate-800/40">
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {t("emptyItems")}
              </p>
            </div>
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
                {itemsLoadingMore ? (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {t("loadingMore")}
                  </span>
                ) : itemsHasMore ? (
                  <span className="text-sm text-slate-400 dark:text-slate-500">
                    {t("scrollForMore")}
                  </span>
                ) : (
                  <span className="text-sm text-slate-400 dark:text-slate-500">
                    {t("endOfList")}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
