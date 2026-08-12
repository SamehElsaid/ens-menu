"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { IoAddOutline, IoMegaphoneOutline } from "react-icons/io5";
import {
  FaEye,
  FaTrash,
  FaEdit,
  FaBan,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { FiAlertTriangle } from "react-icons/fi";
import { axiosGet, axiosDelete, axiosPatch } from "@/shared/axiosCall";
import LoadImage from "@/components/ImageLoad";
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  EmptyState,
  NoResultsState,
  PageHeader,
  PageShell,
  SearchInput,
  SegmentedControl,
  StatCard,
  StatGrid,
  Toolbar,
  type DataColumn,
} from "@/components/ui";
import { useDataTableLabels } from "@/hooks/useDataTableLabels";

interface Advertisement {
  id: number;
  title?: string;
  titleAr?: string;
  content?: string;
  contentAr?: string;
  imageUrl?: string;
  linkUrl?: string;
  isActive?: boolean;
  clickCount?: number;
  impressionCount?: number;
  displayOrder?: number;
  position?: string;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface AdsResponse {
  ads: Advertisement[];
  statistics: {
    total: number;
    totalActive: number;
    totalClicks: number;
  };
}

type StatusFilter = "all" | "active" | "inactive";

export default function AdminAdvertisementsPage() {
  const locale = useLocale();
  const t = useTranslations("adminAds");
  const tCommon = useTranslations("common");
  const tAdmin = useTranslations("adminDashboard");
  const router = useRouter();
  const tableLabels = useDataTableLabels();
  const isRTL = locale === "ar";

  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    totalActive: 0,
    totalClicks: 0,
  });
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    ad: Advertisement | null;
  }>({ isOpen: false, ad: null });
  const [deactivateModal, setDeactivateModal] = useState<{
    isOpen: boolean;
    ad: Advertisement | null;
  }>({ isOpen: false, ad: null });
  const [loadingAdId, setLoadingAdId] = useState<number | null>(null);

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      const result = await axiosGet<AdsResponse>("/admin/ads", locale);

      if (result.status && result.data) {
        setAds(result.data.ads || []);
        setStats(
          result.data.statistics || {
            total: 0,
            totalActive: 0,
            totalClicks: 0,
          },
        );
      } else {
        toast.error(t("error"));
      }
    } catch (err) {
      console.error("Error fetching ads:", err);
      toast.error(t("error"));
    } finally {
      setLoading(false);
    }
  }, [locale, t]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const handleDelete = useCallback(async () => {
    if (!deleteModal.ad) return;

    const adId = deleteModal.ad.id;
    setLoadingAdId(adId);
    try {
      const result = await axiosDelete<{ message?: string }>(
        `/admin/ads/${adId}`,
        locale,
      );

      if (result.status) {
        toast.success(t("deleteSuccess"));
        setDeleteModal({ isOpen: false, ad: null });
        fetchAds();
      } else {
        toast.error(t("deleteError"));
      }
    } catch (err) {
      console.error("Error deleting ad:", err);
      toast.error(t("deleteError"));
    } finally {
      setLoadingAdId(null);
    }
  }, [deleteModal.ad, locale, t, fetchAds]);

  const handleDeactivate = useCallback(async () => {
    if (!deactivateModal.ad) return;

    const adId = deactivateModal.ad.id;
    setLoadingAdId(adId);
    try {
      const payload = { isActive: false };
      const result = await axiosPatch<typeof payload, Advertisement>(
        `/admin/ads/${adId}`,
        locale,
        payload,
      );

      if (result.status && result.data) {
        toast.success(t("deactivateSuccess"));
        setDeactivateModal({ isOpen: false, ad: null });
        fetchAds();
      } else {
        toast.error(t("deactivateError"));
      }
    } catch (err) {
      console.error("Error deactivating ad:", err);
      toast.error(t("deactivateError"));
    } finally {
      setLoadingAdId(null);
    }
  }, [deactivateModal.ad, locale, t, fetchAds]);

  const handleActivate = useCallback(
    async (adId: number) => {
      setLoadingAdId(adId);
      try {
        const payload = { isActive: true };
        const result = await axiosPatch<typeof payload, Advertisement>(
          `/admin/ads/${adId}`,
          locale,
          payload,
        );

        if (result.status && result.data) {
          toast.success(t("activateSuccess"));
          fetchAds();
        } else {
          toast.error(t("activateError"));
        }
      } catch (err) {
        console.error("Error activating ad:", err);
        toast.error(t("activateError"));
      } finally {
        setLoadingAdId(null);
      }
    },
    [locale, t, fetchAds],
  );

  const getTitle = useCallback(
    (ad: Advertisement) => (isRTL && ad.titleAr ? ad.titleAr : ad.title || ""),
    [isRTL],
  );

  const getContent = useCallback(
    (ad: Advertisement) =>
      isRTL && ad.contentAr ? ad.contentAr : ad.content || "",
    [isRTL],
  );

  const visibleAds = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ads.filter((ad) => {
      const isActive = ad.isActive ?? false;
      if (statusFilter === "active" && !isActive) return false;
      if (statusFilter === "inactive" && isActive) return false;
      if (!q) return true;
      return (
        getTitle(ad).toLowerCase().includes(q) ||
        getContent(ad).toLowerCase().includes(q)
      );
    });
  }, [ads, query, statusFilter, getTitle, getContent]);

  const columns = useMemo<DataColumn<Advertisement>[]>(
    () => [
      {
        id: "ad",
        header: t("advertisement"),
        primary: true,
        sortValue: (ad) => getTitle(ad),
        cell: (ad) => (
          <span className="flex items-start gap-2.5">
            <span
              className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-2 text-fg-subtle"
              aria-hidden
            >
              {ad.imageUrl ? (
                <LoadImage
                  src={ad.imageUrl}
                  alt=""
                  className="size-10 object-cover"
                  width={40}
                  height={40}
                  cover
                />
              ) : (
                <IoMegaphoneOutline />
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-medium text-fg">
                {getTitle(ad) || "—"}
              </span>
              <span className="mt-0.5 block truncate text-[11px] text-fg-subtle">
                {getContent(ad).split("\n").filter(Boolean).join(" · ") || "—"}
              </span>
            </span>
          </span>
        ),
      },
      {
        id: "status",
        header: t("columns.status"),
        cell: (ad) => {
          const isActive = ad.isActive ?? false;
          return (
            <Badge tone={isActive ? "success" : "neutral"} dot>
              {isActive ? t("status.active") : t("status.inactive")}
            </Badge>
          );
        },
      },
      {
        id: "views",
        header: t("views"),
        align: "end",
        numeric: true,
        sortValue: (ad) => ad.impressionCount || 0,
        cell: (ad) => (
          <span className="ui-figure text-[13px]" lang="en">
            {(ad.impressionCount || 0).toLocaleString("en-US")}
          </span>
        ),
      },
      {
        id: "clicks",
        header: t("clicks"),
        align: "end",
        numeric: true,
        sortValue: (ad) => ad.clickCount || 0,
        cell: (ad) => (
          <span className="ui-figure text-[13px]" lang="en">
            {(ad.clickCount || 0).toLocaleString("en-US")}
          </span>
        ),
      },
      {
        id: "link",
        header: t("hasLink"),
        hideOnMobile: true,
        cell: (ad) =>
          ad.linkUrl ? (
            <a
              href={ad.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex max-w-40 items-center gap-1 truncate font-mono text-[12px] text-brand hover:underline"
              dir="ltr"
            >
              <FaExternalLinkAlt className="size-2.5 shrink-0" aria-hidden />
              <span className="truncate">{ad.linkUrl}</span>
            </a>
          ) : (
            <span className="text-fg-subtle">—</span>
          ),
      },
    ],
    [t, getTitle, getContent],
  );

  /**
   * The ad roster as one ruled ledger.
   *
   * Every ad used to be a full-width card with its own image, paragraph and row
   * of five coloured buttons, so a list of ten was ten screens of chrome and
   * the numbers that decide whether an ad is working were buried in a sentence.
   * As a table the impressions and clicks line up in tabular columns, status is
   * one badge, and the destructive verbs sit in a single trailing action group.
   */
  return (
    <PageShell
      kind="table"
      header={
        <>
          <PageHeader
            title={t("title")}
            description={t("subtitle")}
            breadcrumbs={[
              { label: tAdmin("title"), href: "/admin" },
              { label: t("title") },
            ]}
            breadcrumbsLabel={tCommon("breadcrumb")}
            actions={
              <Button
                startIcon={<IoAddOutline />}
                onClick={() => router.push("/admin/users/advertisements/new")}
              >
                {t("addNewAd")}
              </Button>
            }
          />

          <StatGrid columns={3} ruled>
            <StatCard
              label={t("totalAds")}
              value={
                <span lang="en">{stats.total.toLocaleString("en-US")}</span>
              }
              loading={loading}
            />
            <StatCard
              label={t("activeAds")}
              value={
                <span lang="en">
                  {stats.totalActive.toLocaleString("en-US")}
                </span>
              }
              loading={loading}
            />
            <StatCard
              label={t("totalClicks")}
              value={
                <span lang="en">
                  {stats.totalClicks.toLocaleString("en-US")}
                </span>
              }
              loading={loading}
            />
          </StatGrid>
        </>
      }
      toolbar={
        <Toolbar
          search={
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder={tCommon("search")}
              label={tCommon("search")}
              clearLabel={tCommon("clearSearch")}
            />
          }
          filters={
            <SegmentedControl<StatusFilter>
              label={t("columns.status")}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: t("filterAll"), count: ads.length },
                {
                  value: "active",
                  label: t("status.active"),
                  count: ads.filter((ad) => ad.isActive).length,
                },
                {
                  value: "inactive",
                  label: t("status.inactive"),
                  count: ads.filter((ad) => !ad.isActive).length,
                },
              ]}
            />
          }
        />
      }
    >
      <DataTable<Advertisement>
        columns={columns}
        rows={visibleAds}
        getRowKey={(ad) => String(ad.id)}
        caption={t("title")}
        loading={loading}
        tableId="admin-user-advertisements"
        stickyHeader
        densityControl
        columnControl
        labels={tableLabels}
        empty={
          query.trim() || statusFilter !== "all" ? (
            <NoResultsState
              title={tCommon("noResultsTitle")}
              description={tCommon("noResultsDescription")}
              onClear={() => {
                setQuery("");
                setStatusFilter("all");
              }}
              clearLabel={tCommon("clearFilters")}
            />
          ) : (
            <EmptyState
              icon={<IoMegaphoneOutline />}
              title={t("noAdsTitle")}
              description={t("noAdsDescription")}
              action={
                <Button
                  startIcon={<IoAddOutline />}
                  onClick={() => router.push("/admin/users/advertisements/new")}
                >
                  {t("addNewAd")}
                </Button>
              }
            />
          )
        }
        rowActions={(ad) => {
          const isLoading = loadingAdId === ad.id;
          const isActive = ad.isActive ?? false;
          return (
            <span className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                aria-label={t("actions.edit")}
                title={t("actions.edit")}
                disabled={isLoading}
                onClick={() =>
                  router.push(`/admin/users/advertisements/${ad.id}`)
                }
              >
                <FaEdit />
              </Button>
              {isActive ? (
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  aria-label={t("actions.deactivate")}
                  title={t("actions.deactivate")}
                  disabled={isLoading}
                  onClick={() => setDeactivateModal({ isOpen: true, ad })}
                >
                  <FaBan />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  aria-label={t("actions.activate")}
                  title={t("actions.activate")}
                  loading={isLoading}
                  onClick={() => handleActivate(ad.id)}
                >
                  <FaEye />
                </Button>
              )}
              <Button
                variant="dangerGhost"
                size="sm"
                iconOnly
                aria-label={t("actions.delete")}
                title={t("actions.delete")}
                disabled={isLoading}
                onClick={() => setDeleteModal({ isOpen: true, ad })}
              >
                <FaTrash />
              </Button>
            </span>
          );
        }}
      />

      <ConfirmDialog
        open={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, ad: null })}
        onConfirm={handleDelete}
        title={t("deleteConfirmTitle")}
        description={t("deleteConfirm", {
          title: deleteModal.ad ? getTitle(deleteModal.ad) : "",
        })}
        confirmLabel={t("actions.delete")}
        cancelLabel={t("actions.cancel")}
        loading={loadingAdId === deleteModal.ad?.id}
        tone="danger"
        icon={<FiAlertTriangle />}
      />

      <ConfirmDialog
        open={deactivateModal.isOpen}
        onClose={() => setDeactivateModal({ isOpen: false, ad: null })}
        onConfirm={handleDeactivate}
        title={t("deactivateConfirmTitle")}
        description={t("deactivateConfirm", {
          title: deactivateModal.ad ? getTitle(deactivateModal.ad) : "",
        })}
        confirmLabel={t("actions.deactivate")}
        cancelLabel={t("actions.cancel")}
        loading={loadingAdId === deactivateModal.ad?.id}
        tone="brand"
        icon={<FiAlertTriangle />}
      />
    </PageShell>
  );
}
