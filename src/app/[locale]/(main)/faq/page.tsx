import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import FooterSection from "@/components/HomePage/Footer";
import FaqPageView from "@/components/HomePage/FaqPageView";
import { buildSeoMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildSeoMetadata({
    locale,
    path: "faq",
    title: t("faqPage.title"),
    description: t("faqPage.description"),
    keywords: t("faqPage.keywords"),
    siteName: t("siteName"),
    robots: "index, follow",
  });
}

export default async function FaqPage() {
  return (
    <>
      <FaqPageView />
      <FooterSection />
    </>
  );
}
