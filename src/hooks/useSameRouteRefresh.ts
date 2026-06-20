"use client";

import { useEffect } from "react";
import { SAME_ROUTE_REFRESH_EVENT } from "@/lib/safeNavigation";

export function useSameRouteRefresh(onRefresh: () => void) {
  useEffect(() => {
    const handleRefresh = () => {
      onRefresh();
    };

    window.addEventListener(SAME_ROUTE_REFRESH_EVENT, handleRefresh);
    return () =>
      window.removeEventListener(SAME_ROUTE_REFRESH_EVENT, handleRefresh);
  }, [onRefresh]);
}
