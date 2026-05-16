import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import FooterSection from "@/components/HomePage/Footer";
import ContactPageView from "@/components/HomePage/ContactPageView";
import { buildSeoMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildSeoMetadata({
    locale,
    path: "contact",
    title: t("contactPage.title"),
    description: t("contactPage.description"),
    keywords: t("contactPage.keywords"),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "index, follow",
  });
}

export default async function ContactPage() {
  return (
    <>
      <ContactPageView />
      <FooterSection />
    </>
  );
}
