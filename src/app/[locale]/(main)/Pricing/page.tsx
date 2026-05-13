import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import FooterSection from "@/components/HomePage/Footer";
import PricingComparisonPage from "@/components/Pricing/PricingComparisonPage";
import { buildSeoMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildSeoMetadata({
    locale,
    path: "Pricing",
    title: t("pricingPage.title"),
    description: t("pricingPage.description"),
    keywords: t("pricingPage.keywords"),
    siteName: t("siteName"),
    robots: "index, follow",
  });
}

export default function PricingRoutePage() {
  return (
    <>
      <PricingComparisonPage />
      <FooterSection />
    </>
  );
}
