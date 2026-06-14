import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { buildSeoMetadata } from "@/lib/seo";
import CustomLogo from "@/components/Custom/CustomLogo";
import LoginForm from "@/components/LoginForm";
import Card from "@/components/ui/Card";
import { axiosGet } from "@/shared/axiosCall";

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

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  const promo = await axiosGet<{ data: { text: string; boolean: boolean } }>("/promo", locale);
  const rawText = (promo.status && promo.data?.data?.text) ? promo.data.data.text : "";
  const promoEnabled = (promo.status && promo.data?.data?.boolean) ?? false;

  let promoText = rawText;
  try {
    const parsed = JSON.parse(rawText) as { ar?: string; en?: string };
    promoText = (locale === "ar" ? parsed.ar : parsed.en) ?? rawText;
  } catch {
    // plain string fallback
  }

  return (
    <div className=" bg-gradient-app overflow-hidden py-12 px-4 sm:px-6 lg:px-8 relative  flex items-center justify-center">
      <div className="container flex items-center justify-center ">
        <div className="rounded-md!   mt-16 min-h-[calc(100dvh-140px)] w-full flex items-center justify-center">
          <div className="flex gap-10  w-full flex-col lg:flex-row ">

            <div className=" max-w-[500px]  mx-auto relative">
              <Card className="md:w-[400px]!  bg-transparent! md:bg-white! dark:md:bg-[#0d1117]! shadow-none! md:shadow-md! dark:bg-[#0d1117]! ">
                <div className="relative z-10 flex flex-col h-full  w-full px-6 py-8">
                  {promoEnabled && promoText && (
                    <div className="rounded-lg border border-purple-200 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-500/10 px-4 py-3 text-sm text-purple-800 dark:text-purple-300 text-start mb-4 space-y-1">
                      {promoText.split("\n").filter((line) => line.trim()).map((line, i) => (
                        <p key={i}>- {line.trim()}</p>
                      ))}
                    </div>
                  )}
                  <div className="flex-1 flex flex-col max-w-[400px] mx-auto w-full">
                    <div className="mb-10 text-center">
                      <h2 className="text-2xl text-royal-purple dark:text-purple-300 mb-2">
                        {t("welcomeBack")}
                      </h2>
                      <p className="text-slate-500 dark:text-slate-400">
                        {t("welcomeBackDescription")}
                      </p>
                    </div>
                    <Suspense fallback={null}>
                      <LoginForm />
                    </Suspense>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}