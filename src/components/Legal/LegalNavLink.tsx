"use client";

import SafeLink from "@/components/Global/SafeLink";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

type LegalNavHref = "/about" | "/contact" | "/privacy-policy" | "/terms-and-conditions";

type LegalNavLinkProps = {
  href: LegalNavHref;
  children: React.ReactNode;
  variant?: "dark" | "light";
  className?: string;
};

function isActiveLegalPath(pathname: string, href: LegalNavHref) {
  const stripped = pathname.replace(/^\/(ar|en)(?=\/|$)/, "") || "/";
  return stripped === href || pathname.endsWith(href);
}

export default function LegalNavLink({
  href,
  children,
  variant = "dark",
  className,
}: LegalNavLinkProps) {
  const pathname = usePathname();
  const isActive = isActiveLegalPath(pathname, href);

  return (
    <SafeLink
      href={href}
      prefetch={false}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "legal-nav-link",
        variant === "light" && "legal-nav-link--on-light",
        isActive && "legal-nav-link--active",
        className,
      )}
    >
      {children}
    </SafeLink>
  );
}
