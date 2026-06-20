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
    if (!segment || isFreePlan) {
      setAllEntries([]);
      return;
    }
    setLoading(true);
    try {
      const [tableRes, deliveryRes] = await Promise.all([
        axiosGet<ActivityCallsPayload>(
          `/menus/${segment}/activity-logs`,
          locale,
          undefined,
          { page: 1, limit: 50, channel: "table" },
          undefined,
          true,
        ),
        axiosGet<ActivityCallsPayload>(
          `/menus/${segment}/activity-logs`,
          locale,
          undefined,
          { page: 1, limit: 50, channel: "delivery" },
          undefined,
          true,
        ),
      ]);

      const tableEntries =
        tableRes.status && tableRes.data
          ? (tableRes.data.entries ?? tableRes.data.calls ?? [])
          : [];
      const deliveryEntries =
        deliveryRes.status && deliveryRes.data
          ? (deliveryRes.data.entries ?? deliveryRes.data.calls ?? [])
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

  useMenuActivitySocket(isFreePlan || !segment ? "" : segment, refresh);

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
