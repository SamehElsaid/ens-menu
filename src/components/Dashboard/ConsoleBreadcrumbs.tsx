"use client";

import { Fragment } from "react";
import { FiChevronRight } from "react-icons/fi";
import LinkTo from "../Global/LinkTo";
import { cn } from "@/lib/cn";
import { focusRing } from "@/components/ui";
import type { ConsoleCrumb } from "@/lib/consoleNav";

/**
 * The header trail — CONSOLE-REDESIGN.md §3.
 *
 * On narrow screens the middle of the trail collapses rather than the ends. The
 * first crumb says which product surface you are in and the last says which page
 * you are on; the levels in between are the ones you can infer. Truncating from
 * the right instead — which is what `text-overflow` alone would do — removes
 * exactly the crumb the operator needs.
 */
export function ConsoleBreadcrumbs({
  crumbs,
  label,
}: {
  crumbs: ConsoleCrumb[];
  label: string;
}) {
  if (crumbs.length === 0) return <div className="min-w-0 flex-1" />;

  const first = crumbs[0];
  const last = crumbs[crumbs.length - 1];
  const middle = crumbs.slice(1, -1);
  const hasMiddle = middle.length > 0;

  return (
    <nav aria-label={label} className="min-w-0 flex-1">
      <ol className="flex items-center gap-1 text-[13px]">
        {crumbs.length > 1 ? (
          <>
            <Crumb crumb={first} className="hidden sm:inline-flex" />
            <Separator className="hidden sm:inline-flex" />
          </>
        ) : null}

        {hasMiddle
          ? middle.map((crumb, index) => (
              <Fragment key={`${crumb.label}-${index}`}>
                <Crumb crumb={crumb} className="hidden md:inline-flex" />
                <Separator className="hidden md:inline-flex" />
              </Fragment>
            ))
          : null}

        {/* Stands in for the hidden middle so the trail does not silently look
            like a two-level hierarchy on a phone. */}
        {hasMiddle ? (
          <>
            <li className="inline-flex text-fg-subtle md:hidden" aria-hidden>
              …
            </li>
            <Separator className="inline-flex md:hidden" />
          </>
        ) : null}

        <li className="min-w-0">
          <span
            aria-current="page"
            className="block truncate font-semibold text-fg"
          >
            {last.label}
          </span>
        </li>
      </ol>
    </nav>
  );
}

function Crumb({
  crumb,
  className,
}: {
  crumb: ConsoleCrumb;
  className?: string;
}) {
  const shared = "max-w-[14ch] truncate lg:max-w-[22ch]";

  if (!crumb.href) {
    return (
      <li className={cn("shrink-0", className)}>
        <span className={cn(shared, "block text-fg-subtle")}>
          {crumb.label}
        </span>
      </li>
    );
  }

  return (
    <li className={cn("shrink-0", className)}>
      <LinkTo
        href={crumb.href}
        className={cn(
          shared,
          "block rounded px-0.5 text-fg-muted settle hover:text-brand",
          focusRing,
        )}
      >
        {crumb.label}
      </LinkTo>
    </li>
  );
}

function Separator({ className }: { className?: string }) {
  return (
    <li className={cn("shrink-0", className)} aria-hidden>
      <FiChevronRight className="size-3.5 text-fg-subtle rtl:rotate-180" />
    </li>
  );
}

export default ConsoleBreadcrumbs;
