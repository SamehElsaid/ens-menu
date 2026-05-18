import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildSeoMetadata } from "@/lib/seo";
import HeroSection from "@/components/mobile-app/HeroApp";
import TemplateDescription from "@/components/mobile-app/TemplateDescription";
import FaqSection from "@/components/mobile-app/FaqApp";
import FeaturesApp from "@/components/mobile-app/FeaturesApp";
import WorkflowApp from "@/components/mobile-app/WorkflowApp";
import FooterSection from "@/components/HomePage/Footer";
import PricingSection from "@/components/HomePage/PricingSection";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildSeoMetadata({
    locale,
    path: "mobile-app",
    title: t("mobileAppPage.title"),
    description: t("mobileAppPage.description"),
    keywords: t("mobileAppPage.keywords"),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "index, follow",
  });
}

export default async function MobileAppPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "Landing.MobileAppCta",
  });

  return (
    <main className="min-h-screen bg-white dark:bg-[#0d1117]">
      <HeroSection />
      <WorkflowApp />

      <FeaturesApp />
      <FaqSection />

      <TemplateDescription />

      <PricingSection />

      {/* CTA Footer */}
      <footer className="py-20 text-center bg-slate-50 dark:bg-slate-900/50">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          {t("title")}
        </h2>
        <a
          href="https://expo.dev/artifacts/eas/iXgE6EHRgCGLqf8HwRek6R.apk"
          className="inline-block px-12 py-4 bg-purple-600 text-white rounded-full font-bold shadow-xl hover:bg-purple-700 transition-all"
        >
          {t("button")}
        </a>
      </footer>
      <FooterSection />
    </main>
  );
}
