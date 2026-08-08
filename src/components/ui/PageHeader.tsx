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
  breadcrumbs?: Crumb[];
  breadcrumbsLabel?: string;
  /** Primary and secondary actions for the page. */
  actions?: ReactNode;
  /** Status badges or metadata shown beside the title. */
  meta?: ReactNode;
  className?: string;
};

/**
 * The single page-title treatment.
 *
 * Replaces the ad-hoc `text-3xl font-bold` headings that each screen was
 * declaring for itself, and keeps actions on the same optical baseline as the
 * title at every width.
 */
export function PageHeader({
  title,
  description,
  breadcrumbs,
  breadcrumbsLabel = "Breadcrumb",
  actions,
  meta,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-2", className)}>
      {breadcrumbs?.length ? (
        <Breadcrumbs items={breadcrumbs} label={breadcrumbsLabel} />
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[17px] font-semibold tracking-[-0.02em] text-fg">
              {title}
            </h1>
            {meta}
          </div>
          {description ? (
            <p className="mt-0.5 max-w-2xl text-xs leading-relaxed text-fg-muted">
              {description}
            </p>
          ) : null}
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-1.5">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}

/** Titled region inside a page, one level below `PageHeader`. */
export function SectionHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-sm font-semibold tracking-[-0.011em] text-fg">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-fg-muted">
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
