"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocale } from "next-intl";
import { axiosGet } from "@/shared/axiosCall";
import { useDashboardMenus } from "@/hooks/useDashboardMenus";
import { useMenusActivitySocket } from "@/hooks/useMenuActivitySocket";
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

/**
 * Pending-order badges are account-wide: they count open orders across every
 * menu the signed-in account can reach, not just the menu currently open.
 */
export function PendingOrdersProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const { menus } = useDashboardMenus();

  // Capabilities come from each menu owner's plan, so this also holds for a
  // staff member whose own account has no plan of its own.
  const tableOrderingEnabled = menus.some((m) => m.capabilities.tableOrderingQr);
  const liveNotificationsEnabled = menus.some(
    (m) => m.capabilities.liveOrderNotifications,
  );

  const menuIds = useMemo(() => menus.map((menu) => menu.id), [menus]);

  const [allEntries, setAllEntries] = useState<CallEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (menuIds.length === 0) {
      setAllEntries([]);
      return;
    }
    setLoading(true);
    try {
      const fetchChannel = (channel: "table" | "delivery") =>
        axiosGet<ActivityCallsPayload>(
          "/dashboard/orders",
          locale,
          undefined,
          { page: 1, limit: 50, channel },
          undefined,
          true,
        );

      const [tableRes, deliveryRes] = await Promise.all([
        tableOrderingEnabled ? fetchChannel("table") : Promise.resolve(null),
        fetchChannel("delivery"),
      ]);

      const readEntries = (
        res: Awaited<ReturnType<typeof fetchChannel>> | null,
      ): CallEntry[] =>
        res?.status && res.data ? (res.data.entries ?? res.data.calls ?? []) : [];

      setAllEntries([...readEntries(tableRes), ...readEntries(deliveryRes)]);
    } catch {
      setAllEntries([]);
    } finally {
      setLoading(false);
    }
  }, [menuIds.length, locale, tableOrderingEnabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useMenusActivitySocket(liveNotificationsEnabled ? menuIds : [], refresh, {
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
