import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import { buildSeoMetadata } from "@/lib/seo";
import HeroContent from "@/components/HomePage/HeroContent";
import HeroPhoneDesktopPortal from "@/components/HomePage/HeroPhoneDesktopPortal";
import SectionSkeleton from "@/components/HomePage/SectionSkeleton";
import ChatWidget from "@/components/ChatWidget";

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

  return (
    <>
      <HeroContent locale={locale} />
      <TemplateShow />
      <PhoneVideoSection />
      <Features />
      <HowItWorks />
      <FAQ />
      <FooterSection />
      {/* <HeroPhoneDesktopPortal /> */}
    </>
  );
}

export default Page;
