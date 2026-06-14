"use client";

import { useTranslations } from "next-intl";
import LinkTo from "@/components/Global/LinkTo";
import LoadImage from "@/components/ImageLoad";
import { Menu } from "@/types/Menu";
import {
  IoCalendarOutline,
  IoEllipseSharp,
  IoEyeOutline,
  IoGlobeOutline,
  IoPauseOutline,
  IoPlayOutline,
  IoRestaurant,
  IoSettingsOutline,
  IoTrashOutline,
} from "react-icons/io5";

export type MenuMobileCardProps = {
  menu: Menu;
  menuName: string;
  description?: string;
  locale: string;
  formatDate: (dateStr: string) => string;
  isFirst: boolean;
  togglingId: number | null;
  menuPublicUrl: string;
  dashboardPath: string;
  onToggleActive: (menu: Menu) => void;
  onDelete: (menu: Menu) => void;
};

export default function MenuMobileCard({
  menu,
  menuName,
  description,
  locale,
  formatDate,
  isFirst,
  togglingId,
  menuPublicUrl,
  dashboardPath,
  onToggleActive,
  onDelete,
}: MenuMobileCardProps) {
  const t = useTranslations("Menus");

  return (
    <article
      className={`dashboard-menu-card overflow-hidden rounded-2xl border bg-white shadow-[0_1px_8px_rgba(15,23,42,0.06)] dark:bg-slate-900 dark:shadow-[0_1px_12px_rgba(0,0,0,0.22)] ${
        menu.isActive
          ? "border-slate-200/90 dark:border-slate-700/80"
          : "border-amber-200/70 bg-slate-50/40 dark:border-amber-900/35 dark:bg-amber-950/10"
      }`}
    >
      <div className="p-3.5">
        <div className="mb-2.5 flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-row-reverse items-start gap-2.5 rtl:flex-row">
            <div className="min-w-0 flex-1 text-start">
              <h3
                className="truncate text-[15px] font-bold leading-tight text-slate-900 dark:text-slate-50"
                dir={locale === "ar" ? "rtl" : "ltr"}
                title={menuName}
              >
                {menuName}
              </h3>
              <span
                className={`mt-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  menu.isActive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-900/25 dark:text-amber-300"
                }`}
              >
                <IoEllipseSharp
                  className={`text-[5px] ${menu.isActive ? "text-emerald-500" : "text-amber-500"}`}
                  aria-hidden
                />
                {menu.isActive ? t("menuCard.active") : t("menuCard.paused")}
              </span>
            </div>

            <div className="dashboard-menu-card__thumb size-[52px] shrink-0 overflow-hidden rounded-xl border border-slate-200/80 bg-primary/5 ring-1 ring-white dark:border-slate-600 dark:bg-primary/15 dark:ring-slate-800">
              {menu.logo ? (
                <LoadImage
                  src={menu.logo}
                  alt={menuName}
                  className="size-full object-cover"
                  width={52}
                  height={52}
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <IoRestaurant className="text-xl text-primary" aria-hidden />
                </div>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onToggleActive(menu)}
              disabled={togglingId === menu.id}
              title={menu.isActive ? t("menuCard.pause") : t("menuCard.play")}
              aria-label={menu.isActive ? t("menuCard.pause") : t("menuCard.play")}
              className={`inline-flex size-8 items-center justify-center rounded-lg border transition-colors active:scale-95 disabled:opacity-50 ${
                menu.isActive
                  ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-900/20 dark:text-amber-300"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-900/20 dark:text-emerald-300"
              }`}
            >
              {togglingId === menu.id ? (
                <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : menu.isActive ? (
                <IoPauseOutline className="text-base" aria-hidden />
              ) : (
                <IoPlayOutline className="text-base" aria-hidden />
              )}
            </button>
            <button
              type="button"
              onClick={() => onDelete(menu)}
              title={t("deleteMenu")}
              aria-label={t("deleteMenu")}
              className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-red-800/60 dark:hover:bg-red-950/30 dark:hover:text-red-300"
            >
              <IoTrashOutline className="text-base" aria-hidden />
            </button>
          </div>
        </div>

        {description && (
          <p className="mb-2 line-clamp-1 text-start text-xs text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-start">
          {menu.createdAt && (
            <div className="min-w-0">
              <span className="mb-0.5 flex items-center gap-1 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                <IoCalendarOutline className="shrink-0 text-[11px]" aria-hidden />
                {t("menuCard.createdAt")}
              </span>
              <p className="truncate text-[11px] font-medium text-slate-600 dark:text-slate-300">
                {formatDate(menu.createdAt)}
              </p>
            </div>
          )}
          {menu.updatedAt && (
            <div className="min-w-0">
              <span className="mb-0.5 flex items-center gap-1 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                <IoCalendarOutline className="shrink-0 text-[11px] opacity-80" aria-hidden />
                {t("menuCard.updatedAt")}
              </span>
              <p className="truncate text-[11px] font-medium text-slate-600 dark:text-slate-300">
                {formatDate(menu.updatedAt)}
              </p>
            </div>
          )}
        </div>

        <div className="mt-2 flex min-w-0 items-center gap-1 text-start">
          <IoGlobeOutline
            className="shrink-0 text-xs text-slate-400 dark:text-slate-500"
            aria-hidden
          />
          <span
            className="truncate font-mono text-[11px] text-slate-500 dark:text-slate-400"
            dir="ltr"
            title={menuPublicUrl}
          >
            {menuPublicUrl}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          <LinkTo
            id={isFirst ? "onboarding-manage-menu" : undefined}
            href={dashboardPath}
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-semibold text-white transition-colors hover:bg-primary/90 active:scale-[0.98]"
          >
            <IoSettingsOutline className="text-sm" aria-hidden />
            {t("menuCard.manage")}
          </LinkTo>
          <a
            href={menuPublicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-primary/40 dark:hover:bg-primary/10 dark:hover:text-primary"
          >
            <IoEyeOutline className="text-sm" aria-hidden />
            {t("menuCard.preview")}
          </a>
        </div>
      </div>
    </article>
  );
}
