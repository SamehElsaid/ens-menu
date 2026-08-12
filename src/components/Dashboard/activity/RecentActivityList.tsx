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
import { Badge, EmptyState, Skeleton, SkeletonRegion } from "@/components/ui";

interface RecentActivityListProps {
  entries: MenuAuditLogEntry[];
  loading: boolean;
  menuSlugOrId: string;
}

/* The ledger runs to the edges of the card it sits in, so its rules line up
   with the card's own header rule instead of floating inside the padding. */
const ledger = "-mx-3 divide-y divide-line border-y border-line sm:-mx-4";
const row =
  "grid gap-x-4 gap-y-1 px-3 py-2 sm:grid-cols-[8rem_minmax(0,1fr)] sm:px-4";

export default function RecentActivityList({
  entries,
  loading,
  menuSlugOrId,
}: RecentActivityListProps) {
  const t = useTranslations("menuOverview");

  if (loading) {
    return (
      <SkeletonRegion label={t("latestActivity")} className={ledger}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={row}>
            <Skeleton className="h-3 w-20" rounded="sm" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-2/3" rounded="sm" />
              <Skeleton className="h-3 w-24" rounded="sm" />
            </div>
          </div>
        ))}
      </SkeletonRegion>
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
    <>
      <ol className={ledger}>
        {entries.map((entry) => {
          const visual = getAuditVisual(entry.actionType, entry.entityType);
          const Icon = visual.icon;
          const title = resolveAuditTitle(entry);
          const category = resolveAuditCategory(entry);
          const actor = entry.userName?.trim();

          return (
            <li key={entry.id} className={row}>
              <time className="ui-label pt-px">
                {entry.isUndated ? (
                  t("legacyDate")
                ) : (
                  <ViewTime data={entry.createdAt} />
                )}
              </time>

              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="flex min-w-0 items-start gap-2 text-[13px] font-semibold text-fg">
                    <Icon
                      className="mt-0.5 size-3.5 shrink-0 text-fg-subtle"
                      aria-hidden
                    />
                    <span className="truncate">{title}</span>
                  </p>
                  <Badge tone="neutral">
                    {t(`activityCategories.${category}` as never)}
                  </Badge>
                </div>

                {actor ? (
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-fg-subtle">
                    <IoPersonOutline className="shrink-0" aria-hidden />
                    {actor}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      <LinkTo
        href={`/dashboard/${menuSlugOrId}/history`}
        className="mt-3 inline-flex items-center gap-1 rounded-sm text-[13px] font-medium text-brand transition-colors hover:text-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {t("viewAllActivity")}
        <IoChevronForwardOutline
          className="shrink-0 text-sm rtl:rotate-180"
          aria-hidden
        />
      </LinkTo>
    </>
  );
}
