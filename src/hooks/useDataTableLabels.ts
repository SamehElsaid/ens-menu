"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { DataTableLabels } from "@/components/ui";

/**
 * Translated labels for `DataTable`'s view and selection controls.
 *
 * `DataTable` lives in `ui/`, which is locale-agnostic and ships English
 * defaults so the twelve existing call sites keep compiling. Console pages take
 * their labels from here instead, so nothing user-facing depends on those
 * defaults.
 */
export function useDataTableLabels(): DataTableLabels {
  const t = useTranslations("Dashboard");

  return useMemo(
    () => ({
      columns: t("tableColumns"),
      density: t("tableDensity"),
      comfortable: t("tableDensityComfortable"),
      compact: t("tableDensityCompact"),
      selectAll: t("tableSelectAll"),
      selectRow: t("tableSelectRow"),
      clearSelection: t("tableClearSelection"),
      selectedCount: (n: number) => t("tableSelectedCount", { count: n }),
    }),
    [t],
  );
}
