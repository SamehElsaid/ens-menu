"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { io } from "socket.io-client";
import { decryptData } from "@/shared/encryption";
import { dashboardSocketOrigin } from "@/lib/tableOrders";

/** Subscribes to live menu activity updates (table orders, audit logs). */
export function useMenuActivitySocket(
  menuId: string,
  onUpdate: () => void,
): void {
  useEffect(() => {
    const mid = parseInt(menuId, 10);
    if (!Number.isFinite(mid) || mid <= 0) return;

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

    socket.emit(
      "dashboard:menu_subscribe",
      { token: `Bearer ${token}`, menuId: mid },
      () => {},
    );

    socket.on("menu:activity_updated", (payload: { menuId?: number }) => {
      if (payload?.menuId !== mid) return;
      onUpdate();
    });

    return () => {
      socket.disconnect();
    };
  }, [menuId, onUpdate]);
}
