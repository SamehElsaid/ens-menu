"use client";

import { useTranslations } from "next-intl";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import { Badge, SearchInput, Toolbar } from "@/components/ui";

interface OrdersPageHeaderProps {
  translationNs: "tableOrders" | "deliveryOrders";
  pendingCount: number;
  id?: string;
}

export function OrdersPageHeader({
  translationNs,
  pendingCount,
  id,
}: OrdersPageHeaderProps) {
  const t = useTranslations(translationNs);
  return (
    <PageTitleWithHelp
      id={id}
      title={t("title")}
      description={t("subtitle")}
      meta={
        pendingCount > 0 ? (
          <Badge tone="warning">
            {t("pendingBadge", { count: pendingCount })}
          </Badge>
        ) : undefined
      }
    />
  );
}

interface OrdersSearchToolbarProps {
  translationNs: "tableOrders" | "deliveryOrders";
  value: string;
  onChange: (value: string) => void;
}

export function OrdersSearchToolbar({
  translationNs,
  value,
  onChange,
}: OrdersSearchToolbarProps) {
  const t = useTranslations(translationNs);
  return (
    <Toolbar
      search={
        <SearchInput
          value={value}
          onChange={onChange}
          placeholder={t("searchPlaceholder")}
          label={t("searchPlaceholder")}
        />
      }
    />
  );
}
