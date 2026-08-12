"use client";

import { useTranslations } from "next-intl";
import { FiX } from "react-icons/fi";
import {
  Button,
  Field,
  Input,
  SegmentedControl,
  Select,
} from "@/components/ui";
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

export interface OrdersFilterMenu {
  id: number;
  label: string;
}

interface OrdersFiltersProps {
  translationNs: "tableOrders" | "deliveryOrders";
  dateFrom: string;
  dateTo: string;
  statusFilter: OrderStatusFilter;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onStatusFilterChange: (value: OrderStatusFilter) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  /** Account-level pages only: filter the aggregate down to a single menu. */
  menus?: OrdersFilterMenu[];
  menuFilter?: string;
  onMenuFilterChange?: (value: string) => void;
}

/**
 * The orders filter row.
 *
 * Three changes from the version this replaces, all of them about how many
 * decisions the row asks for at once:
 *
 *   * Status is a segmented control, not six pill buttons. Six options are
 *     mutually exclusive, and pills that only differ by fill colour do not say
 *     that — a segmented control does, in a third of the width.
 *   * The menu filter is a select. An account with eleven menus rendered eleven
 *     chips that wrapped over three lines and pushed the orders off-screen.
 *   * The dates are `Field` + `Input`, so their labels are ticket labels and the
 *     controls carry the same focus rule as every other control in the product.
 */
export default function OrdersFilters({
  translationNs,
  dateFrom,
  dateTo,
  statusFilter,
  onDateFromChange,
  onDateToChange,
  onStatusFilterChange,
  onClearFilters,
  hasActiveFilters,
  menus,
  menuFilter = "",
  onMenuFilterChange,
}: OrdersFiltersProps) {
  const t = useTranslations(translationNs);
  // A single menu needs no picker — the aggregate already is that menu.
  const showMenuFilter = Boolean(
    onMenuFilterChange && (menus?.length ?? 0) > 1,
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        {showMenuFilter ? (
          <Field
            label={t("filters.menu")}
            htmlFor={`${translationNs}-menu`}
            className="w-full sm:w-56"
          >
            <Select
              id={`${translationNs}-menu`}
              value={menuFilter}
              onChange={(e) => onMenuFilterChange?.(e.target.value)}
            >
              <option value="">{t("filters.menuAll")}</option>
              {menus?.map((menu) => (
                <option key={menu.id} value={String(menu.id)}>
                  {menu.label}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}

        <Field
          label={t("filters.dateFrom")}
          htmlFor={`${translationNs}-date-from`}
          className="w-38"
        >
          <Input
            id={`${translationNs}-date-from`}
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => onDateFromChange(e.target.value)}
          />
        </Field>

        <Field
          label={t("filters.dateTo")}
          htmlFor={`${translationNs}-date-to`}
          className="w-38"
        >
          <Input
            id={`${translationNs}-date-to`}
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => onDateToChange(e.target.value)}
          />
        </Field>

        {hasActiveFilters ? (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <FiX className="size-3.5" aria-hidden />
            {t("filters.clear")}
          </Button>
        ) : null}
      </div>

      <SegmentedControl
        label={t("filters.status")}
        value={statusFilter}
        onChange={onStatusFilterChange}
        options={STATUS_OPTIONS.map((status) => ({
          value: status,
          label:
            status === "all"
              ? t("filters.statusAll")
              : t(`orderStatus.${status}` as never),
        }))}
      />
    </div>
  );
}
