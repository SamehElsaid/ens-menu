"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";
import {
  controlHeight,
  controlRadius,
  controlSquare,
  controlText,
  focusRing,
  settle,
  type ControlSize,
} from "./styles";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "subtle"
  | "danger"
  | "dangerGhost"
  | "link";

/**
 * A solid fill carries a one-pixel inner highlight along its top edge, which is
 * what stops a flat rectangle of colour from reading as a coloured div.
 */
const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-on-brand shadow-xs shadow-inset-highlight hover:bg-brand-hover active:bg-brand-active",
  secondary:
    "bg-surface text-fg border border-line-strong hover:bg-surface-2 active:bg-surface-3",
  ghost: "text-fg-muted hover:bg-surface-2 hover:text-fg active:bg-surface-3",
  subtle:
    "bg-brand-soft text-brand-soft-fg hover:bg-brand-soft-hover active:bg-brand-soft-hover",
  danger:
    "bg-danger text-white shadow-xs shadow-inset-highlight hover:bg-danger-hover active:bg-danger-hover",
  dangerGhost:
    "text-danger hover:bg-danger-soft active:bg-danger-soft border border-transparent hover:border-danger-line",
  link: "text-brand underline-offset-4 hover:underline p-0! h-auto!",
};

const paddingSize: Record<ControlSize, string> = {
  xs: "px-2 gap-1",
  sm: "px-2.5 gap-1.5",
  md: "px-3 gap-1.5",
  lg: "px-3.5 gap-2",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  iconOnly = false,
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ControlSize;
  iconOnly?: boolean;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap font-medium",
    settle,
    "disabled:pointer-events-none disabled:opacity-45",
    "motion-reduce:transition-none",
    focusRing,
    controlHeight[size],
    controlText[size],
    controlRadius[size],
    iconOnly ? cn(controlSquare[size], "p-0") : paddingSize[size],
    variants[variant],
    fullWidth && "w-full",
    className,
  );
}

type BaseProps = {
  variant?: ButtonVariant;
  size?: ControlSize;
  /** Renders a square control. Requires `aria-label`. */
  iconOnly?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  /** Leading icon — flips sides automatically under RTL via flex order. */
  startIcon?: ReactNode;
  endIcon?: ReactNode;
};

export type ButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color">;

/**
 * The one button in the product.
 *
 * Loading keeps the button's width so a row of controls never reflows, and
 * marks the control busy for assistive tech rather than only visually.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      iconOnly = false,
      fullWidth = false,
      loading = false,
      startIcon,
      endIcon,
      className,
      children,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          buttonClasses({ variant, size, iconOnly, fullWidth, className }),
          loading && "relative",
        )}
        {...props}
      >
        {loading ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <Spinner size={size === "xs" ? "xs" : "sm"} />
          </span>
        ) : null}
        <span
          className={cn(
            "inline-flex items-center justify-center",
            iconOnly ? "" : "gap-2",
            loading && "invisible",
          )}
        >
          {startIcon ? (
            <span className="shrink-0" aria-hidden>
              {startIcon}
            </span>
          ) : null}
          {children}
          {endIcon ? (
            <span className="shrink-0" aria-hidden>
              {endIcon}
            </span>
          ) : null}
        </span>
      </button>
    );
  },
);

export type ButtonLinkProps = BaseProps &
  Omit<React.ComponentProps<typeof Link>, "color"> & {
    /** Renders a plain anchor instead of the client router link. */
    external?: boolean;
  };

export function ButtonLink({
  variant = "primary",
  size = "md",
  iconOnly = false,
  fullWidth = false,
  startIcon,
  endIcon,
  className,
  children,
  external,
  href,
  ...props
}: ButtonLinkProps) {
  const content = (
    <>
      {startIcon ? (
        <span className="shrink-0" aria-hidden>
          {startIcon}
        </span>
      ) : null}
      {children}
      {endIcon ? (
        <span className="shrink-0" aria-hidden>
          {endIcon}
        </span>
      ) : null}
    </>
  );

  const classes = buttonClasses({
    variant,
    size,
    iconOnly,
    fullWidth,
    className,
  });

  if (external) {
    return (
      <a
        href={typeof href === "string" ? href : "#"}
        className={classes}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...props}>
      {content}
    </Link>
  );
}
