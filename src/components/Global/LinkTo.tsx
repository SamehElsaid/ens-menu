"use client";

import SafeLink from "@/components/Global/SafeLink";

interface LinkToProps {
  href: string;
  children: React.ReactNode;
  onSameRoute?: () => void;
  [key: string]: unknown;
}

/**
 * Locale-aware internal link.
 *
 * Do NOT pass `locale` into next-intl `Link` here: with `localePrefix: "as-needed"`,
 * an explicit `locale` prop always prefixes the default locale (`/ar/...`), which
 * then 307-redirects to the canonical unprefixed URL. That breaks crawl discovery
 * (Google sees redirects instead of direct internal links) and is why Knowledge Base
 * articles can sit in the sitemap as "URL unknown / no referring sitemaps".
 */
function LinkTo({ href, children, onSameRoute, ...props }: LinkToProps) {
  const normalizedHref = `/${href}`.replaceAll("//", "/");

  return (
    <SafeLink {...props} href={normalizedHref} onSameRoute={onSameRoute}>
      {children}
    </SafeLink>
  );
}

export default LinkTo;
