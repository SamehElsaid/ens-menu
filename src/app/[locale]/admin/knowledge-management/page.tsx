"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { IoAddOutline, IoLibraryOutline } from "react-icons/io5";
import { FaTrash, FaEdit } from "react-icons/fa";
import { axiosGet, axiosDelete } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import { FiAlertTriangle } from "react-icons/fi";
import {
  Button,
  ConfirmDialog,
  DataTable,
  EmptyState,
  NoResultsState,
  PageHeader,
  PageShell,
  Pagination,
  SearchInput,
  Toolbar,
  type DataColumn,
} from "@/components/ui";
import { useDataTableLabels } from "@/hooks/useDataTableLabels";
import ViewTime from "@/shared/ViewTime";

const PAGE_LIMIT = 10;

interface SearchInformation {
  id: number;
  titleAr: string;
  titleEn: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface SearchInformationResponse {
  success: boolean;
  data: SearchInformation[];
  pagination: PaginationMeta;
}

export default function KnowledgeManagementPage() {
  const locale = useLocale();
  const t = useTranslations("adminKnowledge");
  const tCommon = useTranslations("common");
  const tAdmin = useTranslations("adminDashboard");
  const tableLabels = useDataTableLabels();
  const router = useRouter();
  const isRTL = locale === "ar";

  const [items, setItems] = useState<SearchInformation[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
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

  const openEdit = useCallback(
    (item: SearchInformation) => {
      router.push(`/admin/knowledge-management/add?id=${item.id}`);
    },
    [router],
  );

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
  }, [
    deleteModal.item,
    locale,
    t,
    fetchItems,
    items.length,
    page,
    debouncedSearch,
  ]);

  const columns: DataColumn<SearchInformation>[] = [
    {
      id: "titleAr",
      header: t("titleAr"),
      primary: isRTL,
      cell: (item) => (
        <span className="block min-w-0 truncate font-medium text-fg" lang="ar">
          {item.titleAr}
        </span>
      ),
    },
    {
      id: "titleEn",
      header: t("titleEn"),
      primary: !isRTL,
      cell: (item) => (
        <span className="block min-w-0 truncate font-medium text-fg" lang="en">
          {item.titleEn}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: t("createdAt"),
      hideOnMobile: true,
      cell: (item) =>
        item.createdAt ? (
          <span className="whitespace-nowrap text-xs text-fg-muted">
            <ViewTime data={item.createdAt} />
          </span>
        ) : (
          <span className="text-fg-subtle">—</span>
        ),
    },
    {
      id: "updatedAt",
      header: t("updatedAt"),
      cell: (item) =>
        item.updatedAt ? (
          <span className="whitespace-nowrap text-xs text-fg-muted">
            <ViewTime data={item.updatedAt} />
          </span>
        ) : (
          <span className="text-fg-subtle">—</span>
        ),
    },
  ];

  return (
    <PageShell
      kind="detail"
      header={
        /* The two metrics here were "total" and "rows on this page" — the second
           was the page size dressed as an insight, and the first is already
           stated by the pagination summary. Both are gone; an article list does
           not need an instrument panel. */
        <PageHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("subtitle")}
          breadcrumbs={[
            { label: tAdmin("title"), href: "/admin" },
            { label: t("title") },
          ]}
          breadcrumbsLabel={tCommon("breadcrumb")}
          actions={
            <Button startIcon={<IoAddOutline />} onClick={openAdd}>
              {t("addNew")}
            </Button>
          }
        />
      }
      toolbar={
        <Toolbar
          search={
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={t("searchPlaceholder")}
              label={t("searchPlaceholder")}
              clearLabel={tCommon("clearSearch")}
            />
          }
        />
      }
      footer={
        items.length > 0 ? (
          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            disabled={loading}
            summary={tCommon("paginationInfo", {
              from: ((page - 1) * pagination.limit + 1).toLocaleString(),
              to: Math.min(
                page * pagination.limit,
                pagination.total,
              ).toLocaleString(),
              total: pagination.total.toLocaleString(),
            })}
            labels={{
              region: tCommon("pagination"),
              previous: tCommon("previousPage"),
              next: tCommon("nextPage"),
              page: (n) => tCommon("goToPage", { page: n }),
            }}
          />
        ) : null
      }
    >
      <DataTable<SearchInformation>
        columns={columns}
        rows={items}
        getRowKey={(item) => String(item.id)}
        caption={t("title")}
        loading={loading}
        tableId="admin-knowledge"
        stickyHeader
        densityControl
        labels={tableLabels}
        empty={
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
        }
        rowActions={(item) => {
          const isBusy = loadingItemId === item.id;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="secondary"
                size="sm"
                iconOnly
                aria-label={t("actions.edit")}
                title={t("actions.edit")}
                onClick={() => openEdit(item)}
                disabled={isBusy}
              >
                <FaEdit />
              </Button>
              <Button
                variant="dangerGhost"
                size="sm"
                iconOnly
                aria-label={t("actions.delete")}
                title={t("actions.delete")}
                onClick={() => setDeleteModal({ isOpen: true, item })}
                disabled={isBusy}
                loading={isBusy}
              >
                <FaTrash />
              </Button>
            </div>
          );
        }}
      />

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
    </PageShell>
  );
}
