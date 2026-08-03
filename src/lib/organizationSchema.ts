import { getSocialLinks } from "@/modules/Footer/data";
import { ENSMENU_SUPPORT_EMAIL } from "@/lib/contactConstants";
import { getSiteOrigin } from "@/lib/sitemap/data";

/**
 * Organization + WebSite JSON-LD, shared across the root layout (and any
 * page that needs to reference the Organization @id, e.g. Article schema).
 * Sourced entirely from real, existing values (Footer/data.ts, contactConstants.ts) —
 * see ensmenu.com-audit/findings/schema.md for the source audit and caveats.
 */
export function buildOrganizationJsonLd() {
  const siteOrigin = getSiteOrigin();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteOrigin}/#organization`,
    name: "ENSmenu",
    url: siteOrigin,
    logo: `${siteOrigin}/favicon.svg`,
    description:
      "ENSmenu is a platform for creating digital QR menus and ordering systems for restaurants, cafes, and hotels.",
    email: ENSMENU_SUPPORT_EMAIL,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+201500800050",
        contactType: "sales",
        areaServed: "EG",
        availableLanguage: ["ar", "en"],
      },
      {
        "@type": "ContactPoint",
        telephone: "+201553841793",
        contactType: "technical support",
        areaServed: "EG",
        availableLanguage: ["ar", "en"],
      },
      {
        "@type": "ContactPoint",
        telephone: "+971586551491",
        contactType: "customer service",
        areaServed: "AE",
        availableLanguage: ["ar", "en"],
      },
    ],
    // WhatsApp is a contact channel, not a brand profile page — excluded from sameAs.
    sameAs: getSocialLinks()
      .filter((link) => link.name !== "WhatsApp")
      .map((link) => link.href)
      .filter(Boolean),
  };
}

export function buildWebSiteJsonLd() {
  const siteOrigin = getSiteOrigin();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteOrigin}/#website`,
    name: "ENSmenu",
    url: siteOrigin,
    inLanguage: ["ar", "en"],
    publisher: { "@id": `${siteOrigin}/#organization` },
  };
}
