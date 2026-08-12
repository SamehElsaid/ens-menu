"use client";

import { Skeleton } from "@/components/ui";

interface MobileCardSkeletonProps {
  count?: number;
  variant?: "item" | "category" | "table";
}

/**
 * Placeholder for the phone lists.
 *
 * It mirrors the shape it stands in for — one ruled panel with divided rows and
 * an action strip per row — so the list does not reflow when the rows arrive.
 */
export default function MobileCardSkeleton({
  count = 4,
  variant = "item",
}: MobileCardSkeletonProps) {
  if (variant === "table") {
    return (
      <div
        className="dashboard-mobile-skeleton space-y-2.5 md:hidden"
        aria-hidden
      >
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-line bg-surface p-3.5"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-14" rounded="full" />
            </div>
            <Skeleton className="mx-auto mb-3 size-28" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((__, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="dashboard-mobile-skeleton md:hidden" aria-hidden>
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="divide-y divide-line">
          {Array.from({ length: count }).map((_, index) => (
            <div key={index}>
              <div className="flex items-start gap-3 p-3">
                <Skeleton className="size-18 shrink-0" />
                <div className="flex min-w-0 flex-1 flex-col gap-2 pt-0.5">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                  {variant === "item" ? (
                    <Skeleton className="h-5 w-1/4" />
                  ) : null}
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-line bg-surface-2/40 px-3 py-2">
                <Skeleton className="h-4 w-20" rounded="full" />
                <Skeleton className="h-8 w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
