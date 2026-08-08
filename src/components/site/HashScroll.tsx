"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { scrollToHash } from "@/lib/siteHashNav";

/**
 * After a cross-page navigation to `/#section`, the App Router lands on `/`
 * and often skips the scroll. Run once the home page is up, and again whenever
 * the hash changes (back/forward).
 */
export function HashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;

    const go = () => {
      const id = window.location.hash.slice(1);
      if (!id) return;
      /* Wait a frame so section layout (and images) have settled. */
      requestAnimationFrame(() => {
        scrollToHash(id, { behavior: "smooth" });
      });
    };

    go();
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, [pathname]);

  return null;
}

export default HashScroll;
