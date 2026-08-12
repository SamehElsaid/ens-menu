"use client";

import { Fragment } from "react";
import { FiChevronRight } from "react-icons/fi";
import LinkTo from "../Global/LinkTo";
import { cn } from "@/lib/cn";
import { focusRing } from "@/components/ui";
import type { ConsoleCrumb } from "@/lib/consoleNav";

/**
 * Header trail.
 *
 * `full` — classic trail including the current page (legacy single-bar header).
 * `ancestry` — every crumb except the current page. Used by the two-level
 * chrome, where the current page is the context-row title and repeating it in
 * the trail is noise.
 *
 * On narrow screens the middle collapses rather than the ends: the first crumb
 * names the product surface and the last visible crumb is the nearest parent.
 */
export function ConsoleBreadcrumbs({
  crumbs,
  label,
  mode = "full",
}: {
  crumbs: ConsoleCrumb[];
  label: string;
  mode?: "full" | "ancestry";
}) {
  const items =
    mode === "ancestry" && crumbs.length > 0 ? crumbs.slice(0, -1) : crumbs;

  if (items.length === 0) {
    return mode === "ancestry" ? null : <div className="min-w-0 flex-1" />;
  }

  const first = items[0];
  const last = items[items.length - 1];
  const middle = items.slice(1, -1);
  const hasMiddle = middle.length > 0;
  const currentIsLast = mode === "full";

  return (
    <nav aria-label={label} className="min-w-0">
      <ol className="flex items-center gap-1 text-[12px] leading-none sm:text-[13px]">
        {items.length > 1 ? (
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

        {hasMiddle ? (
          <>
            <li className="inline-flex text-fg-subtle md:hidden" aria-hidden>
              …
            </li>
            <Separator className="inline-flex md:hidden" />
          </>
        ) : null}

        <li className="min-w-0">
          {currentIsLast || !last.href ? (
            <span
              aria-current={currentIsLast ? "page" : undefined}
              className={cn(
                "block truncate",
                currentIsLast
                  ? "font-semibold text-fg"
                  : "font-medium text-fg-muted",
              )}
            >
              {last.label}
            </span>
          ) : (
            <LinkTo
              href={last.href}
              className={cn(
                "block max-w-[14ch] truncate rounded px-0.5 font-medium text-fg-muted settle hover:text-brand lg:max-w-[22ch]",
                focusRing,
              )}
            >
              {last.label}
            </LinkTo>
          )}
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
