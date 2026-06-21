"use client";

import { useEffect, useMemo, useRef } from "react";
import Cookies from "js-cookie";
import { io } from "socket.io-client";
import { decryptData } from "@/shared/encryption";
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

/** Subscribes to live menu activity updates (table orders, audit logs). */
export function useMenuActivitySocket(
  menuKey: string,
  onUpdate: () => void,
  options?: { onNewOrder?: () => void },
): void {
  const storeMenuId = useAppSelector((s) => s.menuData.menu?.id);
  const numericMenuId = useMemo(
    () => resolveNumericMenuId(menuKey, storeMenuId),
    [menuKey, storeMenuId],
  );

  const onUpdateRef = useRef(onUpdate);
  const onNewOrderRef = useRef(options?.onNewOrder);
  onUpdateRef.current = onUpdate;
  onNewOrderRef.current = options?.onNewOrder;

  useEffect(() => {
    if (numericMenuId <= 0) return;

    const origin = dashboardSocketOrigin();
    if (!origin) return;

    const authToken = Cookies.get("sub") ?? "";
    let token: string | undefined;
    try {
      token = (decryptData(authToken) as { token?: string })?.token;
    } catch {
      return;
    }
    if (!token) return;

    const socket = io(origin, {
      path: "/socket.io/",
      transports: ["websocket", "polling"],
    });

    const handleMenuEvent = (payload: { menuId?: number }) => {
      if (payload?.menuId !== numericMenuId) return;
      onUpdateRef.current();
    };

    const handleNewTableCall = (payload: {
      menuId?: number;
      status?: string;
    }) => {
      if (payload?.menuId !== numericMenuId) return;
      onUpdateRef.current();
      const status = String(payload?.status ?? "pending").toLowerCase();
      if (status === "pending") {
        onNewOrderRef.current?.();
      }
    };

    socket.emit(
      "dashboard:menu_subscribe",
      { token: `Bearer ${token}`, menuId: numericMenuId },
      () => {},
    );

    socket.on("menu:activity_updated", handleMenuEvent);
    socket.on("staff:table_call", handleNewTableCall);
    socket.on("staff:table_call_changed", handleMenuEvent);

    return () => {
      socket.off("menu:activity_updated", handleMenuEvent);
      socket.off("staff:table_call", handleNewTableCall);
      socket.off("staff:table_call_changed", handleMenuEvent);
      socket.disconnect();
    };
  }, [numericMenuId]);
}
