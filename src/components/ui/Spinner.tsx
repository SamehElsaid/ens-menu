import { cn } from "@/lib/cn";

const sizes = {
  xs: "size-3 border-[1.5px]",
  sm: "size-4 border-2",
  md: "size-5 border-2",
  lg: "size-8 border-[3px]",
  xl: "size-12 border-4",
} as const;

export type SpinnerSize = keyof typeof sizes;

export function Spinner({
  size = "sm",
  className,
  label,
}: {
  size?: SpinnerSize;
  className?: string;
  /** Announce progress to screen readers. Omit inside an already-labelled control. */
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block shrink-0 animate-spin rounded-full border-current border-e-transparent align-[-0.125em]",
        sizes[size],
        className,
      )}
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}

/** Centred spinner for panel- and page-level waits. */
export function LoadingBlock({
  label,
  className,
  size = "lg",
}: {
  label?: string;
  className?: string;
  size?: SpinnerSize;
}) {
  return (
    <div
      className={cn(
        "flex min-h-40 w-full flex-col items-center justify-center gap-3",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Spinner size={size} className="text-brand" />
      {label ? <p className="text-sm text-fg-muted">{label}</p> : null}
    </div>
  );
}
