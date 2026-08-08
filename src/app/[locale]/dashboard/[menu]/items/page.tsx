"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { axiosGet } from "@/shared/axiosCall";
import { useAppSelector } from "@/store/hooks";
import { useSameRouteRefresh } from "@/hooks/useSameRouteRefresh";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import AddItemModal from "@/components/Dashboard/AddItemModal";
import DeleteItemConfirm from "@/components/Dashboard/DeleteItemConfirm";
import MenuImportEntryButton from "@/components/MenuImport/MenuImportEntryButton";
import ItemsCardGrid from "@/components/Dashboard/ItemsCardGrid";
import CategorySearchSelect, {
  type CategoryOption,
} from "@/components/Dashboard/CategorySearchSelect";
import MobileFloatingAddButton from "@/components/Dashboard/mobile/MobileFloatingAddButton";
import {
  Alert,
  Badge,
  Button,
  Card,
  SearchInput,
  Select,
  Toolbar,
} from "@/components/ui";
import { Item } from "@/types/Menu";
import {
  IoAddCircleOutline,
  IoRefreshOutline,
  IoCameraOutline,
} from "react-icons/io5";

export default function ItemsPage() {
  const t = useTranslations("Items");
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
  const [isEditItemLoading, setIsEditItemLoading] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [refreshing, setRefreshing] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  // Filters apply as they change — the search field debounces itself — so the
  // list never sits behind an extra "Search" click.
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedCategoryId, setAppliedCategoryId] = useState<string>("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<CategoryOption | null>(null);
  const [appliedAvailableFilter, setAppliedAvailableFilter] =
    useState<string>("");

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

  const isFiltered =
    appliedSearch.trim().length > 0 ||
    appliedCategoryId.length > 0 ||
    appliedAvailableFilter.length > 0;

  const handleReset = useCallback(() => {
    setSelectedCategoryFilter(null);
    setAppliedSearch("");
    setAppliedCategoryId("");
    setAppliedAvailableFilter("");
    setPage(1);
  }, []);

  const handleEdit = useCallback(
    async (item: Item) => {
      if (!menuId) return;
      setEditingItem(null);
      setIsEditItemLoading(true);
      try {
        const result = await axiosGet<{ item?: Item } | Item>(
          `/menus/${menuId}/items/${item.id}?locale=${locale}`,
          locale,
        );
        if (result.status && result.data) {
          const payload = result.data as { item?: Item };
          setEditingItem(payload.item ?? (result.data as Item));
        } else {
          setEditingItem(item);
        }
      } catch {
        setEditingItem(item);
      } finally {
        setIsEditItemLoading(false);
      }
    },
    [menuId, locale],
  );
  const handleDelete = useCallback((item: Item) => {
    setDeletingItem(item);
  }, []);

  const refreshList = useCallback(() => {
    setRefreshing((r) => r + 1);
  }, []);

  useSameRouteRefresh(refreshList);

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
    setIsEditItemLoading(false);
  }, []);

  return (
    <>
      <PageTitleWithHelp
        id="onboarding-items-header"
        className="mb-3"
        title={t("title")}
        description={t("subtitle")}
        meta={
          !loading && totalItems > 0 ? (
            <Badge tone="neutral">
              <span data-numeric>{totalItems}</span>
            </Badge>
          ) : undefined
        }
        actions={
          <>
            <MenuImportEntryButton menuId={menuId} variant="secondary" />
            <Button
              id="onboarding-add-item"
              onClick={openAddModal}
              className="hidden md:inline-flex"
              startIcon={<IoAddCircleOutline className="size-4" />}
            >
              {t("addItem")}
            </Button>
          </>
        }
      />

      <Card id="onboarding-items-filters" padded="sm" className="mb-3">
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
            <>
              {menuId ? (
                <div className="min-w-48 flex-1 sm:flex-none">
                  <CategorySearchSelect
                    menuId={menuId}
                    instanceId="items-category-filter"
                    variant="filter"
                    value={appliedCategoryId}
                    selectedOption={selectedCategoryFilter}
                    placeholder={t("allCategories")}
                    onChange={(id, option) => {
                      setAppliedCategoryId(id);
                      setSelectedCategoryFilter(option);
                      setPage(1);
                    }}
                  />
                </div>
              ) : null}
              <Select
                value={appliedAvailableFilter}
                onChange={(e) => {
                  setAppliedAvailableFilter(e.target.value);
                  setPage(1);
                }}
                aria-label={t("availability")}
                className="min-w-36"
              >
                <option value="">{t("allStatus")}</option>
                <option value="true">{t("available")}</option>
                <option value="false">{t("unavailable")}</option>
              </Select>
              {isFiltered ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleReset}
                  startIcon={<IoRefreshOutline className="size-3.5" />}
                >
                  {t("reset")}
                </Button>
              ) : null}
            </>
          }
        />
      </Card>

      {!loading && items.some((item) => !getImageUrl(item)) ? (
        <Alert
          tone="info"
          icon={<IoCameraOutline />}
          className="mb-3"
        >
          {t("missingImagesHint")}
        </Alert>
      ) : null}

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

      {(showAddModal || isEditItemLoading || editingItem) && menuId && (
        <AddItemModal
          menuId={menuId}
          item={editingItem}
          isItemLoading={isEditItemLoading}
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
