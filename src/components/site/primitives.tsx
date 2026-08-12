import type { ComponentProps, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Layout and content primitives for the public site.
 *
 * One rhythm governs the whole surface: sections own their vertical space,
 * containers own their horizontal space, and nothing inside either sets page
 * margins of its own. That is what keeps eleven pages feeling like one site.
 *
 * The direction (DESIGN.md) adds a second rule on top of that: everything sits
 * on a 12-column grid, placed asymmetrically. `Grid` + `Col` are how a page
 * declares that placement instead of reaching for `grid-cols-2` and hoping.
 * The grid is no longer drawn — hairline column rules down every section read
 * as an engineering drawing rather than as premium software.
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
        "relative mx-auto w-full px-(--s-gutter)",
        width === "narrow" && "max-w-4xl",
        width === "default" && "max-w-(--s-max)",
        width === "wide" && "max-w-[86rem]",
        className,
      )}
      {...props}
    />
  );
}

export type SectionTone =
  | "default"
  | "panel"
  | "tint"
  | "warm"
  | "ink"
  | "brand";

const sectionTones: Record<SectionTone, string> = {
  /** The page ground. */
  default: "bg-site-ground",
  /** A white band, for a section that should read as a sheet on the page. */
  panel: "bg-site-bg",
  tint: "bg-site-tint",
  warm: "bg-site-warm-bg",
  /** A deep violet inversion band. The page's structural full stop. */
  ink: "s-on-ink s-grad-deep text-site-on-ink-body",
  /** The gradient moment. One per page — DESIGN.md §3. */
  brand: "s-on-ink s-grad text-white",
};

/**
 * A band of the page.
 *
 * `divided` puts a hairline at the top edge. Alternating background colours
 * alone leave two adjacent tinted sections looking like one; on a purple band
 * the rule would fight the gradient, so it is dropped there and the colour
 * change carries the separation on its own.
 */
