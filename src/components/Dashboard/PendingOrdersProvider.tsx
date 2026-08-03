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
import { usePathname } from "@/i18n/navigation";
import { useDashboardMenus } from "@/hooks/useDashboardMenus";
import { useMenusActivitySocket } from "@/hooks/useMenuActivitySocket";
import { playNewOrderNotificationSound } from "@/lib/orderNotificationSound";
import { isPendingOrder, isDeliveryEntry } from "@/lib/tableOrders";
import type { ActivityCallsPayload, CallEntry } from "@/lib/tableOrders";

interface PendingOrdersContextValue {
  pendingTableCount: number;
  pendingDeliveryCount: number;
  /** Pending table orders the user has not opened the orders page for yet. */
  unseenTableCount: number;
  unseenDeliveryCount: number;
  pendingEntries: CallEntry[];
  loading: boolean;
  refresh: () => void;
  /** Marks every pending order as seen, zeroing the unseen badges. */
  markOrdersSeen: () => void;
}

const PendingOrdersContext = createContext<PendingOrdersContextValue>({
  pendingTableCount: 0,
  pendingDeliveryCount: 0,
  unseenTableCount: 0,
  unseenDeliveryCount: 0,
  pendingEntries: [],
  loading: false,
  refresh: () => {},
  markOrdersSeen: () => {},
});

const SEEN_ORDERS_STORAGE_KEY = "ensmenu:seen-order-ids";
const TABLE_ORDERS_PATH = "/dashboard/orders";
const DELIVERY_ORDERS_PATH = "/dashboard/delivery-orders";

function readSeenOrderIds(): string[] {
  try {
    const raw = window.localStorage.getItem(SEEN_ORDERS_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

function matchesPath(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

/** Entry ids are only unique per menu, and these lists span every menu. */
function entryKey(entry: CallEntry): string {
  return `${entry.menuId ?? ""}#${entry.id}`;
}

export function usePendingOrders(): PendingOrdersContextValue {
  return useContext(PendingOrdersContext);
}

/**
 * Pending-order badges are account-wide: they count open orders across every
 * menu the signed-in account can reach, not just the menu currently open.
 */
export function PendingOrdersProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const pathname = usePathname();
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
  const [loadedOnce, setLoadedOnce] = useState(false);

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
      setLoadedOnce(true);
    }
  }, [menuIds.length, locale, tableOrderingEnabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useMenusActivitySocket(liveNotificationsEnabled ? menuIds : [], refresh, {
    onNewOrder: playNewOrderNotificationSound,
  });

  const pendingEntries = useMemo(
    () => allEntries.filter(isPendingOrder),
    [allEntries],
  );
  const pendingTableEntries = pendingEntries.filter((e) => !isDeliveryEntry(e));
  const pendingDeliveryEntries = pendingEntries.filter(isDeliveryEntry);
  const pendingTableCount = pendingTableEntries.length;
  const pendingDeliveryCount = pendingDeliveryEntries.length;

  const [seenOrderIds, setSeenOrderIds] = useState<string[]>([]);
  const [seenHydrated, setSeenHydrated] = useState(false);

  useEffect(() => {
    setSeenOrderIds(readSeenOrderIds());
    setSeenHydrated(true);
  }, []);

  const viewedChannel: "table" | "delivery" | null = matchesPath(
    pathname,
    DELIVERY_ORDERS_PATH,
  )
    ? "delivery"
    : matchesPath(pathname, TABLE_ORDERS_PATH)
      ? "table"
      : null;

  const allPendingKeys = pendingEntries.map(entryKey).join("|");
  const viewedChannelKeys = (
    viewedChannel === "delivery" ? pendingDeliveryEntries : pendingTableEntries
  )
    .map(entryKey)
    .join("|");

  // Opening an orders page marks everything currently listed there as seen, so
  // its sidebar badge drops to zero until the next order arrives.
  useEffect(() => {
    if (!seenHydrated || !loadedOnce) return;

    const stillPending = new Set(allPendingKeys ? allPendingKeys.split("|") : []);
    const toMark =
      viewedChannel && viewedChannelKeys ? viewedChannelKeys.split("|") : [];

    setSeenOrderIds((prev) => {
      const kept = prev.filter((key) => stillPending.has(key));
      const merged = new Set(kept);
      toMark.forEach((key) => merged.add(key));
      if (merged.size === prev.length && kept.length === prev.length) return prev;
      return [...merged];
    });
  }, [
    seenHydrated,
    loadedOnce,
    viewedChannel,
    allPendingKeys,
    viewedChannelKeys,
  ]);

  useEffect(() => {
    if (!seenHydrated) return;
    try {
      window.localStorage.setItem(
        SEEN_ORDERS_STORAGE_KEY,
        JSON.stringify(seenOrderIds),
      );
    } catch {
      /* storage unavailable — badges just reset on reload */
    }
  }, [seenHydrated, seenOrderIds]);

  const markOrdersSeen = useCallback(() => {
    const keys = allPendingKeys ? allPendingKeys.split("|") : [];
    if (keys.length === 0) return;
    setSeenOrderIds((prev) => {
      const merged = new Set(prev);
      keys.forEach((key) => merged.add(key));
      if (merged.size === prev.length) return prev;
      return [...merged];
    });
  }, [allPendingKeys]);

  const seenSet = useMemo(() => new Set(seenOrderIds), [seenOrderIds]);
  const unseenTableCount = pendingTableEntries.filter(
    (e) => !seenSet.has(entryKey(e)),
  ).length;
  const unseenDeliveryCount = pendingDeliveryEntries.filter(
    (e) => !seenSet.has(entryKey(e)),
  ).length;

  return (
    <PendingOrdersContext.Provider
      value={{
        pendingTableCount,
        pendingDeliveryCount,
        unseenTableCount,
        unseenDeliveryCount,
        pendingEntries,
        loading,
        refresh,
        markOrdersSeen,
      }}
    >
      {children}
    </PendingOrdersContext.Provider>
  );
}
