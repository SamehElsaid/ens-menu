"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { axiosGet } from "@/shared/axiosCall";
import { formatAdminDate } from "@/lib/fetchAdminAnalytics";
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  LoadingBlock,
  SectionHeader,
  StatCard,
  StatGrid,
  type DataColumn,
  type StatusTone,
} from "@/components/ui";
import type { UserOrder, UserOrdersResponse } from "@/types/AdminCustomer";

interface Props {
  userId: number;
  onSelectOrder?: (order: UserOrder) => void;
}

/** Payment states carry a tone, but the raw status text always stays visible. */
function orderStatusTone(status: string): StatusTone {
  switch (status.toLowerCase()) {
    case "paid":
    case "completed":
    case "success":
    case "active":
      return "success";
    case "pending":
    case "processing":
      return "warning";
    case "failed":
    case "rejected":
    case "cancelled":
    case "canceled":
    case "refunded":
      return "danger";
    default:
      return "neutral";
  }
}

export default function CustomerOrdersSection({
  userId,
  onSelectOrder,
}: Props) {
  const locale = useLocale();
  const t = useTranslations("adminUsers.userDetails.customerSections.orders");
  const [data, setData] = useState<UserOrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await axiosGet<UserOrdersResponse>(
        `/admin/users/${userId}/orders`,
        locale,
      );
      if (result.status && result.data) {
        setData(result.data);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, locale]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <Card padded="lg">
        <LoadingBlock label={t("loading")} />
      </Card>
    );
  }

  const stats = data?.stats;
  const orders = data?.orders ?? [];

  const columns: DataColumn<UserOrder>[] = [
    {
      id: "plan",
      header: t("plan"),
      cell: (order) => order.planName,
      primary: true,
    },
    {
      id: "status",
      header: t("status"),
      cell: (order) => (
        <Badge tone={orderStatusTone(order.status)} className="capitalize">
          {order.status}
        </Badge>
      ),
    },
    {
      id: "amount",
      header: t("amount"),
      cell: (order) => order.amount,
      numeric: true,
    },
    {
      id: "date",
      header: t("date"),
      cell: (order) => formatAdminDate(order.createdAt, locale),
    },
    {
      id: "actions",
      header: t("actions"),
      cell: (order) => (
        <Button variant="link" size="sm" onClick={() => onSelectOrder?.(order)}>
          {t("viewDetails")}
        </Button>
      ),
    },
  ];

  return (
    <Card padded="lg">
      <SectionHeader title={t("title")} className="mb-4" />

      <StatGrid columns={3} className="mb-6">
        <StatCard label={t("totalOrders")} value={stats?.totalOrders ?? 0} />
        <StatCard
          label={t("totalPaid")}
          value={
            stats?.totalPaid?.toLocaleString(
              locale === "ar" ? "ar-EG" : "en-US",
            ) ?? 0
          }
        />
        <StatCard
          label={t("lastOrder")}
          value={
            stats?.lastOrder
              ? formatAdminDate(stats.lastOrder.createdAt, locale)
              : "—"
          }
        />
      </StatGrid>

      <DataTable
        columns={columns}
        rows={orders}
        getRowKey={(order) => String(order.id)}
        caption={t("title")}
        empty={<EmptyState title={t("empty")} size="sm" />}
      />
    </Card>
  );
}
