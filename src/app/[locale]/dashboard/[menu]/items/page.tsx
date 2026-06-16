"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { axiosGet } from "@/shared/axiosCall";
import { useAppSelector } from "@/store/hooks";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import AddItemModal from "@/components/Dashboard/AddItemModal";
import DeleteItemConfirm from "@/components/Dashboard/DeleteItemConfirm";
import MenuImportEntryButton from "@/components/MenuImport/MenuImportEntryButton";
import ItemsCardGrid from "@/components/Dashboard/ItemsCardGrid";
import MobileFloatingAddButton from "@/components/Dashboard/mobile/MobileFloatingAddButton";
import LinkTo from "@/components/Global/LinkTo";
import { Item, Category } from "@/types/Menu";
import {
  IoAddCircleOutline,
  IoSearchOutline,
  IoRefreshOutline,
  IoCameraOutline,
} from "react-icons/io5";

export default function ItemsPage() {
  const t = useTranslations("Items");
  const tStaff = useTranslations("Staff");
  const locale = useLocale();
  const params = useParams();
  const menuId =
    typeof params.menu === "string"
      ? params.menu
      : ((params.menu as string[])?.[0] ?? "");
  const menuCurrency =
    useAppSelector((s) => s.menuData.menu?.currency) ?? "EGP";

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [refreshing, setRefreshing] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [categoryFilterId, setCategoryFilterId] = useState<string>("");
  const [availableFilter, setAvailableFilter] = useState<string>("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedCategoryId, setAppliedCategoryId] = useState<string>("");
  const [appliedAvailableFilter, setAppliedAvailableFilter] =
    useState<string>("");

  const fetchCategories = useCallback(async () => {
    if (!menuId) return;
    try {
      const result = await axiosGet<Category[] | { categories: Category[] }>(
        `/menus/${menuId}/categories?page=1&limit=500`,
        locale,
      );
      if (result.status && result.data) {
        const raw = result.data as { categories?: Category[] };
        const list =
          raw?.categories ?? (Array.isArray(result.data) ? result.data : []);
        setCategories(list);
      }
    } catch {
      setCategories([]);
    }
  }, [menuId, locale]);

  const fetchItems = useCallback(async () => {
    if (!menuId) return;
    try {
      setLoading(true);
      const searchParam = appliedSearch.trim()
        ? `&search=${encodeURIComponent(appliedSearch.trim())}`
        : "";
      const categoryParam = appliedCategoryId
        ? `&categoryId=${encodeURIComponent(appliedCategoryId)}`
        : "";
      const availableParam = appliedAvailableFilter
        ? `&available=${appliedAvailableFilter}`
        : "";
      const result = await axiosGet<Item[] | { items: Item[] }>(
        `/menus/${menuId}/items?page=${page}&limit=12${searchParam}${categoryParam}${availableParam}`,
        locale,
      );
      if (result.status && result.data) {
        const raw = result.data as { items?: Item[] };
        const list = raw?.items ?? [];
        setItems(list);
        const pagination = (
          result.data as unknown as {
            pagination?: { totalPages?: number; totalItems?: number; total?: number };
          }
        ).pagination;
        setTotalPages(pagination?.totalPages ?? 0);
        setTotalItems(
          pagination?.totalItems ?? pagination?.total ?? list.length,
        );
      }
    } finally {
      setLoading(false);
    }
  }, [
    menuId,
    locale,
    page,
    appliedSearch,
    appliedCategoryId,
    appliedAvailableFilter,
  ]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems, refreshing, page]);

  const getName = useCallback(
    (item: Item) =>
      item.name ??
      (locale === "ar"
        ? item.nameAr || item.nameEn
        : item.nameEn || item.nameAr) ??
      "—",
    [locale],
  );

  const getImageUrl = (item: Item) => item.imageUrl ?? item.image ?? "";
  const getCategoryName = useCallback(
    (item: Item) => {
      if (item.categoryName) return item.categoryName;
      const cat = item.category;
      if (typeof cat === "string") return cat;
      if (cat && typeof cat === "object")
        return locale === "ar"
          ? cat.nameAr || cat.nameEn
          : cat.nameEn || cat.nameAr;
      return item.categoryId?.toString() ?? "—";
    },
    [locale],
  );

  const getCategoryDisplayName = useCallback(
    (cat: Category) =>
      locale === "ar" ? cat.nameAr || cat.nameEn : cat.nameEn || cat.nameAr,
    [locale],
  );

  const isFiltered =
    appliedSearch.trim().length > 0 ||
    appliedCategoryId.length > 0 ||
    appliedAvailableFilter.length > 0;

  const handleSearch = useCallback(() => {
    setAppliedSearch(searchInput);
    setAppliedCategoryId(categoryFilterId);
    setAppliedAvailableFilter(availableFilter);
    setPage(1);
  }, [searchInput, categoryFilterId, availableFilter]);

  const handleReset = useCallback(() => {
    setSearchInput("");
    setCategoryFilterId("");
    setAvailableFilter("");
    setAppliedSearch("");
    setAppliedCategoryId("");
    setAppliedAvailableFilter("");
    setPage(1);
  }, []);

  const handleEdit = useCallback(
    async (item: Item) => {
      if (!menuId) return;
      try {
        const result = await axiosGet<{ item?: Item } | Item>(
          `/menus/${menuId}/items/${item.id}?locale=${locale}`,
          locale,
        );
        if (result.status && result.data) {
          const payload = result.data as { item?: Item };
          setEditingItem(payload.item ?? (result.data as Item));
          return;
        }
      } catch {
        // fallback to list row
      }
      setEditingItem(item);
    },
    [menuId, locale],
  );
  const handleDelete = useCallback((item: Item) => {
    setDeletingItem(item);
  }, []);

  const refreshList = useCallback(() => {
    setRefreshing((r) => r + 1);
  }, []);

  const handleItemSaved = useCallback(() => {
    refreshList();
  }, [refreshList]);

  const openAddModal = useCallback(() => {
    setEditingItem(null);
    setShowAddModal(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setShowAddModal(false);
    setEditingItem(null);
  }, []);

  return (
    <>
      <div
        id="onboarding-items-header"
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <PageTitleWithHelp>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
              {t("title")}
            </h1>
          </PageTitleWithHelp>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <LinkTo
            href={`/dashboard/${menuId}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-primary/30 dark:hover:border-primary/50 text-sm font-medium transition-all"
          >
            {tStaff("backToOverview")}
          </LinkTo>
          <MenuImportEntryButton menuId={menuId} variant="secondary" />
          <button
            id="onboarding-add-item"
            onClick={openAddModal}
            className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <IoAddCircleOutline className="text-xl" />
            {t("addItem")}
          </button>
        </div>
      </div>

      <div
        id="onboarding-items-filters"
        className="mb-6 p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm"
      >
        <div className="flex flex-wrap items-end gap-4">
          <div
            className="flex-1 min-w-[200px]"
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
              {t("search")}
            </label>
            <div className="relative">
              <IoSearchOutline
                className={`absolute top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xl pointer-events-none ${locale === "ar" ? "right-3" : "left-3"}`}
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={t("searchByName")}
                className={`w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-shadow ${locale === "ar" ? "pr-10 pl-4" : "pl-10 pr-4"}`}
              />
            </div>
          </div>
          <div className="min-w-[180px]">
            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
              {t("category")}
            </label>
            <select
              value={categoryFilterId}
              onChange={(e) => setCategoryFilterId(e.target.value)}
              className={`w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-shadow appearance-none bg-size-[1.25rem] bg-no-repeat ${locale === "ar" ? "bg-position-[left_0.75rem_center] pl-10 pr-4" : "bg-position-[right_0.75rem_center] pr-10 pl-4"}`}
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
              }}
            >
              <option value="">{t("allCategories")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {getCategoryDisplayName(cat)}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-40">
            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
              {t("availability")}
            </label>
            <select
              value={availableFilter}
              onChange={(e) => setAvailableFilter(e.target.value)}
              className={`w-full h-11 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-shadow appearance-none bg-size-[1.25rem] bg-no-repeat ${locale === "ar" ? "bg-position-[left_0.75rem_center] pl-10 pr-4" : "bg-position-[right_0.75rem_center] pr-10 pl-4"}`}
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
              }}
            >
              <option value="">{t("allStatus")}</option>
              <option value="true">{t("available")}</option>
              <option value="false">{t("unavailable")}</option>
            </select>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center shrink-0">
            <button
              type="button"
              onClick={handleSearch}
              className="h-11 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 bg-primary text-white rounded-xl font-semibold shadow-md hover:opacity-90 hover:shadow-lg transition-all"
            >
              <IoSearchOutline className="text-lg" />
              {t("search")}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="h-11 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 rounded-xl border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <IoRefreshOutline className="text-lg" />
              {t("reset")}
            </button>
          </div>
        </div>
      </div>

      {!loading && totalItems > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {t("totalItemsLabel")}
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {totalItems}
            </span>
          </div>
          {items.some((item) => !getImageUrl(item)) && (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/5 border border-dashed border-primary/30">
              <IoCameraOutline className="text-primary text-lg shrink-0" />
              <span className="text-sm text-primary font-medium">
                {t("missingImagesHint")}
              </span>
            </div>
          )}
        </div>
      )}

      <div id="onboarding-items-table">
        <ItemsCardGrid
          items={items}
          loading={loading}
          locale={locale}
          currency={menuCurrency}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          isFiltered={isFiltered}
          getName={getName}
          getCategoryName={getCategoryName}
          getImageUrl={getImageUrl}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <MobileFloatingAddButton
        id="onboarding-add-item-mobile"
        label={t("mobileFabLabel")}
        onClick={openAddModal}
      />

      {!loading && items.length === 0 && !isFiltered && (
        <div className="mt-4 md:mt-6">
          <MenuImportEntryButton menuId={menuId} variant="card" />
        </div>
      )}

      {(showAddModal || editingItem) && menuId && (
        <AddItemModal
          menuId={menuId}
          item={editingItem}
          categories={categories}
          onClose={closeAddModal}
          onRefresh={handleItemSaved}
        />
      )}

      {deletingItem && menuId && (
        <DeleteItemConfirm
          menuId={menuId}
          item={deletingItem}
          localeName={getName(deletingItem)}
          onClose={() => setDeletingItem(null)}
          onDeleted={refreshList}
        />
      )}
      <div className="pb-10" />
    </>
  );
}
