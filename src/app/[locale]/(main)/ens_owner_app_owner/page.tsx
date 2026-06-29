import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildSeoMetadata } from "@/lib/seo";
import { fetchPageMetadata, resolveMetaField } from "@/lib/fetchPageMetadata";
import HeroOwnerApp from "@/components/owner-app/HeroOwnerApp";
import FeaturesOwnerApp from "@/components/owner-app/FeaturesOwnerApp";
import CtaOwnerApp from "@/components/owner-app/CtaOwnerApp";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const dynamic = await fetchPageMetadata("owner-app");
  return buildSeoMetadata({
    locale,
    path: "ens_owner_app_owner",
    title: resolveMetaField(dynamic, locale, "title", t("ownerAppPage.title")),
    description: resolveMetaField(dynamic, locale, "description", t("ownerAppPage.description")),
    keywords: resolveMetaField(dynamic, locale, "keywords", t("ownerAppPage.keywords")),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "index, follow",
  });
}

export default async function OwnerAppPage({ params }: PageProps) {
  await params;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117]">
      <HeroOwnerApp />
      <FeaturesOwnerApp />
      <CtaOwnerApp />
    </div>
  );
}
