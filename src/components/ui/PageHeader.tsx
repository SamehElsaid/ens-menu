import Link from "next/link";
import type { ReactNode } from "react";
import { FiChevronRight } from "react-icons/fi";
import { cn } from "@/lib/cn";

export type Crumb = { label: ReactNode; href?: string };

/**
 * Trail back up the hierarchy. The current page is the last item and is not
 * a link, so the trail cannot be mistaken for navigation to itself.
 */
export function Breadcrumbs({
  items,
  label,
  className,
}: {
  items: Crumb[];
  /** Names the trail for screen readers. */
  label: string;
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <nav aria-label={label} className={cn("min-w-0", className)}>
      <ol className="flex flex-wrap items-center gap-1 text-xs text-fg-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex min-w-0 items-center gap-1">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="truncate rounded transition-colors hover:text-fg"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn("truncate", isLast && "font-medium text-fg")}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast ? (
                <FiChevronRight
                  className="size-3 shrink-0 text-fg-subtle rtl:rotate-180"
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  /**
   * Quiet label above the title, saying what kind of surface this is. Only
   * rendered when there are no `breadcrumbs`: both occupy the same line, and a
   * page that knows where it sits is better served by the trail.
   */
  eyebrow?: ReactNode;
  breadcrumbs?: Crumb[];
  breadcrumbsLabel?: string;
  /** Primary and secondary actions for the page. */
  actions?: ReactNode;
  /** Status badges or metadata shown beside the title. */
  meta?: ReactNode;
  /** Removes the closing rule — for headers that sit directly on a toolbar. */
  bare?: boolean;
  className?: string;
};

/**
 * The single page-title treatment.
 *
 * Two changes from the previous version carry the new hierarchy. The title is
 * larger and set at display weight, so the top of a dense screen has one clear
 * focal point instead of a 17px heading competing with the 13px rows below it.
 * And the header closes with a rule: on a work surface the page title, its
 * toolbar and its collection used to run together as one grey mass, and the
 * rule is what separates "what this page is" from "what is on it".
 */
export function PageHeader({
  title,
  description,
  eyebrow,
  breadcrumbs,
  breadcrumbsLabel = "Breadcrumb",
  actions,
  meta,
  bare = false,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-2",
        !bare && "border-b border-line pb-3",
        className,
      )}
    >
      {breadcrumbs?.length ? (
        <Breadcrumbs items={breadcrumbs} label={breadcrumbsLabel} />
      ) : eyebrow ? (
        <p className="ui-eyebrow self-start">{eyebrow}</p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[22px] leading-tight font-bold tracking-[-0.03em] text-fg">
              {title}
            </h1>
            {meta}
          </div>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-fg-muted">
              {description}
            </p>
          ) : null}
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}

/**
 * Titled region inside a page, one level below `PageHeader`.
 *
 * `ruled` puts the title on a divider that runs to the end of the row, which is
 * how a long settings page gets scannable sections without each one needing its
 * own card.
 */
export function SectionHeader({
  title,
  eyebrow,
  description,
  actions,
  ruled = false,
  className,
}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  ruled?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between",
        ruled && "border-b border-line pb-2.5",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? <p className="ui-eyebrow mb-1.5">{eyebrow}</p> : null}
        <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-fg">
          {title}
        </h2>
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
