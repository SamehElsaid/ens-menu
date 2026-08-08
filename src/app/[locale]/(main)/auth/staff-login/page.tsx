import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildSeoMetadata } from "@/lib/seo";
import { fetchPageMetadata, resolveMetaField } from "@/lib/fetchPageMetadata";
import AuthPanel from "@/components/Auth/AuthPanel";
import { useTranslations } from "next-intl";
import StaffLoginForm from "@/components/StaffLoginForm";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const dynamic = await fetchPageMetadata("staff-login");
  return buildSeoMetadata({
    locale,
    path: "auth/staff-login",
    title: resolveMetaField(dynamic, locale, "title", t("auth.staffLoginTitle")),
    description: resolveMetaField(dynamic, locale, "description", t("auth.staffLoginDescription")),
    keywords: resolveMetaField(dynamic, locale, "keywords", t("auth.staffLoginKeywords")),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "noindex, nofollow",
  });
}

export default function StaffLoginPage() {
  const t = useTranslations("");

  return (
    <AuthPanel
      title={t("auth.staffLoginHeading")}
      description={t("auth.staffLoginSubheading")}
    >
      <StaffLoginForm />
    </AuthPanel>
  );
}
