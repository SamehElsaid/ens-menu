import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildSeoMetadata } from "@/lib/seo";
import { fetchPageMetadata, resolveMetaField } from "@/lib/fetchPageMetadata";
import StaffLoginForm from "@/components/StaffLoginForm";
import { AuthAside, AuthShell } from "@/components/site/AuthShell";
import LinkTo from "@/components/Global/LinkTo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const dynamic = await fetchPageMetadata("staff-login");
  return buildSeoMetadata({
    locale,
    path: "auth/staff-login",
    title: resolveMetaField(
      dynamic,
      locale,
      "title",
      t("auth.staffLoginTitle"),
    ),
    description: resolveMetaField(
      dynamic,
      locale,
      "description",
      t("auth.staffLoginDescription"),
    ),
    keywords: resolveMetaField(
      dynamic,
      locale,
      "keywords",
      t("auth.staffLoginKeywords"),
    ),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "noindex, nofollow",
  });
}

export default async function StaffLoginPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site.auth.staff" });
  const tAuth = await getTranslations({ locale, namespace: "auth" });

  return (
    <AuthShell
      title={t("title")}
      description={t("description")}
      aside={
        <AuthAside
          visual="staff"
          title={t("asideTitle")}
          points={[t("pointA"), t("pointB"), t("pointC")]}
        />
      }
      footer={
        <p>
          <LinkTo
            href="/auth/login"
            className="font-semibold text-site-brand underline underline-offset-4 hover:text-site-brand-hover"
          >
            {tAuth("ownerLoginLink")}
          </LinkTo>
        </p>
      }
    >
      <StaffLoginForm />
    </AuthShell>
  );
}
