import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import LoginForm from "@/components/LoginForm";
import { AuthAside, AuthShell } from "@/components/site/AuthShell";
import { Alert } from "@/components/site/Form";
import LinkTo from "@/components/Global/LinkTo";
import { serverGet } from "@/shared/serverApi";
import { buildSeoMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildSeoMetadata({
    locale,
    path: "auth/login",
    title: t("auth.loginTitle"),
    description: t("auth.loginDescription"),
    keywords: t("auth.loginKeywords"),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "noindex, nofollow",
  });
}

/** The promo strip is owner-controlled copy stored as either a plain string or
 *  a `{ ar, en }` blob; both shapes have shipped, so both are read. */
async function getPromo(locale: string) {
  const promo = await serverGet<{ data: { text: string; boolean: boolean } }>(
    "/promo",
    locale,
  );
  const enabled = (promo.status && promo.data?.data?.boolean) ?? false;
  const raw =
    promo.status && promo.data?.data?.text ? promo.data.data.text : "";
  if (!enabled || !raw) return null;

  try {
    const parsed = JSON.parse(raw) as { ar?: string; en?: string };
    return (locale === "ar" ? parsed.ar : parsed.en) ?? raw;
  } catch {
    return raw;
  }
}

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site.auth.login" });
  const promoText = await getPromo(locale);

  return (
    <AuthShell
      title={t("title")}
      description={t("description")}
      aside={
        <AuthAside
          visual="login"
          title={t("asideTitle")}
          points={[t("pointA"), t("pointB"), t("pointC")]}
        />
      }
      footer={
        <p>
          {t("noAccount")}{" "}
          <LinkTo
            href="/auth/register"
            className="font-semibold text-site-brand underline underline-offset-4 hover:text-site-brand-hover"
          >
            {t("createAccount")}
          </LinkTo>
        </p>
      }
    >
      {promoText ? (
        <Alert tone="info" className="mb-6">
          {promoText
            .split("\n")
            .filter((line) => line.trim())
            .map((line) => (
              <p key={line}>{line.trim()}</p>
            ))}
        </Alert>
      ) : null}

      <Suspense fallback={<div className="h-[22rem]" aria-hidden />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
