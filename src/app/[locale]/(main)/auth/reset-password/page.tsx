import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildSeoMetadata } from "@/lib/seo";
import { fetchPageMetadata, resolveMetaField } from "@/lib/fetchPageMetadata";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import AuthPanel from "@/components/Auth/AuthPanel";
import { useTranslations } from "next-intl";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const dynamic = await fetchPageMetadata("reset-password");
  return buildSeoMetadata({
    locale,
    path: "auth/reset-password",
    title: resolveMetaField(dynamic, locale, "title", t("auth.resetPasswordTitle")),
    description: resolveMetaField(dynamic, locale, "description", t("auth.resetPasswordDescription")),
    keywords: resolveMetaField(dynamic, locale, "keywords", t("auth.resetPasswordKeywords")),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "noindex, nofollow",
  });
}

export default function ResetPasswordPage() {
  const t = useTranslations("");

  return (
    <AuthPanel
      title={t("auth.resetPasswordTitle")}
      description={t("auth.resetPasswordDescription")}
    >
      <ResetPasswordForm />
    </AuthPanel>
  );
}
