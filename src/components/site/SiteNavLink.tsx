"use client";

import type { ComponentProps, MouseEvent } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { homeHashTarget, scrollToHash } from "@/lib/siteHashNav";

type Props = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

/**
 * Locale-aware link that still scrolls when the destination is a hash on the
 * page the visitor is already on. Plain `Link` to `/#features` is a no-op the
 * second time around because the pathname never changes.
 */
export function SiteNavLink({ href, onClick, ...props }: Props) {
  const pathname = usePathname();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;

    const id = homeHashTarget(href);
    if (!id) return;
    if (pathname !== "/") return;

    e.preventDefault();
    scrollToHash(id);
    window.history.pushState(null, "", `#${id}`);
  };

  return <Link href={href} onClick={handleClick} {...props} />;
}

export default SiteNavLink;
