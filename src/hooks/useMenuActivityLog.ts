"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { fetchAggregatedMenuActivityLog } from "@/lib/menuActivityAggregator";
import type {
  ActivityLogLabels,
  FetchMenuActivityLogParams,
  MenuAuditLogEntry,
} from "@/types/menuAuditLog";

type UseMenuActivityLogOptions = FetchMenuActivityLogParams & {
  enabled?: boolean;
  /** When false, activity log skips Pro-only data sources (staff, tables, ads). */
  includeProSources?: boolean;
};

export function useMenuActivityLog(
  menuId: string | null | undefined,
  options: UseMenuActivityLogOptions = {},
) {
  const locale = useLocale();
  const t = useTranslations("menuActivityLog");
  const {
    page = 1,
    limit = 20,
    q,
    enabled = true,
    includeProSources = true,
  } = options;

  const labels = useMemo<ActivityLogLabels>(
    () => ({
      categoryCreated: (name) => t("actions.categoryCreated", { name }),
      categoryUpdated: (name) => t("actions.categoryUpdated", { name }),
      itemCreated: (name) => t("actions.itemCreated", { name }),
      itemUpdated: (name) => t("actions.itemUpdated", { name }),
      itemDeleted: (name) => t("actions.itemDeleted", { name }),
      categoryDeleted: (name) => t("actions.categoryDeleted", { name }),
      staffCreated: (name) => t("actions.staffCreated", { name }),
      tableCreated: (number) => t("actions.tableCreated", { number }),
      adCreated: (title) => t("actions.adCreated", { title }),
      adUpdated: (title) => t("actions.adUpdated", { title }),
      settingsUpdated: t("actions.settingsUpdated"),
    }),
    [t],
  );

  const [entries, setEntries] = useState<MenuAuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const refresh = useCallback(async () => {
    if (!menuId || !enabled) {
      setEntries([]);
      setTotalPages(1);
      setTotal(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const payload = await fetchAggregatedMenuActivityLog(
        menuId,
        locale,
        labels,
        { page, limit, q },
        { includeProSources },
      );
      setEntries(payload.entries);
      setTotalPages(payload.totalPages);
      setTotal(payload.total);
    } catch {
      setEntries([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [menuId, locale, labels, page, limit, q, enabled, includeProSources]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    entries,
    loading,
    totalPages,
    total,
    refresh,
  };
}
