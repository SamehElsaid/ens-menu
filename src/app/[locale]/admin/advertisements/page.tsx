"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, useCallback } from "react";
import {
  IoAddOutline,
  IoMegaphoneOutline,
  IoLinkOutline,
} from "react-icons/io5";
import {
  FaEye,
  FaTrash,
  FaEdit,
  FaBan,
  FaMousePointer,
  FaChartLine,
} from "react-icons/fa";
import { axiosGet, axiosDelete, axiosPatch } from "@/shared/axiosCall";
import { computeCtr } from "@/lib/fetchAdminAnalytics";
import { toast } from "react-toastify";
import { FiAlertTriangle } from "react-icons/fi";
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  EmptyState,
  PageHeader,
  PageShell,
  StatCard,
  StatGrid,
  type DataColumn,
} from "@/components/ui";
import { useDataTableLabels } from "@/hooks/useDataTableLabels";
import LoadImage from "@/components/ImageLoad";
import AddAdvertisementModal from "@/components/Dashboard/AddAdvertisementModal";
import type { Advertisement as BaseAdvertisement } from "@/types/Menu";

interface Advertisement extends BaseAdvertisement {
  id: number;
  clickCount?: number;
  impressionCount?: number;
  displayOrder?: number;
  position?: string;
  startDate?: string | null;
  endDate?: string | null;
  [key: string]: unknown;
}

interface AdsResponse {
  ads: Advertisement[];
  statistics: {
    total: number;
    totalActive: number;
    totalClicks: number;
    totalImpressions?: number;
  };
}

