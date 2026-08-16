"use client";

import { useEffect, useMemo, useRef } from "react";
import { io } from "socket.io-client";
import { dashboardSocketOrigin } from "@/lib/tableOrders";
import { useAppSelector } from "@/store/hooks";

function resolveNumericMenuId(
  menuKey: string,
  storeMenuId?: number | null,
): number {
  const parsed = parseInt(menuKey, 10);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  if (
    typeof storeMenuId === "number" &&
    Number.isFinite(storeMenuId) &&
    storeMenuId > 0
  ) {
    return storeMenuId;
  }
  return 0;
}

/**
 * Subscribes to live activity for several menus at once — the account-level
 * pages watch every menu the signed-in account may see, so a staff member with
 * grants on three menus gets updates from all three.
 *
 * The server broadcasts into one room per menu (`menu:{id}`), so we join each
 * room on the same socket.
 */
export function useMenusActivitySocket(
  menuIds: number[],
  onUpdate: () => void,
  options?: { onNewOrder?: () => void },
): void {
  const onUpdateRef = useRef(onUpdate);
  const onNewOrderRef = useRef(options?.onNewOrder);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
    onNewOrderRef.current = options?.onNewOrder;
  }, [onUpdate, options?.onNewOrder]);

  // Stable key so a new array identity per render does not resubscribe.
  const idsKey = useMemo(
    () =>
      [...new Set(menuIds)]
        .filter((id) => Number.isFinite(id) && id > 0)
        .sort((a, b) => a - b)
        .join(","),
    [menuIds],
  );

  useEffect(() => {
    if (!idsKey) return;
    const ids = idsKey.split(",").map(Number);

    const origin = dashboardSocketOrigin();
    if (!origin) return;

    const subscribed = new Set(ids);
    const socket = io(origin, {
      path: "/socket.io/",
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    const handleMenuEvent = (payload: { menuId?: number }) => {
      if (payload?.menuId == null || !subscribed.has(payload.menuId)) return;
      onUpdateRef.current();
    };

    const handleNewTableCall = (payload: {
      menuId?: number;
      status?: string;
    }) => {
      if (payload?.menuId == null || !subscribed.has(payload.menuId)) return;
      onUpdateRef.current();
      const status = String(payload?.status ?? "pending").toLowerCase();
      if (status === "pending") {
        onNewOrderRef.current?.();
      }
    };

    for (const menuId of ids) {
      socket.emit("dashboard:menu_subscribe", { menuId }, () => {});
    }

    socket.on("menu:activity_updated", handleMenuEvent);
    socket.on("staff:table_call", handleNewTableCall);
    socket.on("staff:table_call_changed", handleMenuEvent);

    return () => {
      socket.off("menu:activity_updated", handleMenuEvent);
      socket.off("staff:table_call", handleNewTableCall);
      socket.off("staff:table_call_changed", handleMenuEvent);
      socket.disconnect();
    };
  }, [idsKey]);
}

/** Single-menu variant used by the per-menu dashboard pages. */
export function useMenuActivitySocket(
  menuKey: string,
  onUpdate: () => void,
  options?: { onNewOrder?: () => void },
): void {
  const storeMenuId = useAppSelector((s) => s.menuData.menu?.id);
  const numericMenuId = resolveNumericMenuId(menuKey, storeMenuId);
  const menuIds = useMemo(
    () => (numericMenuId > 0 ? [numericMenuId] : []),
    [numericMenuId],
  );

  useMenusActivitySocket(menuIds, onUpdate, options);
}
