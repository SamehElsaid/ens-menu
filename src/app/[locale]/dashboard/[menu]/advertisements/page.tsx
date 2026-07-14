"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { axiosGet, axiosPatch } from "@/shared/axiosCall";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import AddAdvertisementModal from "@/components/Dashboard/AddAdvertisementModal";
import DeleteAdvertisementConfirm from "@/components/Dashboard/DeleteAdvertisementConfirm";
import AdsStatsSection from "@/components/Dashboard/advertisements/AdsStatsSection";
import AdsCardGrid from "@/components/Dashboard/advertisements/AdsCardGrid";
import AdsEmptyState from "@/components/Dashboard/advertisements/AdsEmptyState";
import { canAddMenuAd } from "@/lib/adPlanLimits";
import LinkTo from "@/components/Global/LinkTo";
import { DemoDataBanner } from "@/components/Admin/AdminAnalyticsWidgets";
import { fetchMenuAnalytics } from "@/lib/fetchMenuAnalytics";
import { Advertisement } from "@/types/Menu";
import { IoAddCircleOutline } from "react-icons/io5";
import { useCurrentPlanCapabilities } from "@/hooks/useCurrentPlanCapabilities";
import { toast } from "react-toastify";

export default function AdvertisementsPage() {
  const locale = useLocale();
  const t = useTranslations("Advertisements.page");
  const tMenus = useTranslations("Menus");
  const params = useParams();
  const menuParam = (params as Record<string, string | string[] | undefined>)
    .menu;
  const menuId =
    typeof menuParam === "string"
      ? menuParam
      : Array.isArray(menuParam)
        ? menuParam[0] ?? ""
        : "";

  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [deletingAd, setDeletingAd] = useState<Advertisement | null>(null);
  const [refreshing, setRefreshing] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalAds, setTotalAds] = useState(0);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [adAnalyticsDemo, setAdAnalyticsDemo] = useState(false);

  const capabilities = useCurrentPlanCapabilities();
  const maxAdsPerMenu = capabilities.maxAdsPerMenu;

  const fetchAds = useCallback(async () => {
    if (!menuId) return;
    try {
      setLoading(true);
      const result = await axiosGet<{
        success?: boolean;
        data?: {
          ads?: Advertisement[];
          pagination?: { totalPages?: number; total?: number };
        };
      }>(`/menus/${menuId}/ads?page=${page}&limit=12`, locale);

      if (result.status && result.data) {
        const wrapper = result.data;
        const list = wrapper.data?.ads ?? [];
        setAds(list);

        const pages = wrapper.data?.pagination?.totalPages ?? 0;
        setTotalPages(pages);
        setTotalAds(Number(wrapper.data?.pagination?.total ?? list.length));
      } else {
        setAds([]);
        setTotalPages(0);
        setTotalAds(0);
      }
    } finally {
      setLoading(false);
    }
  }, [menuId, locale, page]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds, refreshing]);

  useEffect(() => {
    if (!menuId) return;
    void fetchMenuAnalytics(menuId, locale, "30d").then((data) => {
      setAdAnalyticsDemo(Boolean(data._isDemoData));
    });
  }, [menuId, locale]);

  const canAddAd = canAddMenuAd(maxAdsPerMenu, totalAds);

  const adSummaryMetrics = useMemo(() => {
    const totalImpressions = ads.reduce(
      (s, ad) => s + Number(ad.impressionCount ?? 0),
      0,
    );
    const totalClicks = ads.reduce(
      (s, ad) => s + Number(ad.clickCount ?? 0),
      0,
    );
    const ctr =
      totalImpressions > 0
        ? Math.round((totalClicks / totalImpressions) * 1000) / 10
        : 0;
    return [
      {
        id: "imp",
        label: t("metrics.impressions"),
        value: totalImpressions.toLocaleString(),
        tone: "sky" as const,
      },
      {
        id: "clk",
        label: t("metrics.clicks"),
        value: totalClicks.toLocaleString(),
        tone: "amber" as const,
      },
      {
        id: "ctr",
        label: t("metrics.ctr"),
        value: `${ctr}%`,
        tone: "emerald" as const,
      },
    ];
  }, [ads, t]);

  const refreshList = useCallback(() => setRefreshing((v) => v + 1), []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingAd(null);
  }, []);

  const handleAddClick = useCallback(() => {
    if (!canAddAd) return;
    setEditingAd(null);
    setShowModal(true);
  }, [canAddAd]);

  const handleEdit = useCallback((ad: Advertisement) => {
    setEditingAd(ad);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback((ad: Advertisement) => {
    setDeletingAd(ad);
  }, []);

  const handleToggleActive = useCallback(
    async (ad: Advertisement) => {
      if (ad.id == null) return;
      const nextActive = !ad.isActive;
      try {
        setTogglingId(ad.id);
        const result = await axiosPatch<
          { isActive: boolean },
          { success?: boolean; message?: string; error?: string }
        >(`/ads/${ad.id}`, locale, { isActive: nextActive });

        if (result.status) {
          setAds((prev) =>
            prev.map((item) =>
              item.id === ad.id ? { ...item, isActive: nextActive } : item,
            ),
          );
          toast.success(
            nextActive ? t("toggleActivateSuccess") : t("togglePauseSuccess"),
          );
        } else {
          const apiMessage =
            (result.data as { error?: string; message?: string } | undefined)
              ?.error ||
            (result.data as { message?: string } | undefined)?.message;
          toast.error(apiMessage || t("toggleError"));
        }
      } catch {
        toast.error(t("toggleError"));
      } finally {
        setTogglingId(null);
      }
    },
    [locale, t],
  );

  const getTitle = useCallback(
    (ad: Advertisement) => {
      if (locale === "ar") return ad.titleAr || ad.title || "";
      return ad.title || ad.titleAr || "";
    },
    [locale],
  );

  const getContent = useCallback(
    (ad: Advertisement) => {
      const full =
        locale === "ar"
          ? ad.contentAr || ad.content
          : ad.content || ad.contentAr;

      if (!full) return "—";
      return full.length > 80 ? `${full.slice(0, 77)}...` : full;
    },
    [locale],
  );

  if (!menuId) {
    return (
      <div className="py-20 text-center text-slate-500 dark:text-slate-400">
        <p>{t("noMenuId")}</p>
      </div>
    );
  }

  const textDir = locale === "ar" ? "rtl" : "ltr";
  const showEmpty = !loading && ads.length === 0;

  return (
    <>
      {maxAdsPerMenu >= 0 && (
        <div
          className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-100"
          dir={textDir}
        >
          {t("freePlanLimitBanner", { max: maxAdsPerMenu })}
          {!canAddAd && (
            <>
              {" "}
              <LinkTo
                href={`/dashboard/${menuId}/subscription`}
                className="font-semibold underline underline-offset-2"
              >
                {tMenus("upgradePlan")}
              </LinkTo>
            </>
          )}
        </div>
      )}
      <div
        id="onboarding-advertisements-header"
        className="dashboard-ads-header mb-4 flex flex-col gap-3 overflow-visible sm:flex-row sm:items-start sm:justify-between sm:gap-4 md:mb-6"
        dir={textDir}
      >
        <div className="min-w-0">
          <PageTitleWithHelp>
            <h1 className="text-xl font-bold text-slate-800 sm:text-2xl md:text-3xl dark:text-slate-100">
              {t("title")}
            </h1>
          </PageTitleWithHelp>
          <p className="mt-0.5 text-sm text-slate-500 md:mt-1 dark:text-slate-400">
            {t("description")}
          </p>
        </div>
        <button
          id="onboarding-advertisements-actions"
          type="button"
          onClick={handleAddClick}
          disabled={!canAddAd}
          title={!canAddAd ? t("freePlanLimitReached") : undefined}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:h-11 sm:px-5"
        >
          <IoAddCircleOutline className="text-lg" aria-hidden />
          {t("addButton")}
        </button>
      </div>

      {adAnalyticsDemo && (
        <DemoDataBanner message={t("demoDataBanner")} dir={textDir} />
      )}

      {showEmpty ? (
        <AdsEmptyState onAdd={canAddAd ? handleAddClick : undefined} />
      ) : (
        <>
          {ads.length > 0 && (
            <AdsStatsSection items={adSummaryMetrics} dir={textDir} />
          )}

          <div className="dashboard-ads-page min-w-0 mt-4 md:mt-6">
            <AdsCardGrid
              ads={ads}
              loading={loading}
              locale={locale}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              getTitle={getTitle}
              getContent={getContent}
              togglingId={togglingId}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          </div>
        </>
      )}

      {(showModal || editingAd) && menuId && (
        <AddAdvertisementModal
          menuId={menuId}
          ad={editingAd}
          onClose={closeModal}
          onRefresh={refreshList}
        />
      )}

      {deletingAd && (
        <DeleteAdvertisementConfirm
          ad={deletingAd}
          localeTitle={getTitle(deletingAd)}
          onClose={() => setDeletingAd(null)}
          onDeleted={refreshList}
        />
      )}
    </>
  );
}
