import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { buildSeoMetadata } from "@/lib/seo";
import { fetchPageMetadata, resolveMetaField } from "@/lib/fetchPageMetadata";
import VerifyEmailForm from "@/components/VerifyEmailForm";
import { AuthAside, AuthShell } from "@/components/site/AuthShell";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const dynamic = await fetchPageMetadata("verify-email");
  return buildSeoMetadata({
    locale,
    path: "auth/verify-email",
    title: resolveMetaField(
      dynamic,
      locale,
      "title",
      t("auth.verifyEmailTitle"),
    ),
    description: resolveMetaField(
      dynamic,
      locale,
      "description",
      t("auth.verifyEmailDescription"),
    ),
    keywords: resolveMetaField(
      dynamic,
      locale,
      "keywords",
      t("auth.verifyEmailKeywords"),
    ),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "noindex, nofollow",
  });
}

/** No heading here: the outcome is the heading, and it arrives from the
 *  verification call inside the form. */
export default async function VerifyEmailPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site.auth.verify" });

  return (
    <AuthShell
      aside={
        <AuthAside
          visual="verify"
          title={t("asideTitle")}
          points={[t("pointA"), t("pointB"), t("pointC")]}
        />
      }
    >
      <Suspense fallback={<div className="h-64" aria-hidden />}>
        <VerifyEmailForm />
      </Suspense>
    </AuthShell>
  );
}
