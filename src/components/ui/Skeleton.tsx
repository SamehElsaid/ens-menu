import { cn } from "@/lib/cn";

/**
 * Loading placeholder.
 *
 * Skeletons should mirror the shape of the content that replaces them so the
 * layout does not jump on arrival.
 */
export function Skeleton({
  className,
  rounded = "md",
}: {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full";
}) {
  return (
    <span
      className={cn(
        "ui-skeleton block",
        rounded === "sm" && "rounded",
        rounded === "md" && "rounded-md",
        rounded === "lg" && "rounded-xl",
        rounded === "full" && "rounded-full",
        className,
      )}
      aria-hidden
    />
  );
}

/** Multi-line text placeholder with a short final line, like real prose. */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <span className={cn("flex flex-col gap-2", className)} aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </span>
  );
}

/** Wraps a skeleton region so assistive tech hears one "loading" message. */
export function SkeletonRegion({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className} role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
