import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildSeoMetadata } from "@/lib/seo";
import CustomLogo from "@/components/Custom/CustomLogo";
import Card from "@/components/ui/Card";
import { useTranslations } from "next-intl";
import StaffLoginForm from "@/components/StaffLoginForm";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildSeoMetadata({
    locale,
    path: "auth/staff-login",
    title: t("auth.staffLoginTitle"),
    description: t("auth.staffLoginDescription"),
    keywords: t("auth.staffLoginKeywords"),
    siteName: t("siteName"),
    robots: "noindex, nofollow",
  });
}

export default function StaffLoginPage() {
  const t = useTranslations("");

  return (
    <div className=" bg-gradient-app overflow-hidden py-12 px-4 sm:px-6 lg:px-8 relative  flex items-center justify-center">
      <div className="container flex items-center justify-center ">
        <div className="rounded-md!   mt-16 min-h-[calc(100dvh-140px)] w-full flex items-center justify-center">
          <div className="flex gap-10  w-full flex-col lg:flex-row ">
            <div className="fixed inset-0 overflow-hidden bg-white pointer-events-none dark:bg-[#0d1117]   ">
              <div
                className="particle particle-drift-slow w-64 h-64 bg-accent-purple rounded-full top-[-5%] right-[-10%]"
                style={{ opacity: "0.08" }}
              />
              <div
                className="particle particle-drift-medium w-48 h-48 bg-deep-indigo rounded-full top-[60%] left-[-5%]"
                style={{ opacity: "0.05" }}
              />
            </div>
            <div className=" max-w-[500px]  mx-auto relative">
              <Card className="md:w-[400px]!  bg-transparent! md:bg-white! dark:md:bg-[#0d1117]! shadow-none! md:shadow-md! dark:bg-[#0d1117]! ">
                <div className="relative z-10 flex flex-col h-full  w-full px-6 py-8">
                  <CustomLogo />
                  <div className="flex-1 flex flex-col max-w-[400px] mx-auto w-full">
                    <div className="mb-10 text-center">
                      <h2 className="text-2xl text-royal-purple dark:text-purple-300 mb-2">
                        {t("auth.staffLoginHeading")}
                      </h2>
                      <p className="text-slate-500 dark:text-slate-400">
                        {t("auth.staffLoginSubheading")}
                      </p>
                    </div>
                    <StaffLoginForm />
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
