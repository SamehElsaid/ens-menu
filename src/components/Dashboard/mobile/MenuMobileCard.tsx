"use client";

import { useTranslations } from "next-intl";
import LinkTo from "@/components/Global/LinkTo";
import LoadImage from "@/components/ImageLoad";

import { Menu } from "@/types/Menu";
import type { MenuGroupMeta } from "@/lib/menuDeliveryGroups";
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
  IoGitNetworkOutline,
  IoRemoveCircleOutline,
  IoCopyOutline,
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
  groupMeta: MenuGroupMeta;
  isNested?: boolean;
  onToggleActive: (menu: Menu) => void;
  onDelete: (menu: Menu) => void;
  onCopy?: (menu: Menu) => void;
  onAddToGroup?: (menu: Menu) => void;
  onRemoveFromGroup?: (menu: Menu) => void;
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
  groupMeta,
  isNested = false,
  onToggleActive,
  onDelete,
  onCopy,
  onAddToGroup,
  onRemoveFromGroup,
}: MenuMobileCardProps) {
  const t = useTranslations("Menus");

  return (
    <article
      className={`dashboard-menu-card overflow-hidden rounded-lg border bg-white shadow-[0_1px_8px_rgba(15,23,42,0.06)]  dark:shadow-[0_1px_12px_rgba(0,0,0,0.22)] ${
        isNested ? "rounded-lg shadow-none" : ""
      } ${
        groupMeta.inGroup || isNested
          ? "border-teal-200/70 dark:border-teal-800/40"
          : menu.isActive
            ? "border-line/90 dark:border-line/80"
            : "border-amber-200/70 bg-slate-50/40 dark:border-amber-900/35 dark:bg-amber-950/10"
      }`}
    >
      <div className={isNested ? "p-3" : "p-3.5"}>
        <div className="mb-2.5 flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-row-reverse items-start gap-2.5 rtl:flex-row">
            <div className="min-w-0 flex-1 text-start">
              <h3
                className="truncate text-[15px] font-bold leading-tight text-fg"
                dir={locale === "ar" ? "rtl" : "ltr"}
                title={menuName}
              >
                {menuName}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-1">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
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
            </div>

            <div className="dashboard-menu-card__thumb size-[52px] shrink-0 overflow-hidden rounded-lg border border-line/80 bg-primary/5 ring-1 ring-white dark:bg-primary/15 dark:ring-slate-800">
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
              aria-label={
                menu.isActive ? t("menuCard.pause") : t("menuCard.play")
              }
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
            {onCopy && (
              <button
                type="button"
                onClick={() => onCopy(menu)}
                title={t("menuCard.copyMenu")}
                aria-label={t("menuCard.copyMenu")}
                className="inline-flex size-8 items-center justify-center rounded-lg border border-line bg-slate-50 text-fg-subtle transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary active:scale-95 dark:hover:border-primary/40 dark:hover:bg-primary/15 dark:hover:text-primary"
              >
                <IoCopyOutline className="text-base" aria-hidden />
              </button>
            )}
            <button
              type="button"
              onClick={() => onDelete(menu)}
              title={t("deleteMenu")}
              aria-label={t("deleteMenu")}
              className="inline-flex size-8 items-center justify-center rounded-lg border border-line bg-slate-50 text-fg-subtle transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95 dark:hover:border-red-800/60 dark:hover:bg-red-950/30 dark:hover:text-red-300"
            >
              <IoTrashOutline className="text-base" aria-hidden />
            </button>
          </div>
        </div>

        {description && (
          <p className="mb-2 line-clamp-1 text-start text-xs text-fg-muted">
            {description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-start">
          {menu.createdAt && (
            <div className="min-w-0">
              <span className="mb-0.5 flex items-center gap-1 text-[10px] font-medium text-fg-subtle">
                <IoCalendarOutline
                  className="shrink-0 text-[11px]"
                  aria-hidden
                />
                {t("menuCard.createdAt")}
              </span>
              <p className="truncate text-[11px] font-medium text-fg-muted">
                {formatDate(menu.createdAt)}
              </p>
            </div>
          )}
          {menu.updatedAt && (
            <div className="min-w-0">
              <span className="mb-0.5 flex items-center gap-1 text-[10px] font-medium text-fg-subtle">
                <IoCalendarOutline
                  className="shrink-0 text-[11px] opacity-80"
                  aria-hidden
                />
                {t("menuCard.updatedAt")}
              </span>
              <p className="truncate text-[11px] font-medium text-fg-muted">
                {formatDate(menu.updatedAt)}
              </p>
            </div>
          )}
        </div>

        <div className="mt-2 flex min-w-0 items-center gap-1 text-start">
          <IoGlobeOutline
            className="shrink-0 text-xs text-fg-subtle"
            aria-hidden
          />
          <span
            className="truncate font-mono text-[11px] text-fg-muted"
            dir="ltr"
            title={menuPublicUrl}
          >
            {menuPublicUrl}
          </span>
        </div>

        <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3 dark:border-line">
          {!groupMeta.inGroup && onAddToGroup && (
            <button
              type="button"
              onClick={() => onAddToGroup(menu)}
              className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-linear-to-r from-teal-600 to-emerald-600 px-3 text-xs font-bold text-white shadow-sm transition active:scale-[0.98] dark:from-teal-700 dark:to-emerald-800"
            >
              <IoGitNetworkOutline className="text-sm" aria-hidden />
              {t("menuCard.addToGroup")}
            </button>
          )}
          {groupMeta.inGroup && onRemoveFromGroup && (
            <button
              type="button"
              onClick={() => onRemoveFromGroup(menu)}
              className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-amber-300/80 bg-linear-to-r from-amber-50 to-orange-50 px-3 text-xs font-bold text-amber-900 transition active:scale-[0.98] dark:border-amber-700/50 dark:from-amber-950/40 dark:to-orange-950/30 dark:text-amber-100"
            >
              <IoRemoveCircleOutline className="text-sm" aria-hidden />
              {t("menuCard.removeFromGroup")}
            </button>
          )}
          <div className="flex items-center gap-2">
            <LinkTo
              id={isFirst ? "onboarding-manage-menu" : undefined}
              href={dashboardPath}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-white transition-colors hover:bg-primary/90 active:scale-[0.98]"
            >
              <IoSettingsOutline className="text-sm" aria-hidden />
              {t("menuCard.manage")}
            </LinkTo>
            <a
              href={menuPublicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-fg-muted transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary active:scale-[0.98] dark:hover:border-primary/40 dark:hover:bg-primary/10 dark:hover:text-primary"
            >
              <IoEyeOutline className="text-sm" aria-hidden />
              {t("menuCard.preview")}
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
