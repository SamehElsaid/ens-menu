import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildSeoMetadata } from "@/lib/seo";
import { fetchPageMetadata, resolveMetaField } from "@/lib/fetchPageMetadata";
import VerifyEmailForm from "@/components/VerifyEmailForm";
import AuthPanel from "@/components/Auth/AuthPanel";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const dynamic = await fetchPageMetadata("verify-email");
  return buildSeoMetadata({
    locale,
    path: "auth/verify-email",
    title: resolveMetaField(dynamic, locale, "title", t("auth.verifyEmailTitle")),
    description: resolveMetaField(dynamic, locale, "description", t("auth.verifyEmailDescription")),
    keywords: resolveMetaField(dynamic, locale, "keywords", t("auth.verifyEmailKeywords")),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "noindex, nofollow",
  });
}

export default function VerifyEmailPage() {
  return (
    <AuthPanel>
      <VerifyEmailForm />
    </AuthPanel>
  );
}
