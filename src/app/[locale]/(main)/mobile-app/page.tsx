import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildSeoMetadata } from "@/lib/seo";
import HeroSection from "@/components/mobile-app/HeroApp";
import TemplateDescription from "@/components/mobile-app/TemplateDescription";
import FaqSection from "@/components/mobile-app/FaqApp";
import FeaturesApp from "@/components/mobile-app/FeaturesApp";
import WorkflowApp from "@/components/mobile-app/WorkflowApp";
import FooterSection from "@/components/HomePage/Footer";
import PricingPlanCardsSection from "@/components/Pricing/PricingPlanCardsSection";


type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildSeoMetadata({
    locale,
    path: "mobile-app",
    title: t("mobileAppPage.title"),
    description: t("mobileAppPage.description"),
    keywords: t("mobileAppPage.keywords"),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "index, follow",
  });
}

export default async function MobileAppPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "Landing.MobileAppCta",
  });

  return (
    <main className="min-h-screen bg-white dark:bg-[#0d1117]">
      <HeroSection />
      <WorkflowApp />

      <FeaturesApp />
      <FaqSection />

      <TemplateDescription />

      <PricingPlanCardsSection />
      <FooterSection />
    </main>
  );
}
