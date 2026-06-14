import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import AboutPageView from "@/components/HomePage/AboutPageView";
import FooterSection from "@/components/HomePage/Footer";
import { buildSeoMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildSeoMetadata({
    locale,
    path: "about",
    title: t("aboutPage.title"),
    description: t("aboutPage.description"),
    keywords: t("aboutPage.keywords"),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "index, follow",
  });
}

export default function AboutPage() {
  return (
    <>
      <AboutPageView />
      <FooterSection />
    </>
  );
}
