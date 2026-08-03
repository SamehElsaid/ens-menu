import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { buildSeoMetadata } from "@/lib/seo";
import { getSiteOrigin } from "@/lib/sitemap/data";
import JsonLd from "@/components/Global/JsonLd";
import { KnowledgeBaseInner } from "../KnowledgeBaseClient";
import {
  fetchArticleDetail,
  fetchArticleList,
  stripHtml,
  PAGE_LIMIT,
} from "../fetchKb";

type Props = { params: Promise<{ locale: string; slug: string }> };

function extractIdFromSlug(slug: string): number | undefined {
  const match = slug.match(/(\d+)$/);
  return match ? Number(match[1]) : undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const id = slug ? extractIdFromSlug(slug) : undefined;

  const article = id ? await fetchArticleDetail(id, locale) : null;

  if (!article) {
    return { robots: { index: false, follow: false } };
  }

  const title =
    locale === "ar" && article.titleAr
      ? article.titleAr
      : (article.titleEn ?? t("knowledgeBasePage.title"));

  const rawDescription =
    locale === "ar" && article.descriptionAr
      ? article.descriptionAr
      : (article.descriptionEn ?? "");

  const description = rawDescription
    ? stripHtml(rawDescription)
    : t("knowledgeBasePage.description");

  return buildSeoMetadata({
    locale,
    path: `knowledge-base/${slug}`,
    title,
    description,
    keywords: t("knowledgeBasePage.keywords"),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "index, follow",
  });
}

function buildArticleJsonLd({
  locale,
  slug,
  title,
  description,
  createdAt,
  updatedAt,
}: {
  locale: string;
  slug: string;
  title: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}) {
  const siteOrigin = getSiteOrigin();
  const articleUrl =
    locale === "ar"
      ? `${siteOrigin}/knowledge-base/${slug}`
      : `${siteOrigin}/en/knowledge-base/${slug}`;
  const homeUrl = locale === "ar" ? `${siteOrigin}/` : `${siteOrigin}/en`;
  const kbUrl =
    locale === "ar"
      ? `${siteOrigin}/knowledge-base`
      : `${siteOrigin}/en/knowledge-base`;

  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${articleUrl}#article`,
      headline: title,
      description,
      datePublished: createdAt,
      dateModified: updatedAt || createdAt,
      inLanguage: locale,
      mainEntityOfPage: articleUrl,
      author: {
        "@type": "Organization",
        "@id": `${siteOrigin}/#organization`,
      },
      publisher: { "@id": `${siteOrigin}/#organization` },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: locale === "ar" ? "الرئيسية" : "Home",
          item: homeUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: locale === "ar" ? "قاعدة المعرفة" : "Knowledge Base",
          item: kbUrl,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: title,
          item: articleUrl,
        },
      ],
    },
  ];
}

export default async function KnowledgeBaseArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  const id = slug ? extractIdFromSlug(slug) : undefined;

  if (!id) notFound();

  const [article, list] = await Promise.all([
    fetchArticleDetail(id, locale),
    fetchArticleList(locale, 1, PAGE_LIMIT),
  ]);

  if (!article) notFound();

  const title =
    locale === "ar" && article.titleAr ? article.titleAr : article.titleEn;
  const rawDescription =
    locale === "ar" && article.descriptionAr
      ? article.descriptionAr
      : article.descriptionEn;

  return (
    <>
      <JsonLd
        data={buildArticleJsonLd({
          locale,
          slug,
          title,
          description: stripHtml(rawDescription || ""),
          createdAt: article.createdAt,
          updatedAt: article.updatedAt,
        })}
      />
      <KnowledgeBaseInner
        initialId={id}
        initialArticle={article}
        initialArticles={list?.items}
        initialPagination={list?.pagination}
      />
    </>
  );
}
