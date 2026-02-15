"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { axiosGet } from "@/shared/axiosCall";
import AddItemModal from "@/components/Dashboard/AddItemModal";
import DeleteItemConfirm from "@/components/Dashboard/DeleteItemConfirm";
import DataTable from "@/components/Custom/DataTable";
import LoadImage from "@/components/ImageLoad";
import { Item, Category } from "@/types/Menu";
import {
  IoAddCircleOutline,
  IoEllipseSharp,
  IoCreateOutline,
  IoTrashOutline,
  IoSearchOutline,
  IoRefreshOutline,
} from "react-icons/io5";

export default function ItemsPage() {
  const t = useTranslations("Items");
  const locale = useLocale();
  const params = useParams();
  const menuId =
    typeof params.menu === "string"
      ? params.menu
      : ((params.menu as string[])?.[0] ?? "");

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [refreshing, setRefreshing] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [categoryFilterId, setCategoryFilterId] = useState<string>("");
  const [availableFilter, setAvailableFilter] = useState<string>(""); // "" | "true" | "false"
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
        `/menus/${menuId}/items?page=${page}&limit=10${searchParam}${categoryParam}${availableParam}`,
        locale,
      );
      if (result.status && result.data) {
        const raw = result.data as { items?: Item[] };
        const list = raw?.items ?? [];
        setItems(list);
        setTotalPages(
          (result.data as unknown as { pagination?: { totalPages: number } })
            .pagination?.totalPages ?? 0,
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

  const handleEdit = useCallback((item: Item) => {
    setEditingItem(item);
  }, []);
  const handleDelete = useCallback((item: Item) => {
    setDeletingItem(item);
  }, []);

  const refreshList = useCallback(() => {
    setRefreshing((r) => r + 1);
  }, []);

  const closeAddModal = useCallback(() => {
    setShowAddModal(false);
    setEditingItem(null);
  }, []);

  const columnDefs = useMemo<ColDef<Item>[]>(
    () => [
      {
        headerName: t("image"),
        field: "imageUrl",
        width: 80,
        sortable: false,
        cellRenderer: (params: ICellRendererParams<Item>) => {
          const item = params.data;
          if (!item) return null;
          const src = getImageUrl(item);
          return (
            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
              {src ? (
                <LoadImage
                  src={src}
                  alt={getName(item)}
                  className="w-full h-full object-cover"
                  width={48}
                  height={48}
                />
              ) : (
                <span className="text-slate-400 dark:text-slate-500 text-lg">
                  —
                </span>
              )}
            </div>
          );
        },
      },
      {
        headerName: t("name"),
        minWidth: 140,
        flex: 1,
        cellRenderer: (params: ICellRendererParams<Item>) => {
          const item = params.data;
          if (!item) return null;
          const name = getName(item);
          return (
            <span
              className="font-medium text-slate-800 dark:text-slate-100"
              dir={locale === "ar" ? "rtl" : "ltr"}
            >
              {name}
            </span>
          );
        },
      },
      {
        headerName: t("category"),
        width: 120,
        cellRenderer: (params: ICellRendererParams<Item>) => (
          <span className="text-slate-700 dark:text-slate-300">
            {params.data ? getCategoryName(params.data) : "—"}
          </span>
        ),
      },
      {
        headerName: t("price"),
        width: 90,
        field: "price",
        cellRenderer: (params: ICellRendererParams<Item>) => (
          <span className="font-medium text-slate-800 dark:text-slate-100">
            {params.data?.price ?? "—"}
          </span>
        ),
      },
      {
        headerName: t("originalPrice"),
        width: 100,
        field: "originalPrice",
        cellRenderer: (params: ICellRendererParams<Item>) => (
          <span className="text-slate-600 dark:text-slate-400">
            {params.data?.originalPrice ?? "—"}
          </span>
        ),
      },
      {
        headerName: t("discountPercent"),
        width: 90,
        field: "discountPercent",
        cellRenderer: (params: ICellRendererParams<Item>) => {
          const p = params.data?.discountPercent;
          return <span>{p != null ? `${p}%` : "—"}</span>;
        },
      },
      {
        headerName: t("currentlyAvailable"),
        width: 120,
        field: "available",
        cellRenderer: (params: ICellRendererParams<Item>) => {
          const item = params.data;
          if (!item) return null;
          const available = item.available;
          return (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                available
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
              }`}
            >
              <IoEllipseSharp
                className={`text-[8px] ${available ? "text-green-500 dark:text-green-400" : "text-amber-500 dark:text-amber-400"}`}
              />
              {available ? t("available") : t("unavailable")}
            </span>
          );
        },
      },
      {
        headerName: t("action"),
        width: 120,
        sortable: false,
        pinned: "right",
        cellRenderer: (params: ICellRendererParams<Item>) => {
          const item = params.data;
          if (!item) return null;
          return (
            <div className="flex items-center gap-2 h-full">
              <button
                type="button"
                title={t("edit")}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(item);
                }}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-primary/30 dark:hover:border-primary/50 hover:text-primary transition-colors"
              >
                <IoCreateOutline className="text-lg" />
              </button>
              <button
                type="button"
                title={t("delete")}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item);
                }}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-200 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-300 transition-colors"
              >
                <IoTrashOutline className="text-lg" />
              </button>
            </div>
          );
        },
      },
    ],
    [t, locale, getName, getCategoryName, handleEdit, handleDelete],
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            {t("title")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {t("subtitle")}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <IoAddCircleOutline className="text-xl" />
          {t("addItem")}
        </button>
      </div>

      <div className="mb-6 p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
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
                placeholder={
                  locale === "ar" ? "بحث بالاسم..." : "Search by name..."
                }
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
              className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-shadow appearance-none bg-size-[1.25rem] bg-position-[right_0.75rem_center] bg-no-repeat"
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
              className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-shadow appearance-none bg-size-[1.25rem] bg-position-[right_0.75rem_center] bg-no-repeat"
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
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSearch}
              className="h-11 inline-flex items-center gap-2 px-5 bg-primary text-white rounded-xl font-semibold shadow-md hover:opacity-90 hover:shadow-lg transition-all"
            >
              <IoSearchOutline className="text-lg" />
              {t("search")}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="h-11 inline-flex items-center gap-2 px-5 rounded-xl border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <IoRefreshOutline className="text-lg" />
              {t("reset")}
            </button>
          </div>
        </div>
      </div>

      <DataTable<Item>
        rowData={items}
        columnDefs={columnDefs}
        loading={loading}
        locale={locale}
        showRowNumbers={true}
        pagination={true}
        paginationPageSize={10}
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />

      {(showAddModal || editingItem) && menuId && (
        <AddItemModal
          menuId={menuId}
          item={editingItem}
          categories={categories}
          onClose={closeAddModal}
          onRefresh={refreshList}
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
