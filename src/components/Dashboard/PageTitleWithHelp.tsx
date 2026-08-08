"use client";

import type { ReactNode } from "react";
import { PageHeader, type PageHeaderProps } from "@/components/ui";
import { cn } from "@/lib/cn";

type PageTitleWithHelpProps = Partial<PageHeaderProps> & {
  className?: string;
  id?: string;
  dir?: "ltr" | "rtl";
  /** Legacy wrapper — prefer passing `title` / `description` / `actions` directly. */
  children?: ReactNode;
};

/**
 * Page title region. Delegates to `PageHeader` when title props are supplied;
 * otherwise wraps legacy child markup for gradual migration.
 */
export default function PageTitleWithHelp({
  children,
  className,
  id,
  dir,
  title,
  description,
  breadcrumbs,
  breadcrumbsLabel,
  actions,
  meta,
}: PageTitleWithHelpProps) {
  if (title != null) {
    return (
      <div id={id} dir={dir} className={cn(className)}>
        <PageHeader
          title={title}
          description={description}
          breadcrumbs={breadcrumbs}
          breadcrumbsLabel={breadcrumbsLabel}
          actions={actions}
          meta={meta}
        />
      </div>
    );
  }

  return (
    <div id={id} dir={dir} className={className?.trim() || undefined}>
      {children}
    </div>
  );
}
