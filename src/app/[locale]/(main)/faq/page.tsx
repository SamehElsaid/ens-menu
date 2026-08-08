import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import FaqView from "@/components/site/faq/FaqView";
import CtaBand from "@/components/site/CtaBand";
import { buildSeoMetadata } from "@/lib/seo";
import { fetchPageMetadata, resolveMetaField } from "@/lib/fetchPageMetadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const dynamic = await fetchPageMetadata("faq");
  return buildSeoMetadata({
    locale,
    path: "faq",
    title: resolveMetaField(dynamic, locale, "title", t("faqPage.title")),
    description: resolveMetaField(
      dynamic,
      locale,
      "description",
      t("faqPage.description"),
    ),
    keywords: resolveMetaField(
      dynamic,
      locale,
      "keywords",
      t("faqPage.keywords"),
    ),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "index, follow",
  });
}

export default function FaqPage() {
  return (
    <>
      <FaqView />
      <CtaBand />
    </>
  );
}
