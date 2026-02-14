"use client";

import { useAppSelector } from "@/store/hooks";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import LinkTo from "@/components/Global/LinkTo";
import {
  IoListOutline,
  IoCheckmarkCircleOutline,
  IoLinkOutline,
  IoDownloadOutline,
  IoSettingsOutline,
  IoChevronForwardOutline,
  IoOpenOutline,
  IoEyeOutline,
} from "react-icons/io5";
import { FaChartLine } from "react-icons/fa";
import { BiCategory } from "react-icons/bi";
import { MdOutlineFastfood } from "react-icons/md";
import { FiSettings } from "react-icons/fi";
import { BsQrCode } from "react-icons/bs";
import { useEffect, useMemo, useState } from "react";
import { axiosGet } from "@/shared/axiosCall";
import type { Category, Item } from "@/types/Menu";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";

type ActivityEntry = {
  id: string;
  type: "product" | "category";
  name: string;
  date: string;
};

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-24 rounded-lg bg-slate-200" />
        <div className="h-7 w-12 rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}

function ActivityRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50/80 animate-pulse">
      <div className="flex items-center gap-3 flex-1">
        <div className="h-5 flex-1 max-w-[140px] rounded-lg bg-slate-200" />
        <div className="h-5 w-16 rounded-full bg-slate-200" />
      </div>
      <div className="h-4 w-28 rounded-lg bg-slate-200" />
    </div>
  );
}

