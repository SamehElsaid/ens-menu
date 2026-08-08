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
import { FaTrash, FaEdit } from "react-icons/fa";
import CardDashBoard from "@/components/Card/CardDashBoard";
import { axiosGet, axiosDelete } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import { FiAlertTriangle } from "react-icons/fi";
import {
  Button,
  ConfirmDialog,
  EmptyState,
  NoResultsState,
  PageHeader,
  Pagination,
  SearchInput,
  Skeleton,
  SkeletonRegion,
  Spinner,
} from "@/components/ui";
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
  const tCommon = useTranslations("common");
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
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        actions={
          <Button
            variant="secondary"
            startIcon={<IoArrowBack className="rtl:rotate-180" />}
            onClick={() => router.back()}
          >
            {t("back")}
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CardDashBoard borderColor="border-violet-200 dark:border-violet-500/20" hover>
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-xl bg-brand-soft">
              <IoLibraryOutline className="text-2xl text-brand-soft-fg" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                {t("totalItems")}
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {loading ? (
                  <Spinner size="md" label={tCommon("loading")} />
                ) : (
                  pagination.total.toLocaleString()
                )}
              </p>
            </div>
          </div>
        </CardDashBoard>

        <CardDashBoard borderColor="border-sky-200 dark:border-sky-500/20" hover>
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-xl bg-info-soft">
              <IoSearchOutline className="text-2xl text-info-fg" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                {t("filteredItems")}
              </p>
              <p className="text-3xl font-bold text-sky-600 dark:text-sky-400">
                {loading ? (
                  <Spinner size="md" label={tCommon("loading")} />
                ) : (
                  items.length.toLocaleString()
                )}
              </p>
            </div>
          </div>
        </CardDashBoard>
      </div>

      <div className={`flex flex-wrap items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t("searchPlaceholder")}
          label={t("searchPlaceholder")}
          className="min-w-[220px] flex-1"
        />
        <Button startIcon={<IoAddOutline />} onClick={openAdd}>
          {t("addNew")}
        </Button>
      </div>

      {loading ? (
        <SkeletonRegion label={tCommon("loading")}>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <CardDashBoard key={i}>
                <Skeleton className="mb-3 h-5 w-40" />
                <Skeleton className="mb-3 h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-20 rounded-lg" />
                  <Skeleton className="h-9 w-20 rounded-lg" />
                </div>
              </CardDashBoard>
            ))}
          </div>
        </SkeletonRegion>
      ) : items.length === 0 ? (
        debouncedSearch ? (
          <NoResultsState
            title={t("noResults")}
            description={t("noResultsDescription")}
            onClear={() => setSearch("")}
            clearLabel={tCommon("clearSearch")}
          />
        ) : (
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
            icon={<IoLibraryOutline />}
            action={
              <Button startIcon={<IoAddOutline />} onClick={openAdd}>
                {t("addNew")}
              </Button>
            }
          />
        )
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
                        <Button
                          variant="secondary"
                          size="sm"
                          startIcon={<FaEdit />}
                          onClick={() => openEdit(item)}
                          disabled={isBusy}
                        >
                          {t("actions.edit")}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          startIcon={<FaTrash />}
                          onClick={() => setDeleteModal({ isOpen: true, item })}
                          disabled={isBusy}
                          loading={isBusy}
                        >
                          {t("actions.delete")}
                        </Button>
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
            onPageChange={setPage}
            disabled={loading}
            summary={tCommon("paginationInfo", {
              from: ((page - 1) * pagination.limit + 1).toLocaleString(),
              to: Math.min(page * pagination.limit, pagination.total).toLocaleString(),
              total: pagination.total.toLocaleString(),
            })}
            labels={{
              region: tCommon("pagination"),
              previous: tCommon("previousPage"),
              next: tCommon("nextPage"),
              page: (n) => tCommon("goToPage", { page: n }),
            }}
          />
        </>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null })}
        onConfirm={handleDelete}
        title={t("deleteConfirmTitle")}
        description={t("deleteConfirm", {
          title: deleteModal.item ? getTitle(deleteModal.item) : "",
        })}
        confirmLabel={t("actions.delete")}
        cancelLabel={t("actions.cancel")}
        loading={loadingItemId === deleteModal.item?.id}
        tone="danger"
        icon={<FiAlertTriangle />}
      />

    </div>
  );
}
