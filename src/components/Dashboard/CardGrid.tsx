"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Skeleton, SkeletonRegion } from "@/components/ui";

/**
 * The one column rhythm for every dashboard collection.
 *
 * Items, categories, tables, staff, roles, ads, ratings and orders each used
 * to tune their own breakpoints, so moving between pages changed the card
 * width for no reason. They all import this instead.
 */
export const cardGridClass = "grid gap-4 sm:grid-cols-2 xl:grid-cols-3";

export function CardGrid({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(cardGridClass, "items-stretch", className)} {...props}>
      {children}
    </div>
  );
}

/** Placeholder grid shaped like the cards it stands in for. */
export function CardGridSkeleton({
  count = 6,
  media = false,
  label,
  className,
}: {
  count?: number;
  /** Reserves the image area for collections whose cards lead with a photo. */
  media?: boolean;
  /** Announced once for the whole region. */
  label: string;
  className?: string;
}) {
  return (
    <SkeletonRegion label={label} className={cn(cardGridClass, className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-line bg-surface"
        >
          {media ? (
            <Skeleton className="aspect-[4/3] w-full" rounded="sm" />
          ) : null}
          <div className="flex flex-col gap-3 p-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
            <div className="flex gap-2 border-t border-line pt-3">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 flex-1" />
            </div>
          </div>
        </div>
      ))}
    </SkeletonRegion>
  );
}

/** Wraps a grid and its pager so every collection page has the same rhythm. */
export function CardGridSection({
  children,
  pagination,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { pagination?: ReactNode }) {
  return (
    <div className={cn("min-w-0", className)} {...props}>
      <CardGrid>{children}</CardGrid>
      {pagination}
    </div>
  );
}
