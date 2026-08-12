import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildSeoMetadata } from "@/lib/seo";
import { fetchPageMetadata, resolveMetaField } from "@/lib/fetchPageMetadata";
import { getSiteOrigin } from "@/lib/sitemap/data";
import { fetchHomepageFeaturedLogosServer } from "@/lib/homepageFeaturedLogos";
import Hero from "@/components/site/home/Hero";
import LogoStrip from "@/components/site/home/LogoStrip";
import HomeMotion from "@/components/site/home/HomeMotion";
import {
  Features,
  HomeFaq,
  HowItWorks,
  Plans,
  Showcase,
} from "@/components/site/home/Sections";
import CtaBand from "@/components/site/CtaBand";
import HashScroll from "@/components/site/HashScroll";
import JsonLd from "@/components/Global/JsonLd";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const dynamic = await fetchPageMetadata("home");
  return buildSeoMetadata({
    locale,
    path: "",
    title: resolveMetaField(dynamic, locale, "title", t("home.title")),
    description: resolveMetaField(
      dynamic,
      locale,
      "description",
      t("home.description"),
    ),
    keywords: resolveMetaField(dynamic, locale, "keywords", t("home.keywords")),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "index, follow",
  });
}

function buildWebApplicationJsonLd() {
  const siteOrigin = getSiteOrigin();

  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ENSmenu",
    url: siteOrigin,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "ENSmenu is a platform for creating digital QR menus and ordering systems for restaurants, cafes, and hotels — bilingual Arabic/English, with AI-powered menu import from photo or PDF.",
    inLanguage: ["ar", "en"],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EGP",
    },
    featureList: [
      "QR code digital menu creation",
      "AI-powered menu import from photo or PDF",
      "Bilingual Arabic/English menus with RTL support",
      "Real-time menu and price updates",
      "Multi-branch and multi-location management",
    ],
    publisher: { "@id": `${siteOrigin}/#organization` },
  };
}

async function Page({ params }: Props) {
  const { locale } = await params;
  const featuredLogos = await fetchHomepageFeaturedLogosServer();

  return (
    <>
      <HashScroll />
      <HomeMotion />
      <JsonLd data={buildWebApplicationJsonLd()} />
      <Hero locale={locale} />
      <LogoStrip initialLogos={featuredLogos} />
      <HowItWorks />
      <Features />
      <Showcase />
      <Plans />
      <HomeFaq />
      <CtaBand homeMotion />
    </>
  );
}

export default Page;
