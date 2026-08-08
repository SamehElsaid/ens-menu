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
import { Button, Card, SearchInput, Toolbar } from "@/components/ui";
import { Category } from "@/types/Menu";
import { IoAddCircleOutline, IoRefreshOutline } from "react-icons/io5";

export default function CategoriesPage() {
  const t = useTranslations("Categories");
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
  // Search applies on its own debounce; no separate submit step.
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

  const handleReset = useCallback(() => {
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
        className="mb-3"
        title={t("title")}
        description={t("subtitle")}
        actions={
          <Button
            id="onboarding-categories-actions"
            onClick={openAddModal}
            className="hidden md:inline-flex"
            startIcon={<IoAddCircleOutline className="size-4" />}
          >
            {t("addCategory")}
          </Button>
        }
      />

      <Card id="onboarding-categories-filters" padded="sm" className="mb-3">
        <Toolbar
          search={
            <SearchInput
              value={appliedSearch}
              onChange={(value) => {
                setAppliedSearch(value);
                setPage(1);
              }}
              placeholder={t("searchByName")}
              label={t("search")}
            />
          }
          filters={
            appliedSearch.trim() ? (
              <Button
                type="button"
                variant="ghost"
                onClick={handleReset}
                startIcon={<IoRefreshOutline className="size-3.5" />}
              >
                {t("reset")}
              </Button>
            ) : null
          }
        />
      </Card>

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
