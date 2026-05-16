import { getTranslations } from "next-intl/server";
import { getSeoBaseUrl } from "@/lib/seo";

type Props = {
  locale: string;
};

export default async function SeoJsonLd({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: "meta" });
  const baseUrl = getSeoBaseUrl();
  const siteUrl =
    baseUrl ||
    (locale === "ar" ? "https://ensmenu.com" : "https://ensmenu.com/en");

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: t("siteName"),
    url: siteUrl,
    description: t("home.description"),
    inLanguage: locale === "ar" ? "ar" : "en",
    keywords: t("coreKeywords"),
  };

  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: t("siteName"),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: t("jsonLd.freeOffer"),
    },
    description: t("home.description"),
    featureList: t("jsonLd.featureList"),
  };

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: t("siteName"),
    url: siteUrl,
    description: t("home.description"),
    sameAs: [
      "https://www.instagram.com/ens.menu",
      "https://www.facebook.com/Ensmenu/",
      "https://www.tiktok.com/@ensmenu6",
      "https://www.youtube.com/@EnsMENU",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(software) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
    </>
  );
}
