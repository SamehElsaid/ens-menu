import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildSeoMetadata } from "@/lib/seo";
import { fetchPageMetadata, resolveMetaField } from "@/lib/fetchPageMetadata";
import RegisterForm from "@/components/RegisterForm";
import { AuthAside, AuthShell } from "@/components/site/AuthShell";
import LinkTo from "@/components/Global/LinkTo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const dynamic = await fetchPageMetadata("register");
  return buildSeoMetadata({
    locale,
    path: "auth/register",
    title: resolveMetaField(dynamic, locale, "title", t("auth.registerTitle")),
    description: resolveMetaField(
      dynamic,
      locale,
      "description",
      t("auth.registerDescription"),
    ),
    keywords: resolveMetaField(
      dynamic,
      locale,
      "keywords",
      t("auth.registerKeywords"),
    ),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "noindex, nofollow",
  });
}

export default async function RegisterPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site.auth.register" });

  return (
    <AuthShell
      width="wide"
      title={t("title")}
      description={t("description")}
      aside={
        <AuthAside
          visual="register"
          title={t("asideTitle")}
          points={[t("pointA"), t("pointB"), t("pointC")]}
        />
      }
      footer={
        <p>
          {t("haveAccount")}{" "}
          <LinkTo
            href="/auth/login"
            className="font-semibold text-site-brand underline underline-offset-4 hover:text-site-brand-hover"
          >
            {t("signIn")}
          </LinkTo>
        </p>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
