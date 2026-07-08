"use client";

import { useTranslations } from "next-intl";
import { IoGitNetworkOutline, IoPeopleOutline, IoSettingsOutline } from "react-icons/io5";
import type { ReactNode } from "react";

type MenuDeliveryGroupPanelProps = {
  groupName: string;
  memberCount: number;
  menuCards: ReactNode;
  layout?: "desktop" | "mobile";
  onManageGroup?: () => void;
};

export default function MenuDeliveryGroupPanel({
  groupName,
  memberCount,
  menuCards,
  layout = "desktop",
  onManageGroup,
}: MenuDeliveryGroupPanelProps) {
  const t = useTranslations("Menus.menuCard");
  const isMobile = layout === "mobile";

  return (
    <section
      className={`overflow-hidden rounded-3xl border border-teal-200/80 bg-white shadow-md shadow-teal-500/5 ring-1 ring-teal-500/10 dark:border-teal-800/40 dark:bg-slate-900 dark:shadow-none dark:ring-teal-500/10 ${
        isMobile ? "col-span-full" : "col-span-full xl:col-span-2"
      }`}
      aria-label={groupName}
    >
      <div className="bg-linear-to-r from-teal-600 via-teal-600 to-emerald-600 px-4 py-3.5 dark:from-teal-900 dark:via-teal-900 dark:to-emerald-950">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <IoGitNetworkOutline className="text-lg text-white" aria-hidden />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-white">{groupName}</h3>
              <p className="flex items-center gap-1 text-xs font-medium text-teal-100/90">
                <IoPeopleOutline className="text-sm opacity-80" aria-hidden />
                {t("groupMemberCount", { count: memberCount })}
              </p>
            </div>
          </div>
          {onManageGroup && (
            <button
              type="button"
              onClick={onManageGroup}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-teal-800 shadow-sm transition hover:bg-teal-50 active:scale-[0.98] dark:bg-teal-950 dark:text-teal-100 dark:hover:bg-teal-900"
            >
              <IoSettingsOutline className="text-base" aria-hidden />
              {t("manageGroup")}
            </button>
          )}
        </div>
      </div>

      <div
        className={`bg-linear-to-b from-teal-50/30 to-white dark:from-teal-950/15 dark:to-slate-900 ${
          isMobile ? "flex flex-col gap-3 p-3" : "grid gap-4 p-4 md:grid-cols-2 md:p-5"
        }`}
      >
        {menuCards}
      </div>
    </section>
  );
}
