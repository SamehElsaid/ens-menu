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
  "primary" | "secondary" | "accent" | "ghost" | "inverse" | "inverseGhost";

export type SiteButtonSize = "sm" | "md" | "lg";

/**
 * One travel value across the whole vocabulary.
 *
 * The primary action carries a brand-coloured cast rather than a grey drop
 * shadow, so the light source in the page's palette is the thing lighting the
 * button. Hover deepens the fill and the cast together; the only movement is a
 * 1px press, which is feedback rather than decoration.
 */
const base =
  /* `group` so an arrow inside the label can respond to the button's own hover
     rather than needing its own listener or a wrapper. */
  "group inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-semibold " +
  "tracking-[-0.01em] " +
  "transition-[background-color,border-color,color,box-shadow,transform] " +
  "duration-(--dur-settle) ease-(--ease-settle) " +
  "disabled:pointer-events-none disabled:opacity-55 " +
  "motion-safe:active:translate-y-px";

const variants: Record<SiteButtonVariant, string> = {
  /** The light source. One per page — see DESIGN.md §3. */
  primary:
    "bg-site-action text-site-action-fg shadow-site-brand hover:bg-site-action-hover",
  secondary:
    "border border-site-line-strong bg-site-bg text-site-ink hover:border-site-brand hover:bg-site-brand-tint hover:text-site-brand-deep",
  /** The soft brand action: "see it live", secondary CTAs inside brand areas.
   *  Never the page's primary action. */
  accent:
    "border border-site-brand-line bg-site-brand-tint text-site-brand-deep hover:border-site-brand hover:bg-site-brand hover:text-white",
  ghost: "text-site-fg hover:bg-site-brand-tint hover:text-site-brand-deep",
  inverse: "bg-site-on-ink text-site-ink hover:bg-white",
  inverseGhost:
    "border border-site-on-ink-line bg-site-on-ink-raise text-site-on-ink hover:bg-white/12 hover:border-site-on-ink",
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
      className={siteButtonClasses({
        variant,
        size,
        block,
        className: cn("relative", className),
      })}
    >
      {loading ? (
        /* Over the label rather than beside it. A spinner added to the row
           widens the button, and a button that grows while a form is being
           submitted moves everything under it — on a sign-in panel that is the
           submit button jumping out from under the cursor. */
        <span className="absolute inset-0 grid place-items-center">
          <SiteSpinner />
        </span>
      ) : null}
      {/* Faded, not hidden: `visibility: hidden` would take the label out of the
          accessibility tree and leave the button unnamed for exactly as long as
          it is doing something. The inner flex repeats the button's own gap so
          wrapping the children changes nothing about how they sit. */}
      <span
        className={cn(
          "inline-flex items-center justify-center gap-2",
          loading && "opacity-0",
        )}
      >
        {children}
      </span>
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
