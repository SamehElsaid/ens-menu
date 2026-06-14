"use client";

import { useTranslations } from "next-intl";
import ViewTime from "@/shared/ViewTime";
import LinkTo from "@/components/Global/LinkTo";
import {
  getAuditVisual,
  resolveAuditCategory,
  resolveAuditTitle,
} from "@/lib/auditLogDisplay";
import type { MenuAuditLogEntry } from "@/types/menuAuditLog";
import {
  IoChevronForwardOutline,
  IoPersonOutline,
  IoTimeOutline,
} from "react-icons/io5";

interface RecentActivityListProps {
  entries: MenuAuditLogEntry[];
  loading: boolean;
  menuSlugOrId: string;
  isRTL: boolean;
}

function ActivityRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50/80 p-3 dark:bg-slate-700/50 animate-pulse">
      <div className="flex flex-1 items-center gap-3">
        <div className="h-8 w-8 shrink-0 rounded-lg bg-slate-200 dark:bg-slate-600" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 max-w-[220px] rounded-lg bg-slate-200 dark:bg-slate-600" />
          <div className="h-3 w-28 rounded-lg bg-slate-100 dark:bg-slate-700" />
        </div>
      </div>
      <div className="h-4 w-20 rounded-lg bg-slate-200 dark:bg-slate-600" />
    </div>
  );
}

export default function RecentActivityList({
  entries,
  loading,
  menuSlugOrId,
  isRTL,
}: RecentActivityListProps) {
  const t = useTranslations("menuOverview");

  if (loading) {
    return (
      <ul className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <li key={i}>
            <ActivityRowSkeleton />
          </li>
        ))}
      </ul>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500">
          <IoTimeOutline className="text-2xl" />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("noRecentActivity")}
        </p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          {t("activityHint")}
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {entries.map((entry, index) => {
        const visual = getAuditVisual(entry.actionType, entry.entityType);
        const Icon = visual.icon;
        const title = resolveAuditTitle(entry);
        const category = resolveAuditCategory(entry);

        return (
          <li
            key={entry.id}
            className={`flex items-center justify-between gap-4 rounded-xl border border-transparent bg-slate-50/80 p-3 transition-all duration-200 hover:border-slate-200 hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:border-slate-600 dark:hover:bg-slate-700 ${isRTL ? "flex-row-reverse" : ""}`}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <div
              className={`flex min-w-0 flex-1 items-start gap-3 ${isRTL ? "flex-row-reverse text-end" : ""}`}
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-600">
                <Icon className="text-base text-violet-600 dark:text-violet-400" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {title}
                </p>
                <div
                  className={`mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 ${isRTL ? "justify-end" : ""}`}
                >
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${visual.badgeClass}`}
                  >
                    {t(`activityCategories.${category}` as never)}
                  </span>
                  {entry.userName?.trim() && (
                    <span className="inline-flex items-center gap-1">
                      <IoPersonOutline className="shrink-0" />
                      {entry.userName.trim()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div
              className={`flex shrink-0 items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <span className="text-xs text-slate-500 dark:text-slate-400 md:text-sm">
                {entry.isUndated ? (
                  t("legacyDate")
                ) : (
                  <ViewTime data={entry.createdAt} />
                )}
              </span>
            </div>
          </li>
        );
      })}

      <li className="pt-2">
        <LinkTo
          href={`/dashboard/${menuSlugOrId}/history`}
          className={`inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline ${isRTL ? "flex-row-reverse" : ""}`}
        >
          {t("viewAllActivity")}
          <IoChevronForwardOutline
            className={`text-sm shrink-0 ${isRTL ? "rotate-180" : ""}`}
          />
        </LinkTo>
      </li>
    </ul>
  );
}
