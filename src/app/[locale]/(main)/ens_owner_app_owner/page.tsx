import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildSeoMetadata } from "@/lib/seo";
import { fetchPageMetadata, resolveMetaField } from "@/lib/fetchPageMetadata";
import OwnerAppView from "@/components/site/apps/OwnerAppView";

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
    description: resolveMetaField(
      dynamic,
      locale,
      "description",
      t("ownerAppPage.description"),
    ),
    keywords: resolveMetaField(
      dynamic,
      locale,
      "keywords",
      t("ownerAppPage.keywords"),
    ),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "index, follow",
  });
}

export default function OwnerAppPage() {
  return <OwnerAppView />;
}