export default function AdminAdvertisementsPage() {
  const locale = useLocale();
  const t = useTranslations("adminAds");
  const tCommon = useTranslations("common");
  const tAdmin = useTranslations("adminDashboard");
  const tableLabels = useDataTableLabels();
  const isRTL = locale === "ar";

  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    totalActive: 0,
    totalClicks: 0,
    totalImpressions: 0,
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    ad: Advertisement | null;
  }>({ isOpen: false, ad: null });
  const [deactivateModal, setDeactivateModal] = useState<{
    isOpen: boolean;
    ad: Advertisement | null;
  }>({ isOpen: false, ad: null });
  const [loadingAdId, setLoadingAdId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      const result = await axiosGet<AdsResponse>("/admin/ads", locale);

      if (result.status && result.data) {
        setAds(result.data.ads || []);
        setStats({
          total: result.data.statistics?.total ?? 0,
          totalActive: result.data.statistics?.totalActive ?? 0,
          totalClicks: result.data.statistics?.totalClicks ?? 0,
          totalImpressions: result.data.statistics?.totalImpressions ?? 0,
        });
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

  const getTitle = (ad: Advertisement) => {
    return isRTL && ad.titleAr ? ad.titleAr : ad.title || "";
  };

  const getContent = (ad: Advertisement) => {
    return isRTL && ad.contentAr ? ad.contentAr : ad.content || "";
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const totalImpressions =
    stats.totalImpressions ||
    ads.reduce((sum, ad) => sum + (ad.impressionCount || 0), 0);
  const averageCtr = computeCtr(stats.totalClicks, totalImpressions);

  const openCreate = () => {
    setEditingAd(null);
    setShowAddModal(true);
  };

  const columns: DataColumn<Advertisement>[] = [
    {
      id: "ad",
      header: t("advertisement"),
      primary: true,
      cell: (ad) => {
        const summary = getContent(ad)
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)[0];
        return (
          <div className="flex min-w-0 items-start gap-2.5">
            <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-line bg-surface-2 text-fg-subtle">
              {ad.imageUrl ? (
                <LoadImage
                  src={ad.imageUrl}
                  alt=""
                  className="size-10 object-cover"
                  width={40}
                  height={40}
                />
              ) : (
                <IoMegaphoneOutline aria-hidden />
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-medium text-fg">
                {getTitle(ad)}
              </span>
              {summary ? (
                <span className="block truncate text-xs text-fg-muted">
                  {summary}
                </span>
              ) : null}
            </span>
          </div>
        );
      },
    },
    {
      id: "status",
      header: t("status.active"),
      cell: (ad) => (
        <Badge tone={ad.isActive ? "accent" : "neutral"} dot>
          {ad.isActive ? t("status.active") : t("status.inactive")}
        </Badge>
      ),
    },
    {
      id: "clicks",
      header: t("clicks"),
      align: "end",
      numeric: true,
      cell: (ad) => (
        <span className="ui-figure text-fg" lang="en">
          {(ad.clickCount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      id: "views",
      header: t("views"),
      align: "end",
      numeric: true,
      cell: (ad) => (
        <span className="ui-figure text-fg" lang="en">
          {(ad.impressionCount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      id: "ctr",
      header: t("ctr"),
      align: "end",
      numeric: true,
      cell: (ad) => (
        <span className="ui-figure text-fg" lang="en">
          {computeCtr(ad.clickCount || 0, ad.impressionCount || 0)}%
        </span>
      ),
    },
    {
      id: "createdAt",
      header: t("createdAt"),
      hideOnMobile: true,
      cell: (ad) => (
        <span className="whitespace-nowrap text-xs text-fg-muted">
          {formatDate(ad.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <PageShell
      kind="table"
      header={
        <>
          <PageHeader
            eyebrow={t("eyebrow")}
            title={t("title")}
            description={t("subtitle")}
            breadcrumbs={[
              { label: tAdmin("title"), href: "/admin" },
              { label: t("title") },
            ]}
            breadcrumbsLabel={tCommon("breadcrumb")}
            meta={
              !loading ? (
                <Badge>
                  <span lang="en">{ads.length}</span>{" "}
                  {ads.length === 1 ? t("advertisement") : t("advertisements")}
                </Badge>
              ) : undefined
            }
            actions={
              <Button startIcon={<IoAddOutline />} onClick={openCreate}>
                {t("addNewAd")}
              </Button>
            }
          />

          <StatGrid columns={4} ruled>
            <StatCard
              label={t("totalAds")}
              value={<span lang="en">{stats.total.toLocaleString()}</span>}
              icon={<IoMegaphoneOutline />}
              loading={loading}
            />
            <StatCard
              label={t("activeAds")}
              value={<span lang="en">{stats.totalActive.toLocaleString()}</span>}
              icon={<FaChartLine />}
              loading={loading}
            />
            <StatCard
              label={t("totalClicks")}
              value={<span lang="en">{stats.totalClicks.toLocaleString()}</span>}
              icon={<FaMousePointer />}
              loading={loading}
            />
            <StatCard
              label={t("averageCtr")}
              value={<span lang="en">{averageCtr}%</span>}
              icon={<FaEye />}
              loading={loading}
            />
          </StatGrid>
        </>
      }
    >
      <DataTable<Advertisement>
        columns={columns}
        rows={ads}
        getRowKey={(ad) => String(ad.id)}
        caption={t("title")}
        loading={loading}
        tableId="admin-advertisements"
        stickyHeader
        densityControl
        labels={tableLabels}
        empty={
          <EmptyState
            title={t("noAdsTitle")}
            description={t("noAdsDescription")}
            icon={<IoMegaphoneOutline />}
            action={
              <Button startIcon={<IoAddOutline />} onClick={openCreate}>
                {t("addNewAd")}
              </Button>
            }
          />
        }
        rowActions={(ad) => {
          const isLoading = loadingAdId === ad.id;
          return (
            <div className="flex flex-wrap items-center justify-end gap-1">
              <Button
                variant="secondary"
                size="sm"
                iconOnly
                aria-label={t("actions.edit")}
                title={t("actions.edit")}
                onClick={() => {
                  setEditingAd(ad);
                  setShowAddModal(true);
                }}
                disabled={isLoading}
              >
                <FaEdit />
              </Button>

              {ad.isActive ? (
                <Button
                  variant="secondary"
                  size="sm"
                  iconOnly
                  aria-label={t("actions.deactivate")}
                  title={t("actions.deactivate")}
                  onClick={() => setDeactivateModal({ isOpen: true, ad })}
                  disabled={isLoading}
                >
                  <FaBan />
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  iconOnly
                  aria-label={t("actions.activate")}
                  title={t("actions.activate")}
                  onClick={() => handleActivate(ad.id)}
                  disabled={isLoading}
                  loading={isLoading}
                >
                  <FaEye />
                </Button>
              )}

              {ad.linkUrl ? (
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  aria-label={t("actions.viewLink")}
                  title={t("actions.viewLink")}
                  onClick={() => window.open(ad.linkUrl, "_blank")}
                  disabled={isLoading}
                >
                  <IoLinkOutline />
                </Button>
              ) : null}

              <Button
                variant="dangerGhost"
                size="sm"
                iconOnly
                aria-label={t("actions.delete")}
                title={t("actions.delete")}
                onClick={() => setDeleteModal({ isOpen: true, ad })}
                disabled={isLoading}
              >
                <FaTrash />
              </Button>
            </div>
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

      {showAddModal && (
        <AddAdvertisementModal
          adminMode
          ad={editingAd}
          onClose={() => {
            setShowAddModal(false);
            setEditingAd(null);
          }}
          onRefresh={fetchAds}
        />
      )}
    </PageShell>
  );
}
