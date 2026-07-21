import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { buildSeoMetadata } from "@/lib/seo";
import { encryptDataApi } from "@/shared/encryption";
import { KnowledgeBaseInner } from "../KnowledgeBaseClient";

type Props = { params: Promise<{ locale: string; slug: string }> };

function extractIdFromSlug(slug: string): number | undefined {
  const match = slug.match(/(\d+)$/);
  return match ? Number(match[1]) : undefined;
}

interface ArticleDetail {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

async function fetchArticle(
  id: number,
  locale: string,
): Promise<ArticleDetail | null> {
  try {
    const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;
    if (!secretKey) return null;

    const utcTimestamp = parseFloat((Date.now() / 1000).toFixed(3));
    const apiKey = `${secretKey}///${utcTimestamp}`;
    const apiKeyEncrypt = encryptDataApi(apiKey, secretKey);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/searchInformation/${id}`,
      {
        headers: {
          "X-API-KEY": apiKeyEncrypt,
          "Accept-Language": locale,
        },
        next: { revalidate: 3600 },
      },
    );

    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data as ArticleDetail) ?? null;
  } catch {
    return null;
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const id = slug ? extractIdFromSlug(slug) : undefined;

  const article = id ? await fetchArticle(id, locale) : null;

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

export default async function KnowledgeBaseArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  const id = slug ? extractIdFromSlug(slug) : undefined;

  if (!id) notFound();

  const article = await fetchArticle(id, locale);
  if (!article) notFound();

  return <KnowledgeBaseInner initialId={id} />;
}
