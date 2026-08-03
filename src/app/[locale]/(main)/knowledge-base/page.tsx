import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildSeoMetadata } from "@/lib/seo";
import { fetchPageMetadata, resolveMetaField } from "@/lib/fetchPageMetadata";
import KnowledgeBaseClient, { KnowledgeBaseInner } from "./KnowledgeBaseClient";
import { fetchArticleList, PAGE_LIMIT } from "./fetchKb";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const dynamic = await fetchPageMetadata("knowledge-base");
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

export default async function KnowledgeBasePage({ params }: Props) {
  const { locale } = await params;
  const list = await fetchArticleList(locale, 1, PAGE_LIMIT);

  return (
    <KnowledgeBaseClient
      initialArticles={list?.items}
      initialPagination={list?.pagination}
    />
  );
}

export { KnowledgeBaseInner };
