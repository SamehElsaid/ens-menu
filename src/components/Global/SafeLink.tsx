"use client";

import { Link } from "@/i18n/navigation";
import { createSafeLinkClickHandler } from "@/lib/safeNavigation";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import type { ComponentProps } from "react";

type SafeLinkProps = ComponentProps<typeof Link> & {
  onSameRoute?: () => void;
};

export default function SafeLink({
  href,
  onClick,
  onSameRoute,
  ...props
}: SafeLinkProps) {
  const pathname = usePathname();
  const locale = useLocale();

  const hrefString = typeof href === "string" ? href : (href.pathname ?? "/");

  const handleClick = createSafeLinkClickHandler({
    currentPathname: pathname,
    currentLocale: locale,
    href: hrefString,
    onSameRoute,
    onNavigate: onClick,
  });

  return <Link href={href} onClick={handleClick} {...props} />;
}
