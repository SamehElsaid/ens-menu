import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PricingView from "@/components/site/pricing/PricingView";
import CtaBand from "@/components/site/CtaBand";
import { buildSeoMetadata } from "@/lib/seo";
import { fetchPageMetadata, resolveMetaField } from "@/lib/fetchPageMetadata";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const dynamic = await fetchPageMetadata("pricing");
  return buildSeoMetadata({
    locale,
    path: "pricing",
    title: resolveMetaField(dynamic, locale, "title", t("pricingPage.title")),
    description: resolveMetaField(
      dynamic,
      locale,
      "description",
      t("pricingPage.description"),
    ),
    keywords: resolveMetaField(
      dynamic,
      locale,
      "keywords",
      t("pricingPage.keywords"),
    ),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "index, follow",
  });
}

export default function PricingRoutePage() {
  return (
    <>
      <PricingView />
      <CtaBand />
    </>
  );
}
