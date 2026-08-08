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
    <div className={cn("divide-y divide-site-line", className)}>
      {items.map((item, index) => (
        <details
          key={index}
          name={name}
          className="group s-accordion"
          {...(index === 0 && !name ? { open: true } : {})}
        >
          <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-4 py-5 text-start text-site-h4 font-semibold text-site-ink transition-colors hover:text-site-brand [&::-webkit-details-marker]:hidden">
            <span>{item.question}</span>
            <span
              aria-hidden
              className="relative flex size-8 shrink-0 items-center justify-center rounded-full border border-site-line text-site-brand transition-[transform,background-color,border-color] duration-200 group-open:rotate-45 group-open:border-site-brand group-open:bg-site-brand-tint"
            >
              <span className="absolute h-px w-3.5 bg-current" />
              <span className="absolute h-3.5 w-px bg-current" />
            </span>
          </summary>
          <div className="s-accordion-body pb-6 text-site-body text-site-fg">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
