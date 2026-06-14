"use client";

interface MobileCardSkeletonProps {
  count?: number;
  variant?: "item" | "category" | "table";
}

export default function MobileCardSkeleton({
  count = 4,
  variant = "item",
}: MobileCardSkeletonProps) {
  if (variant === "item") {
    return (
      <div className="dashboard-mobile-skeleton space-y-2 md:hidden" aria-hidden>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/80"
          >
            <div className="dashboard-mobile-shimmer size-[4.5rem] shrink-0 rounded-2xl bg-slate-100 dark:bg-slate-700/60" />
            <div className="flex flex-1 flex-col justify-center gap-2 py-0.5">
              <div className="dashboard-mobile-shimmer h-4 w-3/4 rounded-md bg-slate-100 dark:bg-slate-700/60" />
              <div className="dashboard-mobile-shimmer h-3 w-1/3 rounded-md bg-slate-100 dark:bg-slate-700/60" />
              <div className="dashboard-mobile-shimmer h-5 w-1/4 rounded-md bg-slate-100 dark:bg-slate-700/60" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className="dashboard-mobile-skeleton space-y-2.5 md:hidden" aria-hidden>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-700 dark:bg-slate-800/80"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="dashboard-mobile-shimmer h-5 w-28 rounded-md bg-slate-100 dark:bg-slate-700/60" />
              <div className="dashboard-mobile-shimmer h-5 w-14 rounded-full bg-slate-100 dark:bg-slate-700/60" />
            </div>
            <div className="dashboard-mobile-shimmer mx-auto mb-3 size-28 rounded-xl bg-slate-100 dark:bg-slate-700/60" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((__, i) => (
                <div
                  key={i}
                  className="dashboard-mobile-shimmer h-10 rounded-xl bg-slate-100 dark:bg-slate-700/60"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="dashboard-mobile-skeleton space-y-2 md:hidden" aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/80"
        >
          <div className="dashboard-mobile-shimmer size-[4.5rem] shrink-0 rounded-2xl bg-slate-100 dark:bg-slate-700/60" />
          <div className="flex flex-1 flex-col justify-center gap-2 py-0.5">
            <div className="dashboard-mobile-shimmer h-4 w-2/3 rounded-md bg-slate-100 dark:bg-slate-700/60" />
            <div className="dashboard-mobile-shimmer h-8 w-24 rounded-xl bg-slate-100 dark:bg-slate-700/60" />
          </div>
        </div>
      ))}
    </div>
  );
}
