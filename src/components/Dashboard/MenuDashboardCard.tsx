"use client";

import LinkTo from "@/components/Global/LinkTo";
import LoadImage from "@/components/ImageLoad";

import { menuDashboardPath } from "@/lib/menuDashboardPath";
import type { MenuGroupMeta } from "@/lib/menuDeliveryGroups";
import type { Menu } from "@/types/Menu";
import {
  IoCalendarOutline,
  IoEllipseSharp,
  IoEyeOutline,
  IoGlobeOutline,
  IoOpenOutline,
  IoPauseOutline,
  IoPlayOutline,
  IoRestaurant,
  IoSettingsOutline,
  IoTrashOutline,
  IoGitNetworkOutline,
  IoRemoveCircleOutline,
} from "react-icons/io5";

export type MenuDashboardCardProps = {
  menu: Menu;
  menuName: string;
  description?: string;
  formatDate: (dateStr: string) => string;
  togglingId: number | null;
  menuPublicUrl: string;
  groupMeta: MenuGroupMeta;
  isNested?: boolean;
  manageLinkId?: string;
  labels: {
    active: string;
    paused: string;
    pause: string;
    play: string;
    deleteMenu: string;
    createdAt: string;
    updatedAt: string;
    manage: string;
    preview: string;
    addToGroup?: string;
    removeFromGroup?: string;
  };
  onToggleActive: (menu: Menu) => void;
  onDelete: (menu: Menu) => void;
  onAddToGroup?: (menu: Menu) => void;
  onRemoveFromGroup?: (menu: Menu) => void;
};

function cardShellClass(
  menu: Menu,
  groupMeta: MenuGroupMeta,
  isNested?: boolean,
): string {
  const base = isNested
    ? "bg-white flex flex-col dark:bg-slate-900 rounded-xl border overflow-hidden transition-all duration-200"
    : "bg-white flex flex-col dark:bg-slate-900 rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl dark:hover:shadow-slate-950/40";

  if (groupMeta.inGroup || isNested) {
    return `${base} border-teal-200/70 dark:border-teal-800/40 ${
      menu.isActive
        ? isNested
          ? "hover:border-teal-300/70 dark:hover:border-teal-700/50"
          : "hover:border-teal-300/80 dark:hover:border-teal-700/60"
        : "border-amber-100/80 dark:border-amber-900/40 bg-slate-50/30 dark:bg-amber-950/10"
    }`;
  }
  return `${base} ${
    menu.isActive
      ? "border-slate-100 dark:border-slate-800 hover:border-primary/20 dark:hover:border-primary/40"
      : "border-amber-100/80 dark:border-amber-900/40 bg-slate-50/30 dark:bg-amber-950/10"
  }`;
}

