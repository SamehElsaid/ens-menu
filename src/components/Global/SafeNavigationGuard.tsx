"use client";

import { usePathname } from "next/navigation";
import { stopHolyLoader } from "holy-loader";
import { useEffect } from "react";
import {
  cancelSameRouteNavigation,
  shouldBlockSameRouteClick,
} from "@/lib/safeNavigation";

/**
 * Global capture-phase guard: blocks same-route link clicks before HolyLoader
 * and client navigation run. Also stops the progress bar on route completion.
 */
export default function SafeNavigationGuard() {
  const pathname = usePathname();

  useEffect(() => {
    stopHolyLoader();
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a");
      if (!anchor) {
        return;
      }

      if (
        shouldBlockSameRouteClick(anchor, {
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          shiftKey: event.shiftKey,
          altKey: event.altKey,
        })
      ) {
        cancelSameRouteNavigation(event);
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}
