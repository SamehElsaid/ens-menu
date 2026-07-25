"use client";

import { useTranslations } from "next-intl";
import type { OrderStatus } from "@/lib/tableOrders";

export type OrderStatusFilter = "all" | OrderStatus;

const STATUS_OPTIONS: OrderStatusFilter[] = [
  "all",
  "pending",
  "confirmed",
  "prepared",
  "delivered",
  "cancelled",
];

type OrdersFiltersTheme = "violet" | "emerald";

export interface OrdersFilterMenu {
  id: number;
  label: string;
}

interface OrdersFiltersProps {
  translationNs: "tableOrders" | "deliveryOrders";
  theme: OrdersFiltersTheme;
  dateFrom: string;
  dateTo: string;
  statusFilter: OrderStatusFilter;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onStatusFilterChange: (value: OrderStatusFilter) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  isRTL: boolean;
  /** Account-level pages only: filter the aggregate down to a single menu. */
  menus?: OrdersFilterMenu[];
  menuFilter?: string;
  onMenuFilterChange?: (value: string) => void;
}

const themeClasses: Record<
  OrdersFiltersTheme,
  {
    dateInput: string;
    statusActive: string;
    statusIdle: string;
    clearBtn: string;
  }
> = {
  violet: {
    dateInput:
      "border-violet-200/90 bg-white/90 focus:border-violet-400 focus:ring-violet-500/35 dark:border-violet-500/30 dark:bg-slate-800/90 dark:focus:border-violet-400 dark:focus:ring-violet-400/25",
    statusActive: "bg-violet-600 text-white shadow-sm dark:bg-violet-500",
    statusIdle:
      "bg-white/80 text-slate-600 ring-1 ring-violet-200/80 hover:bg-violet-50 dark:bg-slate-800/80 dark:text-slate-300 dark:ring-violet-500/25 dark:hover:bg-violet-950/40",
    clearBtn:
      "text-violet-700 hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-violet-950/40",
  },
  emerald: {
    dateInput:
      "border-emerald-200/90 bg-white/90 focus:border-emerald-400 focus:ring-emerald-500/35 dark:border-emerald-500/30 dark:bg-slate-800/90 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/25",
    statusActive: "bg-emerald-600 text-white shadow-sm dark:bg-emerald-500",
    statusIdle:
      "bg-white/80 text-slate-600 ring-1 ring-emerald-200/80 hover:bg-emerald-50 dark:bg-slate-800/80 dark:text-slate-300 dark:ring-emerald-500/25 dark:hover:bg-emerald-950/40",
    clearBtn:
      "text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40",
  },
};

export default function OrdersFilters({
  translationNs,
  theme,
  dateFrom,
  dateTo,
  statusFilter,
  onDateFromChange,
  onDateToChange,
  onStatusFilterChange,
  onClearFilters,
  hasActiveFilters,
  isRTL,
  menus,
  menuFilter = "",
  onMenuFilterChange,
}: OrdersFiltersProps) {
  const t = useTranslations(translationNs);
  const styles = themeClasses[theme];
  // A single menu needs no picker — the aggregate already is that menu.
  const showMenuFilter = Boolean(onMenuFilterChange && (menus?.length ?? 0) > 1);

  return (
    <div className="mt-4 space-y-4 border-t border-white/60 pt-4 dark:border-slate-700/50">
      {showMenuFilter && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t("filters.menu")}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onMenuFilterChange?.("")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                menuFilter === "" ? styles.statusActive : styles.statusIdle
              }`}
            >
              {t("filters.menuAll")}
            </button>
            {menus?.map((menu) => (
              <button
                key={menu.id}
                type="button"
                onClick={() => onMenuFilterChange?.(String(menu.id))}
                className={`max-w-[14rem] truncate rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  menuFilter === String(menu.id)
                    ? styles.statusActive
                    : styles.statusIdle
                }`}
              >
                {menu.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${translationNs}-date-from`}
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            {t("filters.dateFrom")}
          </label>
          <input
            id={`${translationNs}-date-from`}
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => onDateFromChange(e.target.value)}
            className={`w-full rounded-xl border py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 dark:text-slate-100 ${styles.dateInput} ${isRTL ? "ps-3 pe-3" : "px-3"}`}
          />
        </div>
        <div>
          <label
            htmlFor={`${translationNs}-date-to`}
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            {t("filters.dateTo")}
          </label>
          <input
            id={`${translationNs}-date-to`}
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => onDateToChange(e.target.value)}
            className={`w-full rounded-xl border py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 dark:text-slate-100 ${styles.dateInput} ${isRTL ? "ps-3 pe-3" : "px-3"}`}
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t("filters.status")}
        </p>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onStatusFilterChange(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === status ? styles.statusActive : styles.statusIdle
              }`}
            >
              {status === "all"
                ? t("filters.statusAll")
                : t(`orderStatus.${status}` as never)}
            </button>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${styles.clearBtn}`}
        >
          {t("filters.clear")}
        </button>
      )}
    </div>
  );
}
