import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import AboutPageView from "@/components/HomePage/AboutPageView";
import { buildSeoMetadata } from "@/lib/seo";
import { fetchPageMetadata, resolveMetaField } from "@/lib/fetchPageMetadata";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const dynamic = await fetchPageMetadata("about");
  return buildSeoMetadata({
    locale,
    path: "about",
    title: resolveMetaField(dynamic, locale, "title", t("aboutPage.title")),
    description: resolveMetaField(dynamic, locale, "description", t("aboutPage.description")),
    keywords: resolveMetaField(dynamic, locale, "keywords", t("aboutPage.keywords")),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "index, follow",
  });
}

export default function AboutPage() {
  return <AboutPageView />;
}
