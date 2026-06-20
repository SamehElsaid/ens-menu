"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { axiosGet } from "@/shared/axiosCall";
import { countPendingOrders } from "@/lib/tableOrders";
import { useMenuActivitySocket } from "@/hooks/useMenuActivitySocket";
import type { ActivityCallsPayload } from "@/lib/tableOrders";

export function usePendingOrdersCount(
  menuId: string | null | undefined,
  enabled = true,
  channel: "table" | "delivery" = "table",
): number {
  const locale = useLocale();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!menuId || !enabled) {
      setCount(0);
      return;
    }
    try {
      const result = await axiosGet<ActivityCallsPayload>(
        `/menus/${menuId}/activity-logs`,
        locale,
        undefined,
        { page: 1, limit: 50, channel },
        undefined,
        true,
      );
      if (result.status && result.data) {
        const entries = result.data.entries ?? result.data.calls ?? [];
        const pendingTotal =
          typeof result.data.total === "number" && result.data.total >= 0
            ? result.data.total
            : countPendingOrders(entries);
        setCount(pendingTotal);
        return;
      }
      setCount(0);
    } catch {
      setCount(0);
    }
  }, [menuId, locale, enabled, channel]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useMenuActivitySocket(enabled ? (menuId ?? "") : "", refresh);

  return count;
}
