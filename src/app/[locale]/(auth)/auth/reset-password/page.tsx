import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { buildSeoMetadata } from "@/lib/seo";
import { fetchPageMetadata, resolveMetaField } from "@/lib/fetchPageMetadata";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import { AuthAside, AuthShell } from "@/components/site/AuthShell";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const dynamic = await fetchPageMetadata("reset-password");
  return buildSeoMetadata({
    locale,
    path: "auth/reset-password",
    title: resolveMetaField(
      dynamic,
      locale,
      "title",
      t("auth.resetPasswordTitle"),
    ),
    description: resolveMetaField(
      dynamic,
      locale,
      "description",
      t("auth.resetPasswordDescription"),
    ),
    keywords: resolveMetaField(
      dynamic,
      locale,
      "keywords",
      t("auth.resetPasswordKeywords"),
    ),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "noindex, nofollow",
  });
}

/** One route, two screens: request a link, or set the new password once the
 *  emailed link supplies a token. The heading has to say which. */
export default async function ResetPasswordPage({
  params,
  searchParams,
}: Props) {
  const { locale } = await params;
  const { token } = await searchParams;
  const t = await getTranslations({ locale, namespace: "site.auth.reset" });
  const hasToken = Boolean(token?.trim());

  return (
    <AuthShell
      title={hasToken ? t("setTitle") : t("title")}
      description={hasToken ? t("setDescription") : t("description")}
      aside={
        <AuthAside
          visual="reset"
          title={t("asideTitle")}
          points={[t("pointA"), t("pointB"), t("pointC")]}
        />
      }
    >
      <Suspense fallback={<div className="h-64" aria-hidden />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
