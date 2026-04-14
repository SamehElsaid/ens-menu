import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FaWhatsapp } from "react-icons/fa";
import { buildSeoMetadata } from "@/lib/seo";
import CTA from "@/components/HomePage/Cta";
import FAQ from "@/components/HomePage/FAQ";
import Features from "@/components/HomePage/FeatureSection";
import FooterSection from "@/components/HomePage/Footer";
import HeroSection from "@/components/HomePage/HeroSection";
import HowItWorks from "@/components/HomePage/HowItWorks";
import PricingSection from "@/components/HomePage/PricingSection";
import TemplateShow from "@/components/HomePage/TemplateShow";

const HOME_WHATSAPP_URL = "https://wa.me/971586551491";

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

async function Page({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "personalProfile" });

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
      <a
        href={HOME_WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("contactWhatsApp")}
        className="fixed bottom-4 left-4 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
      >
        <FaWhatsapp className="size-8" aria-hidden />
      </a>
    </>
  );
}

export default Page;
