import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildSeoMetadata } from "@/lib/seo";
import CountdownLaunch from "@/components/mobile-app/CountdownLaunch";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildSeoMetadata({
    locale,
    path: "mobile-app",
    title: t("mobileAppPage.title"),
    description: t("mobileAppPage.description"),
    keywords: t("mobileAppPage.keywords"),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "index, follow",
  });
}

export default async function MobileAppPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <CountdownLaunch />
    </div>
  );
}
