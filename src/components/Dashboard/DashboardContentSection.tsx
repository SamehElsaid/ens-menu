import type { ReactNode } from "react";

/**
 * Content gutters for every console page — CONSOLE-REDESIGN.md §4, §5.
 *
 * This owns the horizontal inset and the outermost cap; `PageShell` narrows
 * further per page kind. Splitting it that way means a page that has not been
 * given a kind yet still gets correct gutters instead of running to the edge.
 *
 * The outer cap is deliberately generous. A ten-column ledger wants the room,
 * and every narrower measure is a page-level decision made inside.
 */
export function DashboardContentSection({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[110rem] px-4 py-4 sm:px-6 sm:py-5">
      {children}
    </div>
  );
}
