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
  | "gradient"
  | "secondary"
  | "accent"
  | "ghost"
  | "subtle"
  | "danger"
  | "dangerGhost"
  | "link";

/**
 * The primary action is the brand.
 *
 * `#9035E8` carries white at 5.44:1, so the button is the literal brand hex
 * rather than a darkened stand-in — which is the whole reason this anchor
 * works as a product colour. It ships with `shadow-brand`: a purple-tinted
 * shadow, so the fill reads as a lit surface rather than as a coloured
 * rectangle. That one detail is the most premium thing in the system, which is
 * also why it is spent on exactly one control per view.
 *
 * `gradient` exists for hero and marketing CTAs only — DESIGN.md §3 caps the
 * budget at one gradient moment per page, and a dashboard is not one.
 *
 * `accent` is the same hue at tint strength and means "live / selected", so a
 * page can carry both without two things competing for "click here".
 */
const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-on-brand shadow-brand hover:bg-brand-hover hover:shadow-brand-lg active:bg-brand-active active:shadow-brand",
  gradient:
    "text-white shadow-brand bg-[image:var(--grad-brand)] hover:shadow-brand-lg active:shadow-brand",
  secondary:
    "bg-surface text-fg border border-line-control shadow-2xs hover:bg-surface-2 hover:border-fg-subtle active:bg-surface-3",
  accent:
    "bg-brand-soft text-brand-soft-fg hover:bg-brand-soft-hover active:bg-brand-soft-hover",
  ghost: "text-fg-muted hover:bg-surface-2 hover:text-fg active:bg-surface-3",
  subtle:
    "bg-brand-soft text-brand-soft-fg border border-brand-line hover:bg-brand-soft-hover active:bg-brand-soft-hover",
  danger:
    "bg-danger text-on-status shadow-2xs hover:bg-danger-hover active:bg-danger-hover",
  dangerGhost:
    "text-danger hover:bg-danger-soft active:bg-danger-soft border border-transparent hover:border-danger-line",
  link: "text-brand-soft-fg underline underline-offset-4 decoration-brand-line hover:decoration-current p-0! h-auto!",
};

const paddingSize: Record<ControlSize, string> = {
  xs: "px-2.5 gap-1",
  sm: "px-3 gap-1.5",
  md: "px-3.5 gap-1.5",
  lg: "px-4 gap-2",
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
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap font-semibold",
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
