import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildSeoMetadata } from "@/lib/seo";
import { fetchPageMetadata, resolveMetaField } from "@/lib/fetchPageMetadata";
import RegisterPageView from "@/components/Auth/RegisterPageView";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const dynamic = await fetchPageMetadata("register");
  return buildSeoMetadata({
    locale,
    path: "auth/register",
    title: resolveMetaField(dynamic, locale, "title", t("auth.registerTitle")),
    description: resolveMetaField(dynamic, locale, "description", t("auth.registerDescription")),
    keywords: resolveMetaField(dynamic, locale, "keywords", t("auth.registerKeywords")),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "noindex, nofollow",
  });
}

export default async function RegisterIndexPage({ params }: Props) {
  const { locale } = await params;
  return <RegisterPageView locale={locale} />;
}
