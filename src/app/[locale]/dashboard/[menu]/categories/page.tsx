"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { axiosGet } from "@/shared/axiosCall";
import AddCategoryModal from "@/components/Dashboard/AddCategoryModal";
import DeleteCategoryConfirm from "@/components/Dashboard/DeleteCategoryConfirm";
import DataTable from "@/components/Custom/DataTable";
import LoadImage from "@/components/ImageLoad";
import { Category } from "@/types/Menu";
import {
    IoAddCircleOutline,
    IoEllipseSharp,
    IoCreateOutline,
    IoTrashOutline,
} from "react-icons/io5";

export default function CategoriesPage() {
    const t = useTranslations("Categories");
    const locale = useLocale();
    const params = useParams();
    const menuId = typeof params.menu === "string" ? params.menu : (params.menu as string[])?.[0] ?? "";

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
    const [refreshing, setRefreshing] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);

    const fetchCategories = useCallback(async () => {
        if (!menuId) return;
        try {
            setLoading(true);
            const result = await axiosGet<Category[] | { categories: Category[] }>(
                `/menus/${menuId}/categories?page=${page}&limit=10`,
                locale
            );
            if (result.status && result.data) {

                const list = Array.isArray(result.data)
                    ? result.data
                    : (result.data as { categories: Category[] }).categories ?? [];
                setCategories(list);

                setTotalPages((result.data as unknown as { pagination: { totalPages: number } }).pagination?.totalPages ?? 0);
            }
        } finally {
            setLoading(false);
        }
    }, [menuId, locale, page]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories, refreshing, page]);

    const getName = (cat: Category) =>
        locale === "ar" ? cat.nameAr || cat.nameEn : cat.nameEn || cat.nameAr;
    const getImageUrl = (cat: Category) => cat.imageUrl ?? cat.image ?? "";

    const handleEdit = useCallback((cat: Category) => {
        setEditingCategory(cat);
    }, []);
    const handleDelete = useCallback((cat: Category) => {
        setDeletingCategory(cat);
    }, []);

    const refreshList = useCallback(() => {
        setRefreshing((r) => r + 1);
    }, []);

    const closeAddModal = useCallback(() => {
        setShowAddModal(false);
        setEditingCategory(null);
    }, []);

    const columnDefs = useMemo<ColDef<Category>[]>(() => [
        {
            headerName: t("image"),
            field: "imageUrl",
            width: 100,
            sortable: false,
            cellRenderer: (params: ICellRendererParams<Category>) => {
                const cat = params.data;
                if (!cat) return null;
                const src = getImageUrl(cat);
                return (
                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center">
                        {src ? (
                            <LoadImage
                                src={src}
                                alt={getName(cat)}
                                className="w-full h-full object-cover"
                                width={48}
                                height={48}
                            />
                        ) : (
                            <span className="text-slate-400 text-lg">—</span>
                        )}
                    </div>
                );
            },
        },
        {
            headerName: t("name"),
            cellRenderer: (params: ICellRendererParams<Category>) => <h3 className="text-xl capitalize font-medium text-slate-800">{params.data ? getName(params.data) : ""}</h3>,
            flex: 1,
            minWidth: 150,
        },
        {
            headerName: t("status"),
            field: "isActive",
            width: 120,
            cellRenderer: (params: ICellRendererParams<Category>) => {
                const cat = params.data;
                if (!cat) return null;
                const active = cat.isActive;
                return (
                    <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${active ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                            }`}
                    >
                        <IoEllipseSharp
                            className={`text-[8px] ${active ? "text-green-500" : "text-amber-500"}`}
                        />
                        {active ? t("active") : t("inactive")}
                    </span>
                );
            },
        },
        {
            headerName: t("action"),
            width: 120,
            sortable: false,
            cellRenderer: (params: ICellRendererParams<Category>) => {
                const cat = params.data;
                if (!cat) return null;
                return (
                    <div className="flex items-center gap-2 h-full">
                        <button
                            type="button"
                            title={t("edit")}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(cat);
                            }}
                            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-primary/30 hover:text-primary transition-colors"
                        >
                            <IoCreateOutline className="text-lg" />
                        </button>
                        <button
                            type="button"
                            title={t("delete")}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(cat);
                            }}
                            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                        >
                            <IoTrashOutline className="text-lg" />
                        </button>
                    </div>
                );
            },
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps -- columnDefs depend on t, locale (getName/getImageUrl), handleEdit, handleDelete
    ], [t, locale, handleEdit, handleDelete]);

    return (
        <>
            <div className="flex flex-col  sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">{t("title")}</h1>
                    <p className="text-slate-500 mt-1">{t("subtitle")}</p>
                </div>
                <button
                    onClick={() => {
                        setEditingCategory(null);
                        setShowAddModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <IoAddCircleOutline className="text-xl" />
                    {t("addCategory")}
                </button>
            </div>


            <DataTable<Category>
                rowData={categories}
                columnDefs={columnDefs}
                loading={loading}
                locale={locale}
                showRowNumbers={true}
                pagination={true}
                paginationPageSize={10}
                page={page}
                totalPages={totalPages}
                onPageChange={(page) => setPage(page)}
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
