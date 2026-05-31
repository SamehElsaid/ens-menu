"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  IoArrowBack,
  IoAddOutline,
  IoLibraryOutline,
  IoSearchOutline,
} from "react-icons/io5";
import { FaSpinner, FaTrash, FaEdit } from "react-icons/fa";
import CardDashBoard from "@/components/Card/CardDashBoard";
import { axiosGet, axiosDelete } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import ConfirmationModal from "@/components/Custom/ConfirmationModal";
import Pagination from "@/components/Custom/Pagination";
import ViewTime from "@/shared/ViewTime";

const PAGE_LIMIT = 10;

interface SearchInformation {
  id: number;
  titleAr: string;
  titleEn: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface SearchInformationResponse {
  success: boolean;
  data: SearchInformation[];
  pagination: Pagination;
}

export default function KnowledgeManagementPage() {
  const locale = useLocale();
  const t = useTranslations("adminKnowledge");
  const router = useRouter();
  const isRTL = locale === "ar";

  const [items, setItems] = useState<SearchInformation[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: PAGE_LIMIT,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingItemId, setLoadingItemId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    item: SearchInformation | null;
  }>({ isOpen: false, item: null });

  const getTitle = useCallback(
    (item: SearchInformation) =>
      isRTL && item.titleAr ? item.titleAr : item.titleEn,
    [isRTL],
  );

  const fetchItems = useCallback(
    async (currentPage: number, currentSearch: string) => {
      try {
        setLoading(true);
        const params: Record<string, unknown> = {
          page: currentPage,
          limit: PAGE_LIMIT,
        };
        if (currentSearch.trim()) params.search = currentSearch.trim();

        const result = await axiosGet<SearchInformationResponse>(
          "/searchInformation",
          locale,
          undefined,
          params,
        );

        if (result.status && result.data) {
          setItems(result.data.data ?? []);
          if (result.data.pagination) setPagination(result.data.pagination);
        } else {
          toast.error(t("error"));
        }
      } catch {
        toast.error(t("error"));
      } finally {
        setLoading(false);
      }
    },
    [locale, t],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 700);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchItems(page, debouncedSearch);
  }, [fetchItems, page, debouncedSearch]);

  const openAdd = useCallback(() => {
    router.push("/admin/knowledge-management/add");
  }, [router]);

  const openEdit = useCallback((item: SearchInformation) => {
    router.push(`/admin/knowledge-management/add?id=${item.id}`);
  }, [router]);

  const handleDelete = useCallback(async () => {
    if (!deleteModal.item) return;

    setLoadingItemId(deleteModal.item.id);
    try {
      const result = await axiosDelete<{ message?: string }>(
        `/searchInformation/${deleteModal.item.id}`,
        locale,
      );

      if (result.status) {
        toast.success(t("deleteSuccess"));
        setDeleteModal({ isOpen: false, item: null });
        // If we deleted the last item on this page, go back one page
        const nextPage = items.length === 1 && page > 1 ? page - 1 : page;
        setPage(nextPage);
        if (nextPage === page) fetchItems(page, debouncedSearch);
      } else {
        toast.error(t("deleteError"));
      }
    } catch {
      toast.error(t("deleteError"));
    } finally {
      setLoadingItemId(null);
    }
  }, [deleteModal.item, locale, t, fetchItems, items.length, page, debouncedSearch]);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className={`flex items-center gap-4 mb-4 ${isRTL ? "flex-row-reverse" : ""}`}>
            <button
              onClick={() => router.back()}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <IoArrowBack className="text-lg" />
              <span className="font-medium">{t("back")}</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {t("title")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">{t("subtitle")}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CardDashBoard borderColor="border-violet-200 dark:border-violet-500/20" hover>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-violet-50 to-violet-100 dark:from-violet-500/20 dark:to-violet-600/10 flex items-center justify-center shadow-sm">
              <IoLibraryOutline className="text-violet-600 dark:text-violet-400 text-2xl" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                {t("totalItems")}
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {loading ? (
                  <span className="inline-block w-8 h-8 border-2 border-slate-300 dark:border-slate-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  pagination.total.toLocaleString()
                )}
              </p>
            </div>
          </div>
        </CardDashBoard>

        <CardDashBoard borderColor="border-sky-200 dark:border-sky-500/20" hover>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-sky-50 to-sky-100 dark:from-sky-500/20 dark:to-sky-600/10 flex items-center justify-center shadow-sm">
              <IoSearchOutline className="text-sky-600 dark:text-sky-400 text-2xl" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                {t("filteredItems")}
              </p>
              <p className="text-3xl font-bold text-sky-600 dark:text-sky-400">
                {loading ? (
                  <span className="inline-block w-8 h-8 border-2 border-sky-300 dark:border-sky-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  items.length.toLocaleString()
                )}
              </p>
            </div>
          </div>
        </CardDashBoard>
      </div>

      {/* Toolbar */}
      <div className={`flex items-center gap-3 flex-wrap ${isRTL ? "flex-row-reverse" : ""}`}>
        <div className="relative flex-1 min-w-[220px]">
          <IoSearchOutline
            className={`absolute top-1/2 -translate-y-1/2 text-slate-400 text-lg ${isRTL ? "right-3" : "left-3"}`}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            dir={isRTL ? "rtl" : "ltr"}
            className={`w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 transition ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"}`}
          />
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 whitespace-nowrap"
        >
          <IoAddOutline className="text-lg" />
          <span>{t("addNew")}</span>
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <CardDashBoard key={i}>
              <div className="space-y-3">
                <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="flex gap-2">
                  {[1, 2].map((j) => (
                    <div key={j} className="h-9 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
            </CardDashBoard>
          ))}
        </div>
      ) : items.length === 0 ? (
        <CardDashBoard>
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
              <IoLibraryOutline className="text-5xl text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {debouncedSearch ? t("noResults") : t("emptyTitle")}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              {debouncedSearch ? t("noResultsDescription") : t("emptyDescription")}
            </p>
            {!debouncedSearch && (
              <button
                onClick={openAdd}
                className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <IoAddOutline className="text-lg" />
                <span>{t("addNew")}</span>
              </button>
            )}
          </div>
        </CardDashBoard>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => {
              const isBusy = loadingItemId === item.id;
              return (
                <CardDashBoard key={item.id} hover className="transition-all duration-200 hover:shadow-lg">
                  <div className={`flex items-start justify-between gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3 line-clamp-1">
                        {getTitle(item)}
                      </h3>

                      {/* Bilingual titles */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg mb-4 text-xs">
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{t("titleAr")}: </span>
                          <span className="text-slate-500 dark:text-slate-400">{item.titleAr}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{t("titleEn")}: </span>
                          <span className="text-slate-500 dark:text-slate-400">{item.titleEn}</span>
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div className={`flex items-center gap-4 flex-wrap mb-4 text-xs text-slate-500 dark:text-slate-400 ${isRTL ? "flex-row-reverse" : ""}`}>
                        {item.createdAt && (
                          <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                            <span className="font-semibold text-slate-600 dark:text-slate-300">{t("createdAt")}:</span>
                            <ViewTime data={item.createdAt} />
                          </span>
                        )}
                        {item.updatedAt && (
                          <span className="flex items-center gap-1.5 bg-violet-50 dark:bg-violet-500/10 px-2.5 py-1 rounded-lg">
                            <span className="font-semibold text-violet-600 dark:text-violet-400">{t("updatedAt")}:</span>
                            <span className="text-violet-700 dark:text-violet-300">
                              <ViewTime data={item.updatedAt} />
                            </span>
                          </span>
                        )}
                      </div>

                      <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <button
                          onClick={() => openEdit(item)}
                          disabled={isBusy}
                          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                        >
                          <FaEdit className="text-xs" />
                          {t("actions.edit")}
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, item })}
                          disabled={isBusy}
                          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                        >
                          {isBusy ? (
                            <FaSpinner className="animate-spin text-xs" />
                          ) : (
                            <FaTrash className="text-xs" />
                          )}
                          {t("actions.delete")}
                        </button>
                      </div>
                    </div>
                  </div>
                </CardDashBoard>
              );
            })}
          </div>

          {/* Pagination */}
          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            loading={loading}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null })}
        onConfirm={handleDelete}
        title={t("deleteConfirmTitle")}
        message={t("deleteConfirm", {
          title: deleteModal.item ? getTitle(deleteModal.item) : "",
        })}
        confirmText={t("actions.delete")}
        cancelText={t("actions.cancel")}
        isLoading={loadingItemId === deleteModal.item?.id}
        loadingText={t("deleting")}
      />

    </div>
  );
}
