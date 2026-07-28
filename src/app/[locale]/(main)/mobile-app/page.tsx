import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildSeoMetadata } from "@/lib/seo";
import { fetchPageMetadata, resolveMetaField } from "@/lib/fetchPageMetadata";
import HeroApp from "@/components/mobile-app/HeroApp";
import FeaturesApp from "@/components/mobile-app/FeaturesApp";
import WorkflowApp from "@/components/mobile-app/WorkflowApp";
import FaqApp from "@/components/mobile-app/FaqApp";
import CtaApp from "@/components/mobile-app/CtaApp";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const dynamic = await fetchPageMetadata("mobile-app");
  return buildSeoMetadata({
    locale,
    path: "mobile-app",
    title: resolveMetaField(dynamic, locale, "title", t("mobileAppPage.title")),
    description: resolveMetaField(
      dynamic,
      locale,
      "description",
      t("mobileAppPage.description"),
    ),
    keywords: resolveMetaField(
      dynamic,
      locale,
      "keywords",
      t("mobileAppPage.keywords"),
    ),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "index, follow",
  });
}

export default async function MobileAppPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117]">
      <HeroApp />
      {/* <FeaturesApp /> */}
      <WorkflowApp />
      <FaqApp />
      <CtaApp />
    </div>
  );
}
