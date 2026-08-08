import type { ComponentProps, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Layout and content primitives for the public site.
 *
 * One rhythm governs the whole surface: sections own their vertical space,
 * containers own their horizontal space, and nothing inside either sets page
 * margins of its own. That is what keeps eleven pages feeling like one site.
 */

/* -------------------------------------------------------------------------- */
/* Layout                                                                      */
/* -------------------------------------------------------------------------- */

export function Container({
  className,
  width = "default",
  ...props
}: ComponentProps<"div"> & { width?: "default" | "narrow" | "wide" }) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-(--s-gutter)",
        width === "narrow" && "max-w-4xl",
        width === "default" && "max-w-(--s-max)",
        width === "wide" && "max-w-[86rem]",
        className,
      )}
      {...props}
    />
  );
}

export type SectionTone = "default" | "tint" | "warm" | "ink";

const sectionTones: Record<SectionTone, string> = {
  default: "bg-site-bg",
  tint: "bg-site-tint",
  warm: "bg-site-warm-bg",
  ink: "s-on-ink bg-site-ink-bg text-site-on-ink-body",
};

export function Section({
  tone = "default",
  size = "default",
  className,
  children,
  id,
  ...props
}: ComponentProps<"section"> & {
  tone?: SectionTone;
  size?: "default" | "lg" | "sm" | "none";
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative",
        /* Anchored sections sit under the fixed header; leave room so a hash
           jump does not hide the section title. */
        id && "scroll-mt-(--s-header-h)",
        sectionTones[tone],
        size === "default" && "py-(--s-section-y)",
        size === "lg" && "py-(--s-section-y-lg)",
        size === "sm" && "py-14 sm:py-16",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Type                                                                        */
/* -------------------------------------------------------------------------- */

export function Eyebrow({
  className,
  children,
  onInk,
}: {
  className?: string;
  children: ReactNode;
  onInk?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-site-xs font-semibold tracking-[0.08em] uppercase",
        onInk ? "text-white/60" : "text-site-brand",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn("h-px w-6", onInk ? "bg-white/30" : "bg-site-brand-line")}
      />
      {children}
    </span>
  );
}

/**
 * The standard section opener. `align` exists because a page that centres every
 * heading reads as a template; dense, list-like sections take the start-aligned
 * form instead.
 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "center",
  onInk,
  as: Tag = "h2",
  className,
  children,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  align?: "center" | "start";
  onInk?: boolean;
  as?: ElementType;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "s-reveal flex flex-col gap-4",
        align === "center"
          ? "mx-auto max-w-3xl items-center text-center"
          : "items-start text-start",
        className,
      )}
    >
      {eyebrow ? <Eyebrow onInk={onInk}>{eyebrow}</Eyebrow> : null}
      <Tag className="text-site-h2">{title}</Tag>
      {lead ? (
        <p
          className={cn(
            "max-w-2xl text-site-lead",
            onInk ? "text-site-on-ink-body" : "text-site-fg",
          )}
        >
          {lead}
        </p>
      ) : null}
      {children}
    </div>
  );
}

/** Long-form body copy: legal pages, knowledge-base articles, about. */
export function Prose({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "max-w-(--s-max-prose) text-site-body text-site-fg",
        "[&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-site-h3",
        "[&_h3]:mt-9 [&_h3]:mb-3 [&_h3]:text-site-h4",
        "[&_p]:mb-5",
        "[&_ul]:mb-5 [&_ul]:space-y-2 [&_ul]:ps-5 [&_ul]:list-disc",
        "[&_ol]:mb-5 [&_ol]:space-y-2 [&_ol]:ps-5 [&_ol]:list-decimal",
        "[&_li]:marker:text-site-brand",
        "[&_a]:text-site-brand [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-site-brand-hover",
        "[&_strong]:text-site-ink [&_strong]:font-semibold",
        className,
      )}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Surfaces                                                                    */
/* -------------------------------------------------------------------------- */

export function Card({
  className,
  tone = "default",
  interactive,
  ...props
}: ComponentProps<"div"> & {
  tone?: "default" | "tint" | "ink" | "outline";
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-site-card",
        tone === "default" &&
          "border border-site-line bg-site-bg shadow-site-sm",
        tone === "tint" && "bg-site-tint",
        tone === "outline" && "border border-site-line",
        tone === "ink" &&
          "s-on-ink border border-site-on-ink-line bg-site-on-ink-raise text-site-on-ink-body",
        interactive &&
          "transition-[transform,box-shadow,border-color] duration-200 ease-out hover:border-site-brand-line hover:shadow-site-lg motion-safe:hover:-translate-y-1",
        className,
      )}
      {...props}
    />
  );
}

export function Badge({
  className,
  tone = "brand",
  children,
}: {
  className?: string;
  tone?: "brand" | "warm" | "neutral" | "positive" | "onInk";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-site-xs font-semibold",
        tone === "brand" &&
          "bg-site-brand-tint text-site-brand-deep ring-1 ring-site-brand-line ring-inset",
        tone === "warm" && "bg-site-warm-tint text-site-warm",
        tone === "neutral" && "bg-site-tint text-site-fg",
        tone === "positive" && "bg-site-positive-tint text-site-positive",
        tone === "onInk" &&
          "bg-white/10 text-white ring-1 ring-white/15 ring-inset",
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Scroll reveal. Implemented with native scroll-driven animation in CSS, so
 * this renders nothing but a wrapper — no observer, no hydration cost, and
 * content is fully visible when the browser or the user opts out.
 */
export function Reveal({
  className,
  soft,
  stagger,
  ...props
}: ComponentProps<"div"> & { soft?: boolean; stagger?: boolean }) {
  return (
    <div
      className={cn(
        soft ? "s-reveal-soft" : "s-reveal",
        stagger && "s-stagger",
        className,
      )}
      {...props}
    />
  );
}

/** Applies the stagger ranges to direct children that each carry `s-reveal`. */
export function RevealGroup({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("s-stagger", className)} {...props} />;
}
