"use client";

import { useTranslations } from "next-intl";
import { MenuStaff } from "@/types/Menu";
import {
  getStaffInitials,
  isCashierRole,
  isWaiterRole,
} from "@/lib/staffDisplay";
import {
  IoCreateOutline,
  IoEllipseSharp,
  IoMailOutline,
  IoPauseOutline,
  IoPlayOutline,
  IoTrashOutline,
} from "react-icons/io5";

interface StaffCardProps {
  staff: MenuStaff;
  locale: string;
  togglingId: number | null;
  onEdit: (staff: MenuStaff) => void;
  onToggleActive: (staff: MenuStaff) => void;
  onDelete: (staff: MenuStaff) => void;
}

export default function StaffCard({
  staff,
  locale,
  togglingId,
  onEdit,
  onToggleActive,
  onDelete,
}: StaffCardProps) {
  const t = useTranslations("Staff");
  const active = staff.isActive;
  const isToggling = togglingId === staff.id;
  const isRTL = locale === "ar";
  const initials = getStaffInitials(staff.name);
  const email = staff.email?.trim() || t("emptyCell");

  const roleLabel = isCashierRole(staff.role)
    ? t("roleCashier")
    : isWaiterRole(staff.role)
      ? t("roleWaiter")
      : staff.role?.trim() || t("emptyCell");

  const roleBadgeClass = isCashierRole(staff.role)
    ? "bg-violet-500/90 text-white"
    : isWaiterRole(staff.role)
      ? "bg-primary/90 text-white"
      : "bg-slate-500/80 text-white";

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:shadow-xl dark:bg-slate-800/95 dark:shadow-slate-950/20 dark:hover:shadow-slate-950/40 ${
        active
          ? "border-slate-200/90 hover:border-primary/25 dark:border-slate-700/80 dark:hover:border-primary/40"
          : "border-amber-200/80 bg-slate-50/40 hover:border-amber-300/60 dark:border-amber-900/40 dark:bg-amber-950/10 dark:hover:border-amber-800/50"
      }`}
    >
      <div className="relative bg-linear-to-br from-primary/10 via-violet-50/80 to-fuchsia-50/40 px-4 pb-8 pt-4 dark:from-primary/15 dark:via-slate-900 dark:to-violet-950/40">
        <div
          className={`absolute top-3 ${isRTL ? "left-3" : "right-3"}`}
        >
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm ${
              active
                ? "bg-emerald-500/90 text-white"
                : "bg-amber-500/90 text-white"
            }`}
          >
            <IoEllipseSharp className="text-[7px]" aria-hidden />
            {active ? t("active") : t("inactive")}
          </span>
        </div>

        <div className="flex flex-col items-center gap-3 pt-2">
          <div
            className="flex size-18 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/75 text-xl font-bold text-white shadow-lg shadow-primary/25 ring-4 ring-white transition-transform duration-300 group-hover:scale-105 dark:ring-slate-800"
            aria-hidden
          >
            {initials}
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm ${roleBadgeClass}`}
          >
            {roleLabel}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 pb-4 -mt-4">
        <div className="rounded-xl border border-slate-100 bg-white px-3 py-3 shadow-sm dark:border-slate-700/80 dark:bg-slate-800/90">
          <h3
            className="truncate text-center text-lg font-bold text-slate-900 dark:text-slate-50"
            dir={isRTL ? "rtl" : "ltr"}
            title={staff.name}
          >
            {staff.name}
          </h3>

          <div className="mt-2.5 flex min-w-0 items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900/50">
            <IoMailOutline
              className="shrink-0 text-base text-slate-400 dark:text-slate-500"
              aria-hidden
            />
            <span
              className="min-w-0 truncate text-xs font-medium text-slate-600 dark:text-slate-300"
              dir="ltr"
              title={email}
            >
              {email}
            </span>
          </div>
        </div>

        <div className="mt-auto space-y-2 border-t border-slate-100 pt-3 dark:border-slate-700/80">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(staff)}
              title={t("edit")}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary active:scale-[0.98] dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 dark:hover:border-primary/40 dark:hover:bg-primary/10 dark:hover:text-primary"
            >
              <IoCreateOutline className="text-base" aria-hidden />
              {t("edit")}
            </button>
            <button
              type="button"
              onClick={() => onDelete(staff)}
              title={t("delete")}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200/80 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 transition-all hover:border-red-300 hover:bg-red-100 active:scale-[0.98] dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:border-red-800 dark:hover:bg-red-950/50"
            >
              <IoTrashOutline className="text-base" aria-hidden />
              {t("delete")}
            </button>
          </div>

          <button
            type="button"
            disabled={isToggling}
            onClick={() => onToggleActive(staff)}
            title={active ? t("disable") : t("enable")}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
              active
                ? "border border-amber-200/80 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800/50 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/35"
                : "border border-emerald-200/80 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800/50 dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:bg-emerald-900/35"
            }`}
          >
            {isToggling ? (
              <span
                className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden
              />
            ) : active ? (
              <IoPauseOutline className="text-base" aria-hidden />
            ) : (
              <IoPlayOutline className="text-base" aria-hidden />
            )}
            {active ? t("disable") : t("enable")}
          </button>
        </div>
      </div>
    </article>
  );
}
