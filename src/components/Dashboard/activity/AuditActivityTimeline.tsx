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
import { Badge } from "@/components/ui";

interface AuditActivityTimelineProps {
  entries: MenuAuditLogEntry[];
}

/**
 * The audit log as a printed ledger.
 *
 * The previous version gave every entry its own shadowed card on a vertical
 * connector, which made a page of twenty entries into twenty objects to parse
 * and pushed the timestamp — the one column a reader actually scans down — to
 * the bottom of each card. Here the entries share one elevated panel with
 * divided rows: the time is the leading column, the action is the body, and a
 * page of activity can be read down the inline start edge in a single pass.
 */
export default function AuditActivityTimeline({
  entries,
}: AuditActivityTimelineProps) {
  const t = useTranslations("menuActivityLog");

  return (
    <ol className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
      {entries.map((entry) => {
        const visual = getAuditVisual(entry.actionType, entry.entityType);
        const Icon = visual.icon;
        const title = resolveAuditTitle(entry);
        const description = resolveAuditDescription(entry);
        const category = resolveAuditCategory(entry);
        const actor = entry.userName?.trim() || t("roles.other");

        return (
          <li
            key={entry.id}
            className="grid gap-x-4 gap-y-1.5 px-3 py-2.5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:px-4"
          >
            <time className="ui-label pt-px">
              {entry.isUndated ? (
                t("legacyDate")
              ) : (
                <ViewTime data={entry.createdAt} />
              )}
            </time>

            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className="flex min-w-0 items-start gap-2 text-[13px] font-semibold text-fg">
                  <Icon
                    className="mt-0.5 size-3.5 shrink-0 text-fg-subtle"
                    aria-hidden
                  />
                  <span className="min-w-0">{title}</span>
                </h3>
                <Badge tone="neutral">
                  {t(`categories.${category}` as never)}
                </Badge>
              </div>

              {description && (
                <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
                  {description}
                </p>
              )}

              <p className="mt-1 inline-flex items-center gap-1 text-xs text-fg-subtle">
                <IoPersonOutline className="shrink-0" aria-hidden />
                {actor}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
