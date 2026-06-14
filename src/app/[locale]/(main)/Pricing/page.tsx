import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PricingComparisonPage from "@/components/Pricing/PricingComparisonPage";
import { buildSeoMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildSeoMetadata({
    locale,
    path: "Pricing",
    title: t("pricingPage.title"),
    description: t("pricingPage.description"),
    keywords: t("pricingPage.keywords"),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "index, follow",
  });
}

export default function PricingRoutePage() {
  return <PricingComparisonPage />;
}
