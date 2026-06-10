"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { axiosGet } from "@/shared/axiosCall";
import { formatAdminDate } from "@/lib/fetchAdminAnalytics";
import CardDashBoard from "@/components/Card/CardDashBoard";
import type { UserOrder, UserOrdersResponse } from "@/types/AdminCustomer";

interface Props {
  userId: number;
  onSelectOrder?: (order: UserOrder) => void;
}

export default function CustomerOrdersSection({ userId, onSelectOrder }: Props) {
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
      <CardDashBoard>
        <p className="text-slate-500">{t("loading")}</p>
      </CardDashBoard>
    );
  }

  const stats = data?.stats;
  const orders = data?.orders ?? [];

  return (
    <CardDashBoard>
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
        {t("title")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-blue-500/5 border border-blue-500/10 p-4">
          <p className="text-xs text-slate-500 mb-1">{t("totalOrders")}</p>
          <p className="text-2xl font-bold tabular-nums">{stats?.totalOrders ?? 0}</p>
        </div>
        <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-4">
          <p className="text-xs text-slate-500 mb-1">{t("totalPaid")}</p>
          <p className="text-2xl font-bold tabular-nums">
            {stats?.totalPaid?.toLocaleString(locale === "ar" ? "ar-EG" : "en-US") ?? 0}
          </p>
        </div>
        <div className="rounded-xl bg-slate-500/5 border border-slate-200 dark:border-slate-600 p-4">
          <p className="text-xs text-slate-500 mb-1">{t("lastOrder")}</p>
          <p className="text-sm font-semibold">
            {stats?.lastOrder
              ? formatAdminDate(stats.lastOrder.createdAt, locale)
              : "—"}
          </p>
        </div>
      </div>
      {orders.length === 0 ? (
        <p className="text-slate-500">{t("empty")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                <th className="py-2 text-start">{t("plan")}</th>
                <th className="py-2 text-start">{t("status")}</th>
                <th className="py-2 text-start">{t("amount")}</th>
                <th className="py-2 text-start">{t("date")}</th>
                <th className="py-2 text-start">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-2">{order.planName}</td>
                  <td className="py-2 capitalize">{order.status}</td>
                  <td className="py-2 tabular-nums">{order.amount}</td>
                  <td className="py-2">{formatAdminDate(order.createdAt, locale)}</td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => onSelectOrder?.(order)}
                      className="text-primary hover:underline text-xs font-semibold"
                    >
                      {t("viewDetails")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CardDashBoard>
  );
}
