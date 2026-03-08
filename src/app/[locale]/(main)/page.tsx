import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildSeoMetadata } from "@/lib/seo";
import CTA from "@/components/HomePage/Cta";
import FAQ from "@/components/HomePage/FAQ";
import Features from "@/components/HomePage/FeatureSection";
import FooterSection from "@/components/HomePage/Footer";
import HeroSection from "@/components/HomePage/HeroSection";
import HowItWorks from "@/components/HomePage/HowItWorks";
import PricingSection from "@/components/HomePage/PricingSection";
import TemplateShow from "@/components/HomePage/TemplateShow";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildSeoMetadata({
    locale,
    path: "",
    title: t("home.title"),
    description: t("home.description"),
    keywords: t("home.keywords"),
    siteName: t("siteName"),
    robots: "index, follow",
  });
}

function Page() {
  return (
    <>
      <HeroSection />
      <TemplateShow />
      <Features />
      <PricingSection />
      <HowItWorks />
      <FAQ />
      <CTA />
      <FooterSection />
    </>
  );
}

export default Page;