export function Section({
  tone = "default",
  size = "default",
  divided = true,
  className,
  children,
  id,
  ...props
}: ComponentProps<"section"> & {
  tone?: SectionTone;
  size?: "default" | "lg" | "sm" | "none";
  divided?: boolean;
}) {
  const inverted = tone === "ink" || tone === "brand";
  return (
    <section
      id={id}
      className={cn(
        "relative isolate",
        /* Anchored sections sit under the fixed header; leave room so a hash
           jump does not hide the section title. */
        id && "scroll-mt-(--s-header-h)",
        sectionTones[tone],
        divided && !inverted && "border-t border-site-line",
        divided && tone === "ink" && "border-t border-site-on-ink-line",
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

/**
 * The 12-column grid.
 *
 * Declared as a primitive so a page cannot quietly invent a 5-column layout.
 * Even undrawn, a shared grid is what makes headings and cards on different
 * sections line up down the scroll.
 */
export function Grid({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("s-grid", className)} {...props} />;
}

const spanClass = {
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  7: "lg:col-span-7",
  8: "lg:col-span-8",
  9: "lg:col-span-9",
  12: "lg:col-span-12",
} as const;

const startClass = {
  1: "lg:col-start-1",
  2: "lg:col-start-2",
  4: "lg:col-start-4",
  5: "lg:col-start-5",
  6: "lg:col-start-6",
  7: "lg:col-start-7",
  8: "lg:col-start-8",
  9: "lg:col-start-9",
  10: "lg:col-start-10",
} as const;

/**
 * A cell in the grid. Full width below `lg`, then takes its declared span.
 *
 * The spans are the asymmetric ones by default. A `6/6` split is available but
 * rarely the better answer: an even split gives a section no reading order.
 */
export function Col({
  span = 12,
  start,
  className,
  ...props
}: ComponentProps<"div"> & {
  span?: keyof typeof spanClass;
  start?: keyof typeof startClass;
}) {
  return (
    <div
      className={cn(
        "col-span-full min-w-0",
        spanClass[span],
        start ? startClass[start] : undefined,
        className,
      )}
      {...props}
    />
  );
}

/**
 * Bento container. Children declare their own span via `BentoCell`.
 *
 * The skill's resolved pattern for this product was Bento Grid Showcase, and
 * the reason it fits is density: a venue owner comparing plans or scanning
 * features wants many claims visible at once, and a bento gives varied
 * emphasis without the page turning into a list of equal cards.
 */
export function Bento({
  className,
  as: Tag = "div",
  ...props
}: HTMLAttributes<HTMLElement> & { as?: "div" | "ul" | "ol" }) {
  return <Tag className={cn("s-bento", className)} {...props} />;
}

const bentoSpan = {
  3: "sm:col-span-3 lg:col-span-3",
  4: "sm:col-span-3 lg:col-span-4",
  6: "sm:col-span-3 lg:col-span-6",
  8: "sm:col-span-6 lg:col-span-8",
  12: "sm:col-span-6 lg:col-span-12",
} as const;

const bentoRow = {
  1: "",
  2: "lg:row-span-2",
} as const;

export function BentoCell({
  span = 4,
  rows = 1,
  className,
  as: Tag = "div",
  ...props
}: HTMLAttributes<HTMLElement> & {
  span?: keyof typeof bentoSpan;
  rows?: keyof typeof bentoRow;
  as?: "div" | "li";
}) {
  return (
    <Tag
      className={cn(
        "col-span-full min-w-0",
        bentoSpan[span],
        bentoRow[rows],
        className,
      )}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Type                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * The section label.
 *
 * Sans and sentence case, so it introduces a heading rather than competing with
 * it. It optionally takes an `index`, which prints as a brand-coloured `01`
 * ahead of the copy — enough of a sequence for a visitor to know how far
 * through a page's argument they are, without the whole label shouting.
 */
export function Ticket({
  className,
  children,
  index,
  onInk,
}: {
  className?: string;
  children?: ReactNode;
  index?: number;
  onInk?: boolean;
}) {
  return (
    <span
      className={cn(
        "s-ticket inline-flex items-center gap-2",
        onInk ? "text-site-on-ink-muted" : "text-site-muted",
        className,
      )}
    >
      {typeof index === "number" ? (
        <>
          <span
            className={onInk ? "text-site-brand-bright" : "text-site-brand"}
          >
            {String(index).padStart(2, "0")}
          </span>
          {/* The divider only exists to separate the number from a label. With
              no label it would be a hairline hanging off the end of the
              number. */}
          {children ? (
            <span
              aria-hidden
              className={cn(
                "h-3 w-px",
                onInk ? "bg-site-on-ink-line" : "bg-site-line-strong",
              )}
            />
          ) : null}
        </>
      ) : null}
      {children}
    </span>
  );
}

/** Kept as the previous name so existing call sites keep working. */
export const Eyebrow = Ticket;

/**
 * The brand pill.
 *
 * `Ticket` is the quiet label that introduces a section heading; this is the lit
 * one, for the top of a page and for a card that is being singled out. Keeping
 * them as two components is what stops every label on the site from arriving in
 * a purple capsule.
 */
export function Pill({
  children,
  className,
  icon,
}: {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span className={cn("s-eyebrow", className)}>
      {icon ? (
        <span aria-hidden className="flex items-center">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}

/**
 * The standard section opener.
 *
 * The default alignment is `start`. A page that centres every heading reads as
 * a template regardless of what the headings say, and start-aligned copy also
 * gives the eye a single left edge to return to down a long scroll. `center`
 * remains available for the one or two places a page genuinely wants to stop
 * and address the reader.
 */
export function SectionHeading({
  eyebrow,
  index,
  title,
  lead,
  align = "start",
  onInk,
  as: Tag = "h2",
  className,
  children,
}: {
  eyebrow?: ReactNode;
  index?: number;
  title: ReactNode;
  lead?: ReactNode;
  align?: "center" | "start";
  onInk?: boolean;
  /** Headings only. The level is a document-outline decision, so the type is the
   *  place to stop this becoming a `<div>`. */
  as?: "h1" | "h2" | "h3" | "h4";
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
      {/* A section can be numbered without being labelled: the index is part of
          the page's `01 → 05` sequence, and dropping it whenever there is no
          eyebrow copy would break the count the visitor is following. */}
      {eyebrow || index != null ? (
        <Ticket onInk={onInk} index={index}>
          {eyebrow}
        </Ticket>
      ) : null}
      <Tag className="text-site-h2 max-w-3xl">{title}</Tag>
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

/**
 * The interior page opener.
 *
 * Every page that is not the homepage used to build its own hero: the same
 * `-mt-header` section, the same eyebrow, the same centred-ish stack, each
 * copy-pasted and each drifting a little. They are now one component, which is
 * what makes eleven interior pages read as one site rather than as eleven
 * landing pages.
 *
 * Structurally it is an opener, not a hero: the title on the leading columns,
 * and the facts a visitor needs to orient — support hours, article count, plan
 * count, last updated — as a small definition list on the trailing ones. That
 * list is why this can replace a hero without leaving the page feeling empty:
 * it fills the rest of the grid with information instead of an illustration.
 * A faint brand wash sits behind it so the top of every interior page is lit
 * by the same source as the homepage.
 */
export function PageHeader({
  ticket,
  index,
  title,
  lead,
  meta,
  actions,
  children,
  measure = "wide",
}: {
  ticket?: ReactNode;
  index?: number;
  title: ReactNode;
  lead?: ReactNode;
  /** The ruled stub on the trailing columns. Omit for a text-only opener. */
  meta?: { label: ReactNode; value: ReactNode }[];
  actions?: ReactNode;
  children?: ReactNode;
  /** `narrow` keeps the title on the reading measure, for article-like pages. */
  measure?: "wide" | "narrow";
}) {
  return (
    <section className="relative isolate -mt-(--s-header-h) border-b border-site-line bg-site-ground">
      <div aria-hidden className="s-aurora" />
      <Container className="pt-[calc(var(--s-header-h)+3rem)] pb-14 lg:pt-[calc(var(--s-header-h)+4.5rem)] lg:pb-16">
        <Grid className="gap-y-10">
          {/* Every marketing page opens the same way, and it opens on a clock
              rather than on scroll: this block is above the fold on all of them,
              where a `view()` timeline resolves straight to its end state and
              nothing would move. Order is the reading order — label, claim,
              argument, then the action and the facts together.

              The `h1` takes the transform-only variant because on these
              text-only openers it *is* the LCP element, and a fade would put its
              own duration onto the metric. */}
          <Col span={measure === "narrow" ? 7 : 8}>
            {ticket ? (
              <Ticket index={index} className="s-enter-soft">
                {ticket}
              </Ticket>
            ) : null}
            <h1 className="s-enter-still mt-5 text-site-h1">{title}</h1>
            {lead ? (
              <p className="s-enter s-enter-d1 mt-6 max-w-2xl text-site-lead text-site-fg">
                {lead}
              </p>
            ) : null}
            {actions ? (
              <div className="s-enter s-enter-d2 mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                {actions}
              </div>
            ) : null}
          </Col>

          {meta?.length ? (
            <Col span={3} start={10} className="self-end">
              <dl className="s-enter-meta border-t border-site-line">
                {meta.map((row, i) => (
                  <div
                    key={i}
                    className="flex items-baseline justify-between gap-4 border-b border-site-line py-3"
                  >
                    <dt className="s-ticket text-site-muted">{row.label}</dt>
                    <dd className="text-end text-site-sm font-semibold text-site-ink">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Col>
          ) : null}
        </Grid>

        {children}
      </Container>
    </section>
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

/**
 * A panel.
 *
 * `interactive` uses the lift from `.s-lift`: an elevation step and 2px of
 * travel, no scale and no colour flash. That single effect is the direction's
 * whole hover vocabulary on the public site, and it degrades to a border change
 * under `prefers-reduced-motion` rather than disappearing.
 *
 * `brand` is the featured tone — a gradient panel for the one card in a set
 * that the page is actually arguing for. It is a tone rather than a prop on
 * every card so a page cannot end up with three "featured" plans.
 */
export function Card({
  className,
  tone = "default",
  interactive,
  ...props
}: ComponentProps<"div"> & {
  tone?: "default" | "ground" | "tint" | "ink" | "outline" | "brand";
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-site-card border",
        tone === "default" && "border-site-line bg-site-bg",
        tone === "ground" && "border-site-line bg-site-ground",
        tone === "tint" && "border-site-line bg-site-tint",
        tone === "outline" && "border-site-line bg-transparent",
        tone === "ink" &&
          "s-on-ink border-site-on-ink-line bg-site-ink-bg-2 text-site-on-ink-body",
        tone === "brand" &&
          "s-on-ink s-grad border-transparent text-white shadow-site-brand",
        interactive && "s-lift",
        interactive && tone === "default" && "hover:border-site-brand-line",
        interactive && tone === "ink" && "hover:border-site-on-ink-line",
        className,
      )}
      {...props}
    />
  );
}

/**
 * A number and its caption.
 *
 * The public site's counterpart to the product's `StatCard`: a quiet caption
 * over one loud figure, set in the mono face so digits line up between
 * neighbouring figures. It is here because the marketing pages kept
 * re-inventing this pair with body-weight numbers, which is the arrangement
 * that makes a claim look unremarkable.
 */
export function Figure({
  label,
  value,
  hint,
  onInk,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  onInk?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p
        className={cn(
          "s-ticket",
          onInk ? "text-site-on-ink-muted" : "text-site-muted",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-mono text-site-h2 leading-none font-semibold tabular-nums",
          onInk ? "text-site-on-ink" : "text-site-ink",
        )}
      >
        {value}
      </p>
      {hint ? (
        <p
          className={cn(
            "mt-2 text-site-sm",
            onInk ? "text-site-on-ink-body" : "text-site-fg",
          )}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Badge({
  className,
  tone = "brand",
  children,
}: {
  className?: string;
  tone?: "brand" | "warm" | "neutral" | "positive" | "critical" | "onInk";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "s-ticket inline-flex items-center gap-1.5 rounded-site-sm border px-2 py-1",
        tone === "brand" &&
          "border-site-brand-line bg-site-brand-tint text-site-brand-deep",
        tone === "warm" &&
          "border-site-brand-line bg-site-warm-tint text-site-warm",
        tone === "neutral" && "border-site-line bg-site-tint text-site-fg",
        tone === "positive" &&
          "border-site-line bg-site-positive-tint text-site-positive",
        tone === "critical" &&
          "border-site-critical/25 bg-site-critical-tint text-site-critical",
        tone === "onInk" &&
          "border-site-on-ink-line bg-white/8 text-site-on-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * A hairline. Exposed as a component because the public site uses rules
 * structurally — between bands and inside panels — and each of those was
 * previously a hand-written `border-t border-site-line` div.
 */
export function Rule({
  className,
  onInk,
}: {
  className?: string;
  onInk?: boolean;
}) {
  return (
    <hr
      aria-hidden
      className={cn(
        "border-0 border-t",
        onInk ? "border-site-on-ink-line" : "border-site-line",
        className,
      )}
    />
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
