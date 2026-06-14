"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { axiosGet } from "@/shared/axiosCall";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import AddAdvertisementModal from "@/components/Dashboard/AddAdvertisementModal";
import DeleteAdvertisementConfirm from "@/components/Dashboard/DeleteAdvertisementConfirm";
import AdsStatsSection from "@/components/Dashboard/advertisements/AdsStatsSection";
import AdsCardGrid from "@/components/Dashboard/advertisements/AdsCardGrid";
import AdsEmptyState from "@/components/Dashboard/advertisements/AdsEmptyState";
import { useAppSelector } from "@/store/hooks";
import { isFreePlanUser } from "@/lib/subscription";
import LinkTo from "@/components/Global/LinkTo";
import { DemoDataBanner } from "@/components/Admin/AdminAnalyticsWidgets";
import { fetchMenuAnalytics } from "@/lib/fetchMenuAnalytics";
import { Advertisement } from "@/types/Menu";
import { IoAddCircleOutline } from "react-icons/io5";

export default function AdvertisementsPage() {
  const locale = useLocale();
  const t = useTranslations("Advertisements.page");
  const tAds = useTranslations("Advertisements");
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
  const [adAnalyticsDemo, setAdAnalyticsDemo] = useState(false);

  const userData = useAppSelector((state) => state.auth.data);
  const isFreePlan = !userData || isFreePlanUser(userData);

  const fetchAds = useCallback(async () => {
    if (!menuId || isFreePlan) return;
    try {
      setLoading(true);
      const result = await axiosGet<{
        success?: boolean;
        data?: {
          ads?: Advertisement[];
          pagination?: { totalPages?: number };
        };
      }>(`/menus/${menuId}/ads?page=${page}&limit=12`, locale);

      if (result.status && result.data) {
        const wrapper = result.data;
        const list = wrapper.data?.ads ?? [];
        setAds(list);

        const pages = wrapper.data?.pagination?.totalPages ?? 0;
        setTotalPages(pages);
      } else {
        setAds([]);
        setTotalPages(0);
      }
    } finally {
      setLoading(false);
    }
  }, [menuId, locale, page, isFreePlan]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds, refreshing]);

  useEffect(() => {
    if (!menuId || isFreePlan) return;
    void fetchMenuAnalytics(menuId, locale, "30d").then((data) => {
      setAdAnalyticsDemo(Boolean(data._isDemoData));
    });
  }, [menuId, locale, isFreePlan]);

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
    setEditingAd(null);
    setShowModal(true);
  }, []);

  const handleEdit = useCallback((ad: Advertisement) => {
    setEditingAd(ad);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback((ad: Advertisement) => {
    setDeletingAd(ad);
  }, []);

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

  if (isFreePlan) {
    return (
      <div
        id="onboarding-ads-upgrade"
        className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center md:min-h-[60vh] md:gap-4"
      >
        <PageTitleWithHelp className="justify-center">
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl md:text-3xl dark:text-slate-100">
            {tAds("freePlanTitle")}
          </h1>
        </PageTitleWithHelp>
        <p className="max-w-md text-sm text-slate-500 md:text-base dark:text-slate-400">
          {tAds("freePlanDescription")}
        </p>
        <LinkTo
          href={`/dashboard/${menuId}/subscription`}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-primary to-primary/80 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] md:mt-4 md:px-8"
        >
          {tMenus("upgradePlan")}
        </LinkTo>
      </div>
    );
  }

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
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] sm:h-11 sm:px-5"
        >
          <IoAddCircleOutline className="text-lg" aria-hidden />
          {t("addButton")}
        </button>
      </div>

      {adAnalyticsDemo && (
        <DemoDataBanner message={t("demoDataBanner")} dir={textDir} />
      )}

      {showEmpty ? (
        <AdsEmptyState onAdd={handleAddClick} />
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
              onEdit={handleEdit}
              onDelete={handleDelete}
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
