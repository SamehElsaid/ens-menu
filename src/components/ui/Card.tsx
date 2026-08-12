import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { text } from "./styles";

const padding = {
  none: "",
  sm: "p-2.5",
  md: "p-3 sm:p-4",
  lg: "p-4 sm:p-5",
} as const;

export type CardProps = HTMLAttributes<HTMLElement> & {
  /** `flat` is the default resting panel. `raised` floats and is for overlays
   *  only. `ghost` is a sunken well. `featured` is the one card per view that
   *  carries the light — it costs the page its gradient budget. */
  variant?: "flat" | "raised" | "ghost" | "featured";
  padded?: keyof typeof padding;
  /** Tint-and-lift on hover. For rows, prefer `interactive` in `styles.ts`. */
  interactive?: boolean;
  /** Raises a step and travels 2px on hover. Entity cards and tiles. */
  lift?: boolean;
  /** Marks the panel as the live/selected one. */
  active?: boolean;
  /** An explicit list rather than `ElementType`, matching `Bento` and
   *  `BentoCell`. A card is a container, and the wide type also admitted void
   *  and non-HTML elements it can never legitimately render as. */
  as?: "div" | "section" | "article" | "aside" | "li" | "form" | "figure";
};

/**
 * An elevated panel.
 *
 * The previous direction drew every resting surface with a hairline and
 * forbade shadow outright. Here elevation is the grouping signal: a card rests
 * on `shadow-xs`, lifts to `shadow-lg` if it is a single clickable object, and
 * only overlays go higher. The rule survives as an edge, not as the structure.
 *
 * `active` states itself three ways — brand border, brand inline edge and a
 * faint brand wash — so a selected card reads at a glance down a column of
 * eight and still survives greyscale, because two of the three are position
 * and weight rather than hue.
 */
export function Card({
  variant = "flat",
  padded = "md",
  interactive = false,
  lift = false,
  active = false,
  as: Tag = "div",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <Tag
      className={cn(
        "relative rounded-xl bg-surface",
        variant === "flat" && "border border-line shadow-xs",
        variant === "raised" && "border border-line shadow-lg",
        variant === "ghost" && "border border-line bg-surface-2",
        variant === "featured" &&
          "border border-brand-line bg-surface shadow-brand",
        interactive &&
          "transition-[border-color,background-color,box-shadow] duration-(--dur-settle) ease-(--ease-settle) hover:border-line-strong hover:bg-surface-2/50 hover:shadow-sm",
        lift && "surface-lift hover:border-line-strong",
        active && "border-brand-line bg-brand-soft/40",
        active &&
          "before:absolute before:inset-y-3 before:start-0 before:w-[3px] before:rounded-e-full before:bg-brand before:content-['']",
        padding[padded],
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

/**
 * Card title row.
 *
 * `eyebrow` is the label above the title — the one place a card gets to say
 * what kind of thing it is. Optional, because a card inside a labelled section
 * does not need to repeat the section's name.
 */
export function CardHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        {eyebrow ? <p className={cn(text.label, "mb-1")}>{eyebrow}</p> : null}
        <h3 className="text-sm font-semibold tracking-[-0.02em] text-fg">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-fg-muted">
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

/**
 * A full-bleed strip at the foot of a padded card, separated by a rule.
 *
 * Actions live below a divider rather than floating inside the padding, so the
 * card has a visible body and a visible footer instead of one undifferentiated
 * block. The corner is re-rounded here because the card clips nothing — its
 * children can open menus that would otherwise be cut off.
 */
export function CardFooter({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "-mx-3 -mb-3 mt-3 flex items-center gap-2 rounded-b-xl border-t border-line bg-surface-2/50 px-3 py-2.5 sm:-mx-4 sm:-mb-4 sm:px-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
