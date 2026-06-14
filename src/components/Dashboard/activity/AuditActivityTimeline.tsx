"use client";

import { useTranslations } from "next-intl";
import ViewTime from "@/shared/ViewTime";
import { IoPersonOutline } from "react-icons/io5";
import {
  getAuditVisual,
  resolveAuditCategory,
  resolveAuditDescription,
  resolveAuditTitle,
} from "@/lib/auditLogDisplay";
import type { MenuAuditLogEntry } from "@/types/menuAuditLog";

interface AuditActivityTimelineProps {
  entries: MenuAuditLogEntry[];
}

export default function AuditActivityTimeline({
  entries,
}: AuditActivityTimelineProps) {
  const t = useTranslations("menuActivityLog");

  return (
    <ol className="relative space-y-0">
      {entries.map((entry, idx) => {
        const visual = getAuditVisual(entry.actionType, entry.entityType);
        const Icon = visual.icon;
        const isLast = idx === entries.length - 1;
        const title = resolveAuditTitle(entry);
        const description = resolveAuditDescription(entry);
        const category = resolveAuditCategory(entry);
        const actor = entry.userName?.trim() || t("roles.other");

        return (
          <li key={entry.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                <Icon className="text-lg text-violet-600 dark:text-violet-400" />
              </span>
              {!isLast && (
                <div className="mt-2 flex-1 w-px min-h-8 bg-slate-200 dark:bg-slate-700" />
              )}
            </div>

            <article
              className={`flex-1 min-w-0 rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-sm dark:border-slate-700/70 dark:bg-slate-800/80 ${isLast ? "mb-0" : "mb-4"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
                  {title}
                </h3>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${visual.badgeClass}`}
                >
                  {t(`categories.${category}` as never)}
                </span>
              </div>

              {description && (
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {description}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <IoPersonOutline className="shrink-0 text-sm" />
                  {actor}
                </span>
                <time className="tabular-nums">
                  {entry.isUndated ? (
                    t("legacyDate")
                  ) : (
                    <ViewTime data={entry.createdAt} />
                  )}
                </time>
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
