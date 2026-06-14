import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildSeoMetadata } from "@/lib/seo";
import RegisterPageView from "@/components/Auth/RegisterPageView";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildSeoMetadata({
    locale,
    path: "auth/register",
    title: t("auth.registerTitle"),
    description: t("auth.registerDescription"),
    keywords: t("auth.registerKeywords"),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "noindex, nofollow",
  });
}

export default async function RegisterIndexPage({ params }: Props) {
  const { locale } = await params;
  return <RegisterPageView locale={locale} />;
}
