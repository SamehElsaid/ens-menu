"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  IoArrowBack,
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
import CardDashBoard from "@/components/Card/CardDashBoard";
import { axiosGet, axiosDelete, axiosPatch } from "@/shared/axiosCall";
import { computeCtr } from "@/lib/fetchAdminAnalytics";
import { toast } from "react-toastify";
import { FiAlertTriangle } from "react-icons/fi";
import {
  Button,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  Skeleton,
  SkeletonRegion,
  Spinner,
} from "@/components/ui";
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
  const router = useRouter();
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

  return (
    <div className="space-y-6 pb-10" dir={isRTL ? "rtl" : "ltr"}>
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardDashBoard
          borderColor="border-blue-200 dark:border-blue-500/20"
          hover={true}
        >
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-lg bg-info-soft">
              <IoMegaphoneOutline className="text-2xl text-info-fg" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-fg-muted mb-1">
                {t("totalAds")}
              </p>
              <p className="text-3xl font-bold text-fg transition-all duration-300">
                {loading ? (
                  <Spinner size="md" label={tCommon("loading")} />
                ) : (
                  stats.total.toLocaleString()
                )}
              </p>
            </div>
          </div>
        </CardDashBoard>

        <CardDashBoard
          borderColor="border-green-200 dark:border-green-500/20"
          hover={true}
        >
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-lg bg-success-soft">
              <FaChartLine className="text-xl text-success-fg" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-fg-muted mb-1">
                {t("activeAds")}
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 transition-all duration-300">
                {loading ? (
                  <Spinner size="md" label={tCommon("loading")} />
                ) : (
                  stats.totalActive.toLocaleString()
                )}
              </p>
            </div>
          </div>
        </CardDashBoard>

        <CardDashBoard
          borderColor="border-purple-200 dark:border-purple-500/20"
          hover={true}
        >
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-lg bg-brand-soft">
              <FaMousePointer className="text-xl text-brand-soft-fg" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-fg-muted mb-1">
                {t("totalClicks")}
              </p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 transition-all duration-300">
                {loading ? (
                  <Spinner size="md" label={tCommon("loading")} />
                ) : (
                  stats.totalClicks.toLocaleString()
                )}
              </p>
            </div>
          </div>
        </CardDashBoard>

        <CardDashBoard
          borderColor="border-emerald-200 dark:border-emerald-500/20"
          hover={true}
        >
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-lg bg-success-soft">
              <FaChartLine className="text-xl text-success-fg" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-fg-muted mb-1">
                {t("averageCtr")}
              </p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 transition-all duration-300">
                {loading ? (
                  <Spinner size="md" label={tCommon("loading")} />
                ) : (
                  `${averageCtr}%`
                )}
              </p>
            </div>
          </div>
        </CardDashBoard>
      </div>

      {/* Add New Advertisement Button */}
      <div
        className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <div className="text-sm text-fg-muted">
          {!loading && (
            <span>
              {ads.length}{" "}
              {ads.length === 1 ? t("advertisement") : t("advertisements")}
            </span>
          )}
        </div>
        <Button
          startIcon={<IoAddOutline />}
          onClick={() => {
            setEditingAd(null);
            setShowAddModal(true);
          }}
        >
          {t("addNewAd")}
        </Button>
      </div>

      {/* Advertisements List */}
      {loading ? (
        <SkeletonRegion label={tCommon("loading")}>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <CardDashBoard key={i}>
                <div
                  className={`flex gap-6 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <Skeleton className="size-32 shrink-0 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-20 rounded-lg" />
                      <Skeleton className="h-9 w-20 rounded-lg" />
                    </div>
                  </div>
                </div>
              </CardDashBoard>
            ))}
          </div>
        </SkeletonRegion>
      ) : ads.length === 0 ? (
        <EmptyState
          title={t("noAdsTitle")}
          description={t("noAdsDescription")}
          icon={<IoMegaphoneOutline />}
          action={
            <Button
              startIcon={<IoAddOutline />}
              onClick={() => {
                setEditingAd(null);
                setShowAddModal(true);
              }}
            >
              {t("addNewAd")}
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {ads.map((ad) => {
            const isLoading = loadingAdId === ad.id;
            const isActive = ad.isActive ?? false;

            return (
              <CardDashBoard
                key={ad.id}
                hover={true}
                className="transition-all duration-200 hover:shadow-lg"
              >
                <div
                  className={`flex gap-6 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  {/* Image */}
                  <div className="shrink-0">
                    <div className="relative w-36 h-36 rounded-lg bg-surface-2 overflow-hidden group cursor-pointer shadow-md">
                      {ad.imageUrl ? (
                        <>
                          <LoadImage
                            src={ad.imageUrl}
                            alt={getTitle(ad)}
                            className="w-36 h-36 object-cover transition-transform duration-300 group-hover:scale-110"
                            width={144}
                            height={144}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-fg-subtle">
                          <IoMegaphoneOutline className="text-5xl" />
                        </div>
                      )}
                      {/* Status Badge Overlay */}
                      <div
                        className={`absolute top-2 ${isRTL ? "left-2" : "right-2"}`}
                      >
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shadow-md backdrop-blur-sm ${
                            isActive
                              ? "bg-green-500/90 text-white"
                              : "bg-slate-500/90 text-white"
                          }`}
                        >
                          {isActive ? t("status.active") : t("status.inactive")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title and Date */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-fg mb-1 line-clamp-1">
                          {getTitle(ad)}
                        </h3>
                        {ad.createdAt && (
                          <p className="text-xs text-fg-subtle">
                            {t("createdAt")}: {formatDate(ad.createdAt)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {getContent(ad) && (
                      <div className="text-fg-muted mb-4 space-y-1 line-clamp-2">
                        {getContent(ad)
                          .split("\n")
                          .filter((line) => line.trim())
                          .slice(0, 2)
                          .map((line, idx) => (
                            <p key={idx} className="text-sm">
                              {line}
                            </p>
                          ))}
                      </div>
                    )}

                    {/* Metrics */}
                    <div className="flex items-center gap-6 mb-4 p-3 bg-surface-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                          <FaMousePointer className="text-purple-600 dark:text-purple-400 text-sm" />
                        </div>
                        <div>
                          <p className="text-xs text-fg-muted">{t("clicks")}</p>
                          <p className="text-sm font-semibold text-fg">
                            {(ad.clickCount || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                          <FaEye className="text-blue-600 dark:text-blue-400 text-sm" />
                        </div>
                        <div>
                          <p className="text-xs text-fg-muted">{t("views")}</p>
                          <p className="text-sm font-semibold text-fg">
                            {(ad.impressionCount || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                          <FaChartLine className="text-emerald-600 dark:text-emerald-400 text-sm" />
                        </div>
                        <div>
                          <p className="text-xs text-fg-muted">{t("ctr")}</p>
                          <p className="text-sm font-semibold text-fg">
                            {computeCtr(
                              ad.clickCount || 0,
                              ad.impressionCount || 0,
                            )}
                            %
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div
                      className={`flex flex-wrap items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        startIcon={<FaEdit />}
                        onClick={() => {
                          setEditingAd(ad);
                          setShowAddModal(true);
                        }}
                        disabled={isLoading}
                      >
                        {t("actions.edit")}
                      </Button>

                      {isActive ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          startIcon={<FaBan />}
                          onClick={() =>
                            setDeactivateModal({ isOpen: true, ad })
                          }
                          disabled={isLoading}
                        >
                          {t("actions.deactivate")}
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          startIcon={<FaEye />}
                          onClick={() => handleActivate(ad.id)}
                          disabled={isLoading}
                          loading={isLoading}
                        >
                          {t("actions.activate")}
                        </Button>
                      )}

                      <Button
                        variant="danger"
                        size="sm"
                        startIcon={<FaTrash />}
                        onClick={() => setDeleteModal({ isOpen: true, ad })}
                        disabled={isLoading}
                      >
                        {t("actions.delete")}
                      </Button>

                      {ad.linkUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          startIcon={<IoLinkOutline />}
                          onClick={() => window.open(ad.linkUrl, "_blank")}
                          disabled={isLoading}
                        >
                          {t("actions.viewLink")}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardDashBoard>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
    </div>
  );
}