export default function MenuDashboardCard({
  menu,
  menuName,
  description,
  formatDate,
  togglingId,
  menuPublicUrl,
  groupMeta,
  isNested = false,
  manageLinkId,
  labels,
  onToggleActive,
  onDelete,
  onAddToGroup,
  onRemoveFromGroup,
}: MenuDashboardCardProps) {
  return (
    <div className={cardShellClass(menu, groupMeta, isNested)}>
      <div
        className={`flex grow flex-col ${isNested ? "p-4 pb-2" : "p-6 pb-3"}`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border shadow-sm ring-2 ring-white dark:ring-slate-800 ${
              groupMeta.inGroup
                ? "border-teal-200/80 bg-teal-50/80 dark:border-teal-800/50 dark:bg-teal-950/20"
                : "border-primary/10 bg-primary/5 dark:border-primary/25 dark:bg-primary/15"
            }`}
          >
            {menu.logo ? (
              <LoadImage
                src={menu.logo}
                alt={menuName}
                className="h-full w-full object-contain"
                width={64}
                height={64}
              />
            ) : (
              <IoRestaurant className="text-3xl text-primary" />
            )}
          </div>

          <div className="flex min-w-0 flex-1 grow flex-col">
            <h3 className="mb-1 truncate text-lg font-bold text-slate-800 dark:text-slate-100">
              {menuName}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                  menu.isActive
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                }`}
              >
                <IoEllipseSharp
                  className={`text-[8px] ${menu.isActive ? "text-green-800 dark:text-green-400" : "text-amber-500 dark:text-amber-400"}`}
                />
                {menu.isActive ? labels.active : labels.paused}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => onToggleActive(menu)}
              disabled={togglingId === menu.id}
              title={menu.isActive ? labels.pause : labels.play}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 ${
                menu.isActive
                  ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/35"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:bg-emerald-900/35"
              }`}
            >
              {togglingId === menu.id ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : menu.isActive ? (
                <>
                  <IoPauseOutline className="text-lg" />
                  <span className="hidden sm:inline">{labels.pause}</span>
                </>
              ) : (
                <>
                  <IoPlayOutline className="text-lg" />
                  <span className="hidden sm:inline">{labels.play}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => onDelete(menu)}
              title={labels.deleteMenu}
              className="flex h-[38px] w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-red-800 dark:hover:bg-red-900/30 dark:hover:text-red-300"
            >
              <IoTrashOutline className="text-lg" />
            </button>
          </div>
        </div>

        {description && (
          <p className="mt-3 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 dark:text-slate-300">
          {menu.createdAt && (
            <span className="flex items-center gap-1.5">
              <IoCalendarOutline className="shrink-0 text-sm" />
              {labels.createdAt}: {formatDate(menu.createdAt)}
            </span>
          )}
          {menu.updatedAt && (
            <span className="flex items-center gap-1.5">
              <IoCalendarOutline className="shrink-0 text-sm opacity-70" />
              {labels.updatedAt}: {formatDate(menu.updatedAt)}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-300">
          <IoGlobeOutline className="shrink-0 text-sm" />
          <span className="truncate font-mono" dir="ltr">
            {menuPublicUrl.replace(/^\/\//, "")}
          </span>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50">
        {!groupMeta.inGroup && onAddToGroup && labels.addToGroup && (
          <button
            type="button"
            onClick={() => onAddToGroup(menu)}
            className="flex w-full items-center justify-center gap-2 border-b border-teal-200/60 bg-linear-to-r from-teal-50/90 to-emerald-50/50 px-4 py-2.5 text-sm font-bold text-teal-800 transition hover:from-teal-100 hover:to-emerald-100 dark:border-teal-800/40 dark:from-teal-950/40 dark:to-emerald-950/20 dark:text-teal-100 dark:hover:from-teal-900/50"
          >
            <IoGitNetworkOutline className="text-base" />
            {labels.addToGroup}
          </button>
        )}
        {groupMeta.inGroup && onRemoveFromGroup && labels.removeFromGroup && (
          <button
            type="button"
            onClick={() => onRemoveFromGroup(menu)}
            className="flex w-full items-center justify-center gap-2 border-b border-amber-200/70 bg-linear-to-r from-amber-50/90 to-orange-50/40 px-4 py-2.5 text-sm font-bold text-amber-900 transition hover:from-amber-100 hover:to-orange-100 dark:border-amber-800/40 dark:from-amber-950/40 dark:to-orange-950/20 dark:text-amber-100 dark:hover:from-amber-900/50"
          >
            <IoRemoveCircleOutline className="text-base" />
            {labels.removeFromGroup}
          </button>
        )}
        <div className="flex items-center gap-2 px-4 py-3">
          <LinkTo
            id={manageLinkId}
            href={menuDashboardPath(menu)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary/90"
          >
            <IoSettingsOutline className="text-base" />
            {labels.manage}
          </LinkTo>
          <a
            href={menuPublicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary dark:border-slate-700 dark:text-slate-300 dark:hover:border-primary/50 dark:hover:bg-primary/15 dark:hover:text-primary"
          >
            <IoEyeOutline className="text-base" />
            {labels.preview}
            <IoOpenOutline className="text-xs" />
          </a>
        </div>
      </div>
    </div>
  );
}
