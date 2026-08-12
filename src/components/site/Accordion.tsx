import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * FAQ accordion built on native `<details>`.
 *
 * No state, no hydration, no JavaScript: the browser gives us the disclosure
 * semantics, keyboard behaviour and screen-reader announcement for free, and
 * the content is present in the HTML for search engines and AI crawlers to
 * read even when collapsed. The open/close animation is progressive — where
 * `::details-content` is supported it eases, and everywhere else it snaps.
 *
 * Each question is its own panel rather than a row in a ledger. Separate
 * surfaces make the hit area obvious at a glance, and they let the open panel
 * state itself with a brand-tinted edge instead of relying on the reader to
 * spot which of twelve identical rules has expanded.
 */

export type FaqItem = { question: string; answer: ReactNode };

export function Accordion({
  items,
  className,
  name,
}: {
  items: FaqItem[];
  className?: string;
  /** Exclusive accordion: passing the same name closes siblings on open. */
  name?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {items.map((item, index) => (
        <details
          key={index}
          name={name}
          className={cn(
            "group s-accordion rounded-site-card border border-site-line bg-site-bg px-5",
            "transition-[border-color,box-shadow,background-color] duration-(--dur-settle) ease-(--ease-settle)",
            "hover:border-site-line-strong",
            /* The open panel also takes a tint, not just an edge. Scrolled down
               inside a long answer the border is off-screen, and the tint is the
               only thing still saying which question this text belongs to. */
            "open:border-site-brand-line open:bg-site-brand-tint/45 open:shadow-site-sm",
          )}
          /* The first answer opens, exclusive group or not: a column of closed
             rows shows the visitor nothing about what an answer looks like. */
          {...(index === 0 ? { open: true } : {})}
        >
          <summary className="flex w-full cursor-pointer list-none items-start gap-4 py-5 text-start [&::-webkit-details-marker]:hidden">
            <span className="flex-1 text-site-h4 font-semibold text-site-ink transition-colors duration-(--dur-tint) ease-(--ease-settle) group-hover:text-site-brand-deep group-open:text-site-brand-deep">
              {item.question}
            </span>
            {/* The marker fills with the brand when open, so a scanning reader
                can find the expanded panel from the far end of the line rather
                than by reading question weights. The box itself never rotates —
                only the vertical stroke, so plus becomes minus. */}
            <span
              aria-hidden
              className="relative mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-site-line-strong text-site-fg transition-[background-color,border-color,color] duration-(--dur-settle) ease-(--ease-settle) group-hover:border-site-brand-line group-open:border-transparent group-open:bg-site-brand group-open:text-white"
            >
              <span className="absolute h-px w-3 bg-current" />
              <span className="absolute h-3 w-px bg-current transition-transform duration-(--dur-settle) ease-(--ease-lift) group-open:rotate-90" />
            </span>
          </summary>
          <div className="pb-5 pe-11 text-site-body text-site-fg">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
