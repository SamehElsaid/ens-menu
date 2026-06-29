import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildSeoMetadata } from "@/lib/seo";
import { fetchPageMetadata, resolveMetaField } from "@/lib/fetchPageMetadata";
import KnowledgeBaseClient, { KnowledgeBaseInner } from "./KnowledgeBaseClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const dynamic = await fetchPageMetadata("knowledge-base");
  console.log(dynamic);
  return buildSeoMetadata({
    locale,
    path: "knowledge-base",
    title: resolveMetaField(dynamic, locale, "title", t("knowledgeBasePage.title")),
    description: resolveMetaField(dynamic, locale, "description", t("knowledgeBasePage.description")),
    keywords: resolveMetaField(dynamic, locale, "keywords", t("knowledgeBasePage.keywords")),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "index, follow",
  });
}

export default function KnowledgeBasePage() {
  return <KnowledgeBaseClient />;
}

export { KnowledgeBaseInner };
