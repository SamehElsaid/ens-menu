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
import { Badge, EmptyState, Skeleton } from "@/components/ui";

interface RecentActivityListProps {
  entries: MenuAuditLogEntry[];
  loading: boolean;
  menuSlugOrId: string;
  isRTL: boolean;
}

function ActivityRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-2 p-3">
      <div className="flex flex-1 items-center gap-3">
        <Skeleton className="size-8 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 max-w-[220px]" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

export default function RecentActivityList({
  entries,
  loading,
  menuSlugOrId,
  isRTL: _isRTL,
}: RecentActivityListProps) {
  const t = useTranslations("menuOverview");

  if (loading) {
    return (
      <ul className="space-y-2" aria-busy="true">
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
      <EmptyState
        size="sm"
        icon={<IoTimeOutline />}
        title={t("noRecentActivity")}
        description={t("activityHint")}
      />
    );
  }

  return (
    <ul className="space-y-2">
      {entries.map((entry) => {
        const visual = getAuditVisual(entry.actionType, entry.entityType);
        const Icon = visual.icon;
        const title = resolveAuditTitle(entry);
        const category = resolveAuditCategory(entry);

        return (
          <li
            key={entry.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-transparent bg-surface-2/80 p-3 transition-colors duration-150 hover:border-line hover:bg-surface-2"
          >
            <div className="flex min-w-0 flex-1 items-start gap-3 text-start">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface text-brand shadow-xs ring-1 ring-line">
                <Icon className="text-base" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-fg">{title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-fg-muted">
                  <Badge tone="neutral" size="sm">
                    {t(`activityCategories.${category}` as never)}
                  </Badge>
                  {entry.userName?.trim() ? (
                    <span className="inline-flex items-center gap-1">
                      <IoPersonOutline className="shrink-0" aria-hidden />
                      {entry.userName.trim()}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <span className="text-xs text-fg-muted md:text-sm">
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
          className="inline-flex items-center gap-1 rounded-sm text-sm font-medium text-brand transition-colors hover:text-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {t("viewAllActivity")}
          <IoChevronForwardOutline
            className="shrink-0 text-sm rtl:rotate-180"
            aria-hidden
          />
        </LinkTo>
      </li>
    </ul>
  );
}
