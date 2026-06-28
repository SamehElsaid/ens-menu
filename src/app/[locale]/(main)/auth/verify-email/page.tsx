import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildSeoMetadata } from "@/lib/seo";
import CustomLogo from "@/components/Custom/CustomLogo";
import VerifyEmailForm from "@/components/VerifyEmailForm";
import Card from "@/components/ui/Card";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildSeoMetadata({
    locale,
    path: "auth/verify-email",
    title: t("auth.verifyEmailTitle"),
    description: t("auth.verifyEmailDescription"),
    keywords: t("auth.verifyEmailKeywords"),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "noindex, nofollow",
  });
}

export default function VerifyEmailPage() {
  return (
    <div className="bg-gradient-app relative flex items-center justify-center overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
      <div className="container flex items-center justify-center">
        <div className="mt-16 flex min-h-[calc(100dvh-140px)] w-full items-center justify-center rounded-md!">
          <div className="flex w-full flex-col gap-10 lg:flex-row">
            <div className="pointer-events-none fixed inset-0 overflow-hidden bg-white dark:bg-[#0d1117]">
              <div
                className="particle particle-drift-slow bg-accent-purple top-[-5%] right-[-10%] h-64 w-64 rounded-full"
                style={{ opacity: "0.08" }}
              />
              <div
                className="particle particle-drift-medium bg-deep-indigo top-[60%] left-[-5%] h-48 w-48 rounded-full"
                style={{ opacity: "0.05" }}
              />
            </div>
            <div className="relative mx-auto max-w-[500px]">
              <Card className="bg-transparent! shadow-none! md:w-[400px]! md:bg-white! md:shadow-md! dark:bg-[#0d1117]! dark:md:bg-[#0d1117]!">
                <div className="relative z-10 flex h-full w-full flex-col px-6 py-8">
                  <CustomLogo />
                  <div className="mx-auto mt-8 flex w-full max-w-[400px] flex-1 flex-col">
                    <VerifyEmailForm />
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
