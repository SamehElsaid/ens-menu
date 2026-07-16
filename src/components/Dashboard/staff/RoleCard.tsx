"use client";

import { useTranslations } from "next-intl";
import type { MenuStaffRole } from "@/types/Menu";
import {
  IoCreateOutline,
  IoTrashOutline,
  IoShieldCheckmarkOutline,
  IoPeopleOutline,
  IoLockClosedOutline,
} from "react-icons/io5";

interface RoleCardProps {
  role: MenuStaffRole;
  locale: string;
  onEdit: (role: MenuStaffRole) => void;
  onDelete: (role: MenuStaffRole) => void;
}

const MAX_VISIBLE_PERMISSIONS = 6;

export default function RoleCard({
  role,
  locale,
  onEdit,
  onDelete,
}: RoleCardProps) {
  const t = useTranslations("Roles");
  const tRoot = useTranslations();
  const isRTL = locale === "ar";

  const canDelete = role.staffCount === 0;
  const visible = role.permissions.slice(0, MAX_VISIBLE_PERMISSIONS);
  const extraCount = role.permissions.length - visible.length;

  const permLabel = (key: string) => {
    try {
      return tRoot(
        `StaffPermissions.keys.${key}` as Parameters<typeof tRoot>[0],
      );
    } catch {
      return key;
    }
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:border-primary/25 hover:shadow-xl dark:border-slate-700/80 dark:bg-slate-800/95 dark:shadow-slate-950/20 dark:hover:border-primary/40 dark:hover:shadow-slate-950/40">
      <div className="relative bg-linear-to-br from-primary/10 via-violet-50/80 to-fuchsia-50/40 px-4 pb-5 pt-4 dark:from-primary/15 dark:via-slate-900 dark:to-violet-950/40">
        <div className={`absolute top-3 ${isRTL ? "left-3" : "right-3"}`}>
          {role.isDefault && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-sm">
              <IoShieldCheckmarkOutline className="text-xs" aria-hidden />
              {t("defaultBadge")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/75 text-xl text-white shadow-lg shadow-primary/25 ring-4 ring-white dark:ring-slate-800"
            aria-hidden
          >
            <IoShieldCheckmarkOutline />
          </div>
          <div className="min-w-0 flex-1">
            <h3
              className="truncate text-lg font-bold text-slate-900 dark:text-slate-50"
              title={role.name}
              dir={isRTL ? "rtl" : "ltr"}
            >
              {role.name}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              <IoPeopleOutline className="text-sm" aria-hidden />
              {t("staffCount", { count: role.staffCount })}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-3">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {t("permissionsLabel")} ({role.permissions.length})
          </p>
          {role.permissions.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {t("noPermissions")}
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {visible.map((key) => (
                <span
                  key={key}
                  className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-700/60 dark:text-slate-300"
                >
                  {permLabel(key)}
                </span>
              ))}
              {extraCount > 0 && (
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  +{extraCount}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => onEdit(role)}
            title={t("edit")}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary active:scale-[0.98] dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 dark:hover:border-primary/40 dark:hover:bg-primary/10 dark:hover:text-primary"
          >
            <IoCreateOutline className="text-base" aria-hidden />
            {t("edit")}
          </button>
          <button
            type="button"
            onClick={() => canDelete && onDelete(role)}
            disabled={!canDelete}
            title={canDelete ? t("delete") : t("deleteBlocked")}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all active:scale-[0.98] ${
              canDelete
                ? "border-red-200/80 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:border-red-800 dark:hover:bg-red-950/50"
                : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-500"
            }`}
          >
            {canDelete ? (
              <IoTrashOutline className="text-base" aria-hidden />
            ) : (
              <IoLockClosedOutline className="text-base" aria-hidden />
            )}
            {t("delete")}
          </button>
        </div>
      </div>
    </article>
  );
}
