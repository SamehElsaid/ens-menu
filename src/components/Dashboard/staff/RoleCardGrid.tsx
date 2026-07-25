"use client";

import { useTranslations } from "next-intl";
import type { MenuStaffRole } from "@/types/Menu";
import RoleCard from "./RoleCard";
import { IoAddCircleOutline, IoShieldOutline } from "react-icons/io5";

function RoleCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/80"
      aria-hidden
    >
      <div className="dashboard-mobile-shimmer h-24 bg-primary/5 dark:bg-primary/10" />
      <div className="space-y-3 px-4 pb-4 pt-3">
        <div className="dashboard-mobile-shimmer h-4 w-1/3 rounded bg-slate-100 dark:bg-slate-700/60" />
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="dashboard-mobile-shimmer h-5 w-16 rounded-md bg-slate-100 dark:bg-slate-700/60"
            />
          ))}
        </div>
        <div className="flex gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
          <div className="dashboard-mobile-shimmer h-10 flex-1 rounded-xl bg-slate-100 dark:bg-slate-700/60" />
          <div className="dashboard-mobile-shimmer h-10 flex-1 rounded-xl bg-slate-100 dark:bg-slate-700/60" />
        </div>
      </div>
    </div>
  );
}

interface RoleCardGridProps {
  roles: MenuStaffRole[];
  loading: boolean;
  locale: string;
  onEdit: (role: MenuStaffRole) => void;
  onDelete: (role: MenuStaffRole) => void;
  onDuplicate: (role: MenuStaffRole) => void;
  onAdd: () => void;
}

export default function RoleCardGrid({
  roles,
  loading,
  locale,
  onEdit,
  onDelete,
  onDuplicate,
  onAdd,
}: RoleCardGridProps) {
  const t = useTranslations("Roles");

  if (loading) {
    return (
      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <RoleCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-800/40">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl text-primary">
          <IoShieldOutline aria-hidden />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {t("emptyTitle")}
          </h3>
          <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
            {t("emptyDescription")}
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98]"
        >
          <IoAddCircleOutline className="text-lg" aria-hidden />
          {t("addRole")}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
      {roles.map((role) => (
        <RoleCard
          key={role.id}
          role={role}
          locale={locale}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      ))}
    </div>
  );
}
