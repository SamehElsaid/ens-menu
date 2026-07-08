"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useLocale } from "next-intl";
import { axiosGet } from "@/shared/axiosCall";
import { useAppSelector } from "@/store/hooks";
import { isFreePlanUser } from "@/lib/subscription";
import { useMenuActivitySocket } from "@/hooks/useMenuActivitySocket";
import { playNewOrderNotificationSound } from "@/lib/orderNotificationSound";
import { isPendingOrder, isDeliveryEntry } from "@/lib/tableOrders";
import type { ActivityCallsPayload, CallEntry } from "@/lib/tableOrders";

interface PendingOrdersContextValue {
  pendingTableCount: number;
  pendingDeliveryCount: number;
  pendingEntries: CallEntry[];
  loading: boolean;
  refresh: () => void;
}

const PendingOrdersContext = createContext<PendingOrdersContextValue>({
  pendingTableCount: 0,
  pendingDeliveryCount: 0,
  pendingEntries: [],
  loading: false,
  refresh: () => {},
});

export function usePendingOrders(): PendingOrdersContextValue {
  return useContext(PendingOrdersContext);
}

export function PendingOrdersProvider({
  segment,
  children,
}: {
  segment: string | null;
  children: ReactNode;
}) {
  const locale = useLocale();
  const userData = useAppSelector((s) => s.auth.data);
  const isFreePlan = !userData || isFreePlanUser(userData);

  const [allEntries, setAllEntries] = useState<CallEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!segment) {
      setAllEntries([]);
      return;
    }
    setLoading(true);
    try {
      const requests: Promise<ReturnType<typeof axiosGet<ActivityCallsPayload>>>[] =
        [
          axiosGet<ActivityCallsPayload>(
            `/menus/${segment}/activity-logs`,
            locale,
            undefined,
            { page: 1, limit: 50, channel: "delivery" },
            undefined,
            true,
          ),
        ];

      if (!isFreePlan) {
        requests.unshift(
          axiosGet<ActivityCallsPayload>(
            `/menus/${segment}/activity-logs`,
            locale,
            undefined,
            { page: 1, limit: 50, channel: "table" },
            undefined,
            true,
          ),
        );
      }

      const results = await Promise.all(requests);

      const tableEntries =
        !isFreePlan && results[0]?.status && results[0]?.data
          ? (results[0].data.entries ?? results[0].data.calls ?? [])
          : [];
      const deliveryResult = isFreePlan ? results[0] : results[1];
      const deliveryEntries =
        deliveryResult?.status && deliveryResult?.data
          ? (deliveryResult.data.entries ?? deliveryResult.data.calls ?? [])
          : [];

      setAllEntries([...tableEntries, ...deliveryEntries]);
    } catch {
      setAllEntries([]);
    } finally {
      setLoading(false);
    }
  }, [segment, locale, isFreePlan]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useMenuActivitySocket(!segment ? "" : segment, refresh, {
    onNewOrder: playNewOrderNotificationSound,
  });

  const pendingEntries = allEntries.filter(isPendingOrder);
  const pendingTableCount = pendingEntries.filter(
    (e) => !isDeliveryEntry(e),
  ).length;
  const pendingDeliveryCount = pendingEntries.filter(isDeliveryEntry).length;

  return (
    <PendingOrdersContext.Provider
      value={{
        pendingTableCount,
        pendingDeliveryCount,
        pendingEntries,
        loading,
        refresh,
      }}
    >
      {children}
    </PendingOrdersContext.Provider>
  );
}