export default function DashboardMenuPage() {
  const { menu, loading: menuLoading } = useAppSelector((state) => state.menuData);
  const locale = useLocale();
  const t = useTranslations("menuOverview");
  const params = useParams();
  const menuSlugOrId = typeof params.menu === "string" ? params.menu : (params.menu as string[])?.[0] ?? "";

  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [recentCategories, setRecentCategories] = useState<Category[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const menuUrl = menu?.slug
    ? `https://${menu.slug}${process.env.NEXT_PUBLIC_MENU_URL || ""}`.replace(/^https:\/\//, "https://")
    : "";
  const qrImageUrl = menuUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(menuUrl)}`
    : "";

  useEffect(() => {
    if (!menuSlugOrId) return;
    const fetchActivity = async () => {
      setActivityLoading(true);
      try {
        const [itemsRes, categoriesRes] = await Promise.all([
          axiosGet<{ items?: Item[] }>(`/menus/${menuSlugOrId}/items?page=1&limit=20`, locale),
          axiosGet<{ categories?: Category[] } | Category[]>(`/menus/${menuSlugOrId}/categories?page=1&limit=20`, locale),
        ]);
        if (itemsRes.status && itemsRes.data) {
          const list = (itemsRes.data as { items?: Item[] }).items ?? [];
          setRecentItems(list);
        }
        if (categoriesRes.status && categoriesRes.data) {
          const raw = categoriesRes.data as { categories?: Category[] };
          const list = Array.isArray(categoriesRes.data) ? categoriesRes.data : raw?.categories ?? [];
          setRecentCategories(list);
        }
      } catch {
        setRecentItems([]);
        setRecentCategories([]);
      } finally {
        setActivityLoading(false);
      }
    };
    fetchActivity();
  }, [menuSlugOrId, locale]);

  const latestActivity = useMemo<ActivityEntry[]>(() => {
    const dateLocale = locale === "ar" ? ar : enUS;
    const productEntries: ActivityEntry[] = recentItems.map((item) => ({
      id: `item-${item.id}`,
      type: "product",
      name: locale === "ar" ? item.nameAr || item.nameEn || "" : item.nameEn || item.nameAr || "",
      date: item.createdAt ? format(new Date(item.createdAt), "d MMMM yyyy", { locale: dateLocale }) : "",
    }));
    const categoryEntries: ActivityEntry[] = recentCategories.map((cat) => ({
      id: `cat-${cat.id}`,
      type: "category",
      name: locale === "ar" ? cat.nameAr || cat.nameEn || "" : cat.nameEn || cat.nameAr || "",
      date: cat.createdAt ? format(new Date(cat.createdAt), "d MMMM yyyy", { locale: dateLocale }) : "",
    }));
    const combined = [...productEntries, ...categoryEntries].filter((e) => e.date);
    combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return combined.slice(0, 10);
  }, [recentItems, recentCategories, locale]);

  const handleDownloadQr = () => {
    if (!qrImageUrl) return;
    const link = document.createElement("a");
    link.href = qrImageUrl;
    link.download = `menu-qr-${menu?.slug ?? "menu"}.png`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  };

  if (menuLoading || !menu) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="h-24 rounded-2xl bg-white border border-slate-100 shadow-sm p-6 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 rounded-2xl bg-white border border-slate-100 shadow-sm p-6 animate-pulse" />
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-white border border-slate-100 animate-pulse" />
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-2">
          <div className="h-6 w-40 rounded-lg bg-slate-200 animate-pulse mb-4" />
          {[1, 2, 3, 4, 5].map((i) => (
            <ActivityRowSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const menuName = locale === "ar" ? menu.nameAr : menu.nameEn;
  const isRTL = locale === "ar";
  const tabBase =
    "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 active:scale-[0.98]";
  const tabActive = "bg-primary text-white shadow-md shadow-primary/25";
  const tabInactive =
    "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 border border-transparent hover:border-slate-200";
  const tabViewMenu =
    "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/25 border border-emerald-400/30";

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title + subtitle + tabs */}
      <header className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
        
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1 tracking-tight">
          {menuName}
        </h1>
        <p className="text-slate-500 text-sm mb-6">{t("fullMenuManagement")}</p>

        <nav
          className={`flex flex-wrap gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
          aria-label={t("fullMenuManagement")}
        >
          <LinkTo
            href={`/dashboard/${menuSlugOrId}`}
            className={`${tabBase} ${tabActive}`}
          >
            <FaChartLine className="text-lg shrink-0" />
            {t("overview")}
          </LinkTo>
          <LinkTo
            href={`/dashboard/${menuSlugOrId}/categories`}
            className={`${tabBase} ${tabInactive}`}
          >
            <IoListOutline className="text-lg shrink-0" />
            {t("categories")}
          </LinkTo>
          <LinkTo
            href={`/dashboard/${menuSlugOrId}/items`}
            className={`${tabBase} ${tabInactive}`}
          >
            <MdOutlineFastfood className="text-lg shrink-0" />
            {t("products")}
          </LinkTo>
          <LinkTo
            href={`/dashboard/${menuSlugOrId}/settings`}
            className={`${tabBase} ${tabInactive}`}
          >
            <FiSettings className="text-lg shrink-0" />
            {t("settings")}
          </LinkTo>
          <a
            href={menuUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={`${tabBase} ${tabViewMenu}`}
          >
            <IoOpenOutline className="text-lg shrink-0" />
            {t("viewMenu")}
          </a>
        </nav>
      </header>

      {/* Stats cards */}
      <section className="grid grid-cols-1 sm:grid-cols-4 gap-4" aria-label="Menu statistics">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-md hover:border-primary/10 hover:-translate-y-0.5 group">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
            <BiCategory className="text-2xl" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-500 text-sm font-medium">{t("categoriesCount")}</p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">{menu.categoriesCount ?? 0}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-md hover:border-emerald-200 hover:-translate-y-0.5 group">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
            <IoCheckmarkCircleOutline className="text-2xl" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-500 text-sm font-medium">{t("activeItems")}</p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">{menu.activeItemsCount ?? 0}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-md hover:border-primary/10 hover:-translate-y-0.5 group">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
            <IoLinkOutline className="text-2xl" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-500 text-sm font-medium">{t("totalItems")}</p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">{menu.itemsCount ?? 0}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-md hover:border-red-500/10 hover:-translate-y-0.5 group">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
            <IoEyeOutline className="text-2xl" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-500 text-sm font-medium">{t("totalViews")}</p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">{menu.views ?? 0}</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QR code section */}
        <section
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 transition-all duration-200 hover:shadow-md hover:border-slate-200"
          aria-labelledby="qr-title"
        >
          <div className="flex items-center gap-2 mb-2">
            <BsQrCode className="text-primary text-xl shrink-0" aria-hidden />
            <h2 id="qr-title" className="text-lg font-semibold text-slate-900">
              {t("qrTitle")}
            </h2>
          </div>
          <p className="text-slate-500 text-sm mb-5">{t("qrDescription")}</p>
          {qrImageUrl ? (
            <div className="flex flex-col items-start gap-4">
              <div className="rounded-2xl border-2 border-slate-200 bg-white p-2 shadow-inner ring-1 ring-slate-100/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrImageUrl}
                  alt="Menu QR Code"
                  className="w-[200px] h-[200px] rounded-xl"
                />
              </div>
              <button
                type="button"
                onClick={handleDownloadQr}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
              >
                <IoDownloadOutline className="text-lg" />
                {t("downloadAsImage")}
              </button>
            </div>
          ) : (
            <div className="w-[200px] h-[200px] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 text-slate-400 text-sm">
              <BsQrCode className="text-3xl" />
              <span>{locale === "ar" ? "QR غير متاح" : "QR unavailable"}</span>
            </div>
          )}
        </section>

        {/* Quick action cards */}
        <div className="lg:col-span-2 space-y-4" role="list">
          <LinkTo
            href={menuUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            role="listitem"
            className="flex items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
          >
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-slate-900 mb-1 group-hover:text-slate-800">
                {t("generalPreview")}
              </h3>
              <p className="text-slate-500 text-sm">{t("generalPreviewDescription")}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 group-hover:scale-105 transition-all duration-200">
              <IoLinkOutline className="text-xl" />
            </div>
          </LinkTo>
          <LinkTo
            href={`/dashboard/${menuSlugOrId}/settings`}
            role="listitem"
            className="flex items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-primary/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
          >
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-slate-900 mb-1 group-hover:text-slate-800">
                {t("menuSettings")}
              </h3>
              <p className="text-slate-500 text-sm">{t("menuSettingsDescription")}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:scale-105 transition-all duration-200">
              <IoSettingsOutline className="text-xl" />
            </div>
          </LinkTo>
          <LinkTo
            href={`/dashboard/${menuSlugOrId}/items`}
            role="listitem"
            className="flex items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-primary/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
          >
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-slate-900 mb-1 group-hover:text-slate-800">
                {t("menuItems")}
              </h3>
              <p className="text-slate-500 text-sm">{t("menuItemsDescription")}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:scale-105 transition-all duration-200">
              <MdOutlineFastfood className="text-xl" />
            </div>
          </LinkTo>
        </div>
      </div>

      {/* Latest activity */}
      <section
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 transition-all duration-200 hover:shadow-md"
        aria-labelledby="activity-title"
      >
        <h2 id="activity-title" className="text-lg font-semibold text-slate-900 mb-4">
          {t("latestActivity")}
        </h2>
        {activityLoading ? (
          <ul className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <li key={i}>
                <ActivityRowSkeleton />
              </li>
            ))}
          </ul>
        ) : latestActivity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <IoListOutline className="text-2xl" />
            </div>
            <p className="text-slate-500 text-sm">
              {locale === "ar" ? "لا يوجد نشاط حديث." : "No recent activity."}
            </p>
            <p className="text-slate-400 text-xs mt-1">
              {locale === "ar" ? "ستظهر هنا عند إضافة عناصر أو تصنيفات." : "Activity will appear here when you add items or categories."}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {latestActivity.map((entry, index) => (
              <li
                key={entry.id}
                className={`flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all duration-200 ${isRTL ? "flex-row-reverse" : ""}`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className={`flex items-center gap-3 min-w-0 flex-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span className="font-medium text-slate-800 truncate">{entry.name || "—"}</span>
                  <span
                    className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
                      entry.type === "category"
                        ? "bg-primary/10 text-primary"
                        : "bg-slate-200/80 text-slate-600"
                    }`}
                  >
                    {entry.type === "product" ? t("product") : t("category")}
                  </span>
                </div>
                <div className={`flex items-center gap-3 shrink-0 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span className="text-slate-500 text-xs md:text-sm">{t("addedOn", { date: entry.date })}</span>
                  <LinkTo
                    href={
                      entry.type === "product"
                        ? `/dashboard/${menuSlugOrId}/items`
                        : `/dashboard/${menuSlugOrId}/categories`
                    }
                    className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 rounded"
                  >
                    {t("view")}
                    <IoChevronForwardOutline className={`text-sm shrink-0 ${isRTL ? "rotate-180" : ""}`} />
                  </LinkTo>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
