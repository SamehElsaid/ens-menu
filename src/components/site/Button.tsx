import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SiteNavLink } from "./SiteNavLink";

/**
 * The public site's action vocabulary.
 *
 * Deliberately separate from `components/ui/Button`, which the dashboard owns
 * and which is sized for a 13px working tool. Editing that one to suit a
 * landing page would repaint every form in the product.
 */

export type SiteButtonVariant =
  "primary" | "secondary" | "ghost" | "inverse" | "inverseGhost";

export type SiteButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-semibold " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out " +
  "disabled:pointer-events-none disabled:opacity-55 " +
  "motion-safe:active:translate-y-px";

const variants: Record<SiteButtonVariant, string> = {
  primary:
    "bg-site-brand text-white shadow-site-brand hover:bg-site-brand-hover " +
    "motion-safe:hover:-translate-y-px",
  secondary:
    "border border-site-line-strong bg-site-bg text-site-ink hover:border-site-brand-line hover:bg-site-brand-tint hover:text-site-brand-deep",
  ghost: "text-site-fg hover:bg-site-tint hover:text-site-ink",
  inverse:
    "bg-white text-site-ink-bg hover:bg-white/90 motion-safe:hover:-translate-y-px",
  inverseGhost:
    "border border-site-on-ink-line bg-site-on-ink-raise text-white hover:bg-white/12",
};

const sizes: Record<SiteButtonSize, string> = {
  sm: "h-9 rounded-site-control px-3.5 text-site-xs",
  md: "h-11 rounded-site-control px-5 text-site-sm",
  lg: "h-13 rounded-site-control px-7 text-site-body",
};

export function siteButtonClasses({
  variant = "primary",
  size = "md",
  block,
  className,
}: {
  variant?: SiteButtonVariant;
  size?: SiteButtonSize;
  block?: boolean;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], block && "w-full", className);
}

type SiteButtonProps = ComponentProps<"button"> & {
  variant?: SiteButtonVariant;
  size?: SiteButtonSize;
  block?: boolean;
  /** Renders a spinner and blocks the click without changing the button's width. */
  loading?: boolean;
};

export function SiteButton({
  variant,
  size,
  block,
  loading,
  className,
  children,
  disabled,
  ...props
}: SiteButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={siteButtonClasses({ variant, size, block, className })}
    >
      {loading ? <SiteSpinner /> : null}
      {children}
    </button>
  );
}

type SiteButtonLinkProps = Omit<ComponentProps<typeof SiteNavLink>, "href"> & {
  href: string;
  variant?: SiteButtonVariant;
  size?: SiteButtonSize;
  block?: boolean;
  children: ReactNode;
};

export function SiteButtonLink({
  href,
  variant,
  size,
  block,
  className,
  children,
  ...props
}: SiteButtonLinkProps) {
  return (
    <SiteNavLink
      href={href}
      className={siteButtonClasses({ variant, size, block, className })}
      {...props}
    >
      {children}
    </SiteNavLink>
  );
}

/** External destinations (stores, WhatsApp, social) that must not go through
 *  the locale router. */
export function SiteAnchorButton({
  variant,
  size,
  block,
  className,
  children,
  ...props
}: ComponentProps<"a"> & {
  variant?: SiteButtonVariant;
  size?: SiteButtonSize;
  block?: boolean;
}) {
  return (
    <a
      className={siteButtonClasses({ variant, size, block, className })}
      {...props}
    >
      {children}
    </a>
  );
}

export function SiteSpinner({
  className,
  label,
}: {
  className?: string;
  /** Supply when the spinner is the only thing conveying that work is in
   *  progress; omit inside a button, whose own label already says it. */
  label?: string;
}) {
  return (
    <>
      <svg
        className={cn("size-4 animate-spin", className)}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2.5"
          opacity="0.25"
        />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      {label ? (
        <span role="status" className="sr-only">
          {label}
        </span>
      ) : null}
    </>
  );
}
