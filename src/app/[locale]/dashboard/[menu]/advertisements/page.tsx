"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { axiosGet } from "@/shared/axiosCall";
import DataTable from "@/components/Custom/DataTable";
import LoadImage from "@/components/ImageLoad";
import { Advertisement } from "@/types/Menu";
import {
  IoAddCircleOutline,
  IoCreateOutline,
  IoTrashOutline,
} from "react-icons/io5";
import AddAdvertisementModal from "@/components/Dashboard/AddAdvertisementModal";
import DeleteAdvertisementConfirm from "@/components/Dashboard/DeleteAdvertisementConfirm";
import { useAppSelector } from "@/store/hooks";
import LinkTo from "@/components/Global/LinkTo";

export default function AdvertisementsPage() {
  const locale = useLocale();
  const t = useTranslations("Advertisements.page");
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

  const userData = useAppSelector((state) => state.auth.data);
  const planId = (userData as { user?: { subscription?: { planId?: number } } })?.user?.subscription?.planId;
  const isFreePlan = planId === 1;

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
      }>(`/menus/${menuId}/ads?page=${page}&limit=10`, locale);

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

  const refreshList = useCallback(
    () => setRefreshing((v) => v + 1),
    []
  );

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingAd(null);
  }, []);

  const handleAddClick = () => {
    setEditingAd(null);
    setShowModal(true);
  };

  const getTitle = useCallback(
    (ad: Advertisement) => {
      if (locale === "ar") return ad.titleAr || ad.title || "";
      return ad.title || ad.titleAr || "";
    },
    [locale]
  );

  const getContent = useCallback(
    (ad: Advertisement) => {
      const full =
        locale === "ar"
          ? ad.contentAr || ad.content
          : ad.content || ad.contentAr;

      if (!full) return "—";
      return full.length > 120 ? `${full.slice(0, 117)}...` : full;
    },
    [locale]
  );

  const columnDefs = useMemo<ColDef<Advertisement>[]>(
    () => [
      {
        headerName: t("columns.image"),
        field: "imageUrl",
        width: 100,
        sortable: false,
        cellRenderer: (params: ICellRendererParams<Advertisement>) => {
          const ad = params.data;
          if (!ad) return null;
          const src = ad.imageUrl ?? (ad as { image?: string }).image ?? "";
          return (
            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
              {src ? (
                <LoadImage
                  src={src}
                  alt={getTitle(ad)}
                  className="w-full h-full object-cover"
                  width={48}
                  height={48}
                />
              ) : (
                <span className="text-slate-400 dark:text-slate-500 text-lg">—</span>
              )}
            </div>
          );
        },
      },
      {
        headerName: t("columns.title"),
        field: "title",
        flex: 1,
        minWidth: 160,
        cellRenderer: (params: ICellRendererParams<Advertisement>) => {
          const ad = params.data;
          if (!ad) return null;
          return (
            <span
              className="font-medium text-slate-800 dark:text-slate-100"
              dir={locale === "ar" ? "rtl" : "ltr"}
            >
              {getTitle(ad)}
            </span>
          );
        },
      },
      {
        headerName: t("columns.content"),
        field: "content",
        flex: 2,
        minWidth: 220,
        cellRenderer: (params: ICellRendererParams<Advertisement>) => {
          const ad = params.data;
          if (!ad) return null;
          return (
            <span
              className="text-slate-600 dark:text-slate-400"
              dir={locale === "ar" ? "rtl" : "ltr"}
            >
              {getContent(ad)}
            </span>
          );
        },
      },
      {
        headerName: t("columns.link"),
        field: "linkUrl",
        minWidth: 160,
        cellRenderer: (params: ICellRendererParams<Advertisement>) => {
          const ad = params.data;
          const link = ad?.linkUrl;
          if (!link) return <span className="text-slate-400 dark:text-slate-500">—</span>;
          const label = link.length > 40 ? `${link.slice(0, 37)}...` : link;
          return (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all"
            >
              {label}
            </a>
          );
        },
      },
      {
        headerName: t("columns.actions"),
        width: 120,
        sortable: false,
        pinned: locale === "ar" ? "left" : "right",
        cellRenderer: (params: ICellRendererParams<Advertisement>) => {
          const ad = params.data;
          if (!ad) return null;
          return (
            <div className="flex items-center gap-2 h-full">
              <button
                type="button"
                title={t("edit")}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingAd(ad);
                  setShowModal(true);
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
                  setDeletingAd(ad);
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
    [locale, getTitle, getContent, t]
  );

  if (isFreePlan) {
    const title =
      locale === "ar"
        ? "هذه الميزة متاحة للخطط المدفوعة فقط"
        : "This feature is available on paid plans only";
    const description =
      locale === "ar"
        ? "قم بالترقية للوصول إلى ميزة الإعلانات وإبراز عروضك لعملائك."
        : "Upgrade your plan to enable advertisements and highlight your offers.";
    const buttonLabel = locale === "ar" ? "ترقية الخطة" : "Upgrade plan";

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
          {title}
        </h1>
        <p className="max-w-md text-slate-500 dark:text-slate-400">{description}</p>
        <LinkTo
          href="/pricing"
          className="mt-4 inline-flex items-center justify-center gap-2 px-8 py-3 bg-linear-to-r from-primary to-primary/80 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {buttonLabel}
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

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{t("title")}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {t("description")}
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <IoAddCircleOutline className="text-xl" />
          {t("addButton")}
        </button>
      </div>

      <DataTable<Advertisement>
        rowData={ads}
        columnDefs={columnDefs}
        loading={loading}
        locale={locale}
        showRowNumbers
        pagination
        paginationPageSize={10}
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />

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

      <div className="pb-10" />
    </>
  );
}

