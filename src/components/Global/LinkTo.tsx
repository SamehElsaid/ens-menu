"use client";

import { useLocale } from "next-intl";
import SafeLink from "@/components/Global/SafeLink";

interface LinkToProps {
  href: string;
  children: React.ReactNode;
  onSameRoute?: () => void;
  [key: string]: unknown;
}

function LinkTo({ href, children, onSameRoute, ...props }: LinkToProps) {
  const locale = useLocale();
  const normalizedHref = (`/${href}`).replaceAll("//", "/");

  return (
    <SafeLink
      {...props}
      href={normalizedHref}
      locale={locale}
      onSameRoute={onSameRoute}
    >
      {children}
    </SafeLink>
  );
}

export default LinkTo;
