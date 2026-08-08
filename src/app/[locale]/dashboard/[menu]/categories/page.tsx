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
import { Button, buttonClasses } from "@/components/ui";
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
      <PageTitleWithHelp
        id="onboarding-categories-header"
        className="mb-8"
        title={t("title")}
        description={t("subtitle")}
        actions={
          <>
            <LinkTo
              href={`/dashboard/${menuId}`}
              className={buttonClasses({ variant: "secondary" })}
            >
              {tStaff("backToOverview")}
            </LinkTo>
            <Button
              id="onboarding-categories-actions"
              onClick={openAddModal}
              className="hidden md:inline-flex"
              startIcon={<IoAddCircleOutline className="size-4.5" />}
            >
              {t("addCategory")}
            </Button>
          </>
        }
      />

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
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Button
              type="button"
              onClick={handleSearch}
              fullWidth
              className="sm:w-auto"
              startIcon={<IoSearchOutline className="size-4" />}
            >
              {t("search")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleReset}
              fullWidth
              className="sm:w-auto"
              startIcon={<IoRefreshOutline className="size-4" />}
            >
              {t("reset")}
            </Button>
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
