import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildSeoMetadata } from "@/lib/seo";
import CustomLogo from "@/components/Custom/CustomLogo";
import LoginForm from "@/components/LoginForm";
import Card from "@/components/ui/Card";
import { useTranslations } from "next-intl";

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

export default function LoginPage() {
  const t = useTranslations("");

  return (
    <div className=" bg-gradient-app overflow-hidden py-12 px-4 sm:px-6 lg:px-8 relative  flex items-center justify-center">
      <div className="container flex items-center justify-center ">
        <div className="rounded-md!   mt-16 min-h-[calc(100dvh-140px)] w-full flex items-center justify-center">
          <div className="flex gap-10  w-full flex-col lg:flex-row ">
           
            <div className=" max-w-[500px]  mx-auto relative">
              <Card className="md:w-[400px]!  bg-transparent! md:bg-white! dark:md:bg-[#0d1117]! shadow-none! md:shadow-md! dark:bg-[#0d1117]! ">
                <div className="relative z-10 flex flex-col h-full  w-full px-6 py-8">
                  <div className="flex-1 flex flex-col max-w-[400px] mx-auto w-full">
                    <div className="mb-10 text-center">
                      <h2 className="text-2xl text-royal-purple dark:text-purple-300 mb-2">
                        {t("auth.welcomeBack")}
                      </h2>
                      <p className="text-slate-500 dark:text-slate-400">
                        {t("auth.welcomeBackDescription")}
                      </p>
                    </div>
                    <LoginForm />
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
