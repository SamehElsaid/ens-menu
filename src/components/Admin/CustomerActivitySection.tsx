"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { axiosGet } from "@/shared/axiosCall";
import { formatAdminDate } from "@/lib/fetchAdminAnalytics";
import CardDashBoard from "@/components/Card/CardDashBoard";
import type { UserActivityLogResponse } from "@/types/AdminCustomer";

interface Props {
  userId: number;
}

export default function CustomerActivitySection({ userId }: Props) {
  const locale = useLocale();
  const t = useTranslations("adminUsers.userDetails.customerSections.activity");
  const [data, setData] = useState<UserActivityLogResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await axiosGet<UserActivityLogResponse>(
        `/admin/users/${userId}/activity-log`,
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

  const actionLabel = (action: string) => {
    const key = `actions.${action}` as Parameters<typeof t>[0];
    try {
      return t(key);
    } catch {
      return action;
    }
  };

  return (
    <CardDashBoard>
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
        {t("title")}
      </h2>
      {loading ? (
        <p className="text-slate-500">{t("loading")}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl bg-slate-500/5 border p-4">
              <p className="text-xs text-slate-500 mb-1">{t("lastLogin")}</p>
              <p className="font-semibold">
                {data?.lastLoginAt
                  ? formatAdminDate(data.lastLoginAt, locale)
                  : "—"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-500/5 border p-4">
              <p className="text-xs text-slate-500 mb-1">{t("lastUpdate")}</p>
              <p className="font-semibold">
                {data?.lastAccountUpdate
                  ? formatAdminDate(data.lastAccountUpdate, locale)
                  : "—"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-500/5 border p-4">
              <p className="text-xs text-slate-500 mb-1">{t("lastOrder")}</p>
              <p className="font-semibold">
                {data?.lastOrder
                  ? formatAdminDate(data.lastOrder.createdAt, locale)
                  : "—"}
              </p>
            </div>
          </div>
          {data?.entries.length === 0 ? (
            <p className="text-slate-500">{t("empty")}</p>
          ) : (
            <div className="space-y-2">
              {data?.entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-wrap justify-between gap-2 py-2 border-b border-slate-100 dark:border-slate-800 text-sm"
                >
                  <div>
                    <span className="font-semibold">{actionLabel(entry.action)}</span>
                    {entry.details && (
                      <span className="text-slate-500 ms-2">{entry.details}</span>
                    )}
                    <span className="text-slate-400 ms-2">· {entry.adminName}</span>
                  </div>
                  <span className="text-slate-500">
                    {formatAdminDate(entry.createdAt, locale)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </CardDashBoard>
  );
}
