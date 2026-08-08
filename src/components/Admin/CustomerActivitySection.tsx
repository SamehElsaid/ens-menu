"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { axiosGet } from "@/shared/axiosCall";
import { formatAdminDate } from "@/lib/fetchAdminAnalytics";
import {
  Card,
  EmptyState,
  LoadingBlock,
  SectionHeader,
  StatCard,
  StatGrid,
} from "@/components/ui";
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
    <Card padded="lg">
      <SectionHeader title={t("title")} className="mb-4" />
      {loading ? (
        <LoadingBlock label={t("loading")} />
      ) : (
        <>
          <StatGrid columns={3} className="mb-6">
            <StatCard
              label={t("lastLogin")}
              value={
                data?.lastLoginAt
                  ? formatAdminDate(data.lastLoginAt, locale)
                  : "—"
              }
            />
            <StatCard
              label={t("lastUpdate")}
              value={
                data?.lastAccountUpdate
                  ? formatAdminDate(data.lastAccountUpdate, locale)
                  : "—"
              }
            />
            <StatCard
              label={t("lastOrder")}
              value={
                data?.lastOrder
                  ? formatAdminDate(data.lastOrder.createdAt, locale)
                  : "—"
              }
            />
          </StatGrid>
          {data?.entries.length === 0 ? (
            <EmptyState title={t("empty")} size="sm" />
          ) : (
            <ul className="flex flex-col">
              {data?.entries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-wrap justify-between gap-2 border-b border-line py-2 text-sm last:border-b-0"
                >
                  <div>
                    <span className="font-semibold text-fg">
                      {actionLabel(entry.action)}
                    </span>
                    {entry.details && (
                      <span className="ms-2 text-fg-muted">{entry.details}</span>
                    )}
                    <span className="ms-2 text-fg-subtle">
                      · {entry.adminName}
                    </span>
                  </div>
                  <span className="text-fg-muted">
                    {formatAdminDate(entry.createdAt, locale)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Card>
  );
}
