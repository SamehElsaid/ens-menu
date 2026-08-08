import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

const padding = {
  none: "",
  sm: "p-2.5",
  md: "p-3 sm:p-4",
  lg: "p-4 sm:p-5",
} as const;

export type CardProps = HTMLAttributes<HTMLElement> & {
  /** `flat` uses a hairline, `raised` uses a shadow. Never both — one
   *  elevation signal per surface. */
  variant?: "flat" | "raised" | "ghost";
  padded?: keyof typeof padding;
  interactive?: boolean;
  as?: ElementType;
};

export function Card({
  variant = "flat",
  padded = "md",
  interactive = false,
  as: Tag = "div",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-xl bg-surface",
        variant === "flat" && "border border-line",
        variant === "raised" && "shadow-md",
        variant === "ghost" && "bg-surface-2",
        interactive &&
          "transition-[border-color,box-shadow,background-color] duration-[120ms] ease-out hover:border-line-strong hover:bg-surface-2/40",
        padding[padded],
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

/** Card title row with optional description and trailing actions. */
export function CardHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold tracking-[-0.011em] text-fg">
          {title}
        </h3>
        {description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-fg-muted">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-1.5">{actions}</div>
      ) : null}
    </div>
  );
}

/** Full-bleed divider inside a padded card. */
export function CardDivider({ className }: { className?: string }) {
  return (
    <hr
      className={cn("-mx-3 my-3 border-line sm:-mx-4", className)}
      aria-hidden
    />
  );
}
