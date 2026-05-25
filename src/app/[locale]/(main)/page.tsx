import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import { buildSeoMetadata } from "@/lib/seo";
import { FaWhatsapp } from "react-icons/fa";
import HeroContent from "@/components/HomePage/HeroContent";
import HeroPhoneDesktopPortal from "@/components/HomePage/HeroPhoneDesktopPortal";
import SectionSkeleton from "@/components/HomePage/SectionSkeleton";
import PricingPlanCardsSection from "@/components/Pricing/PricingPlanCardsSection";

const dynamicSection = (factory: () => Promise<unknown>, height: string) =>
  dynamic(() => factory() as Promise<{ default: React.ComponentType }>, {
    loading: () => <SectionSkeleton height={height} />,
  });

const TemplateShow = dynamicSection(
  () => import("@/components/HomePage/TemplateShow"),
  "640px",
);

const PhoneVideoSection = dynamicSection(
  () => import("@/components/HomePage/PhoneVideoSection"),
  "720px",
);

const Features = dynamicSection(
  () => import("@/components/HomePage/FeatureSection"),
  "520px",
);

const HowItWorks = dynamicSection(
  () => import("@/components/HomePage/HowItWorks"),
  "480px",
);

const FAQ = dynamicSection(() => import("@/components/HomePage/FAQ"), "420px");

const FooterSection = dynamicSection(
  () => import("@/components/HomePage/Footer"),
  "320px",
);

const HOME_WHATSAPP_URL = "https://wa.me/201500800050";
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
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "index, follow",
  });
}

async function Page({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "personalProfile" });

  return (
    <>
      <HeroContent locale={locale} />
      <TemplateShow />
      <HowItWorks />
      <PhoneVideoSection />
      <Features />
      <PricingPlanCardsSection />
      <FAQ />
      <FooterSection />
      {/* <HeroPhoneDesktopPortal /> */}

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
