"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { axiosGet } from "@/shared/axiosCall";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import AddCategoryModal from "@/components/Dashboard/AddCategoryModal";
import DeleteCategoryConfirm from "@/components/Dashboard/DeleteCategoryConfirm";
import CategoriesCardGrid from "@/components/Dashboard/CategoriesCardGrid";
import MobileFloatingAddButton from "@/components/Dashboard/mobile/MobileFloatingAddButton";
import LinkTo from "@/components/Global/LinkTo";
import { Category } from "@/types/Menu";
import { IoAddCircleOutline, IoSearchOutline, IoRefreshOutline } from "react-icons/io5";

export default function CategoriesPage() {
  const t = useTranslations("Categories");
  const tStaff = useTranslations("Staff");
  const locale = useLocale();
  const params = useParams();
  const menuId =
    typeof params.menu === "string"
      ? params.menu
      : ((params.menu as string[])?.[0] ?? "");

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );
  const [refreshing, setRefreshing] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  const fetchCategories = useCallback(async () => {
    if (!menuId) return;
    try {
      setLoading(true);
      const searchParam = appliedSearch.trim()
        ? `&search=${encodeURIComponent(appliedSearch.trim())}`
        : "";
      const result = await axiosGet<Category[] | { categories: Category[] }>(
        `/menus/${menuId}/categories?page=${page}&limit=12${searchParam}`,
        locale,
      );
      if (result.status && result.data) {
        const list = Array.isArray(result.data)
          ? result.data
          : ((result.data as { categories: Category[] }).categories ?? []);
        setCategories(list);

        setTotalPages(
          (result.data as unknown as { pagination: { totalPages: number } })
            .pagination?.totalPages ?? 0,
        );
      }
    } finally {
      setLoading(false);
    }
  }, [menuId, locale, page, appliedSearch]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories, refreshing, page]);

  const getName = useCallback(
    (cat: Category) =>
      locale === "ar" ? cat.nameAr || cat.nameEn : cat.nameEn || cat.nameAr,
    [locale],
  );
  const getImageUrl = (cat: Category) => cat.imageUrl ?? cat.image ?? "";

  const handleSearch = useCallback(() => {
    setAppliedSearch(searchInput);
    setPage(1);
  }, [searchInput]);

  const handleReset = useCallback(() => {
    setSearchInput("");
    setAppliedSearch("");
    setPage(1);
  }, []);

  const handleEdit = useCallback((cat: Category) => {
    setEditingCategory(cat);
  }, []);
  const handleDelete = useCallback((cat: Category) => {
    setDeletingCategory(cat);
  }, []);

  const refreshList = useCallback(() => {
    setRefreshing((r) => r + 1);
  }, []);

  const openAddModal = useCallback(() => {
    setEditingCategory(null);
    setShowAddModal(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setShowAddModal(false);
    setEditingCategory(null);
  }, []);

  return (
    <>
      <div
        id="onboarding-categories-header"
        className="flex flex-col  sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <PageTitleWithHelp>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
              {t("title")}
            </h1>
          </PageTitleWithHelp>
          <p className="text-slate-500 mt-1 dark:text-slate-400">
            {t("subtitle")}
          </p>
        </div>
        <div id="onboarding-categories-actions" className="flex flex-wrap items-center gap-3">
          <LinkTo
            href={`/dashboard/${menuId}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-primary/30 dark:hover:border-primary/50 text-sm font-medium transition-all"
          >
            {tStaff("backToOverview")}
          </LinkTo>
          <button
            onClick={openAddModal}
            className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <IoAddCircleOutline className="text-xl" />
            {t("addCategory")}
          </button>
        </div>
      </div>

      <div
        id="onboarding-categories-filters"
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

      <div id="onboarding-categories-table">
        <CategoriesCardGrid
          categories={categories}
          loading={loading}
          locale={locale}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          isSearching={appliedSearch.trim().length > 0}
          getName={getName}
          getImageUrl={getImageUrl}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <MobileFloatingAddButton
        label={t("mobileFabLabel")}
        onClick={openAddModal}
      />

      {(showAddModal || editingCategory) && menuId && (
        <AddCategoryModal
          menuId={menuId}
          category={editingCategory}
          onClose={closeAddModal}
          onRefresh={refreshList}
        />
      )}

      {deletingCategory && menuId && (
        <DeleteCategoryConfirm
          menuId={menuId}
          category={deletingCategory}
          localeName={getName(deletingCategory)}
          onClose={() => setDeletingCategory(null)}
          onDeleted={refreshList}
        />
      )}
      <div className="pb-10"></div>
    </>
  );
}
