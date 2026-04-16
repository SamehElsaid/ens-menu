import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import FooterSection from "@/components/HomePage/Footer";
import LegalDocumentView, {
  type LegalDocument,
} from "@/components/Legal/LegalDocumentView";
import { buildSeoMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildSeoMetadata({
    locale,
    path: "terms-and-conditions",
    title: t("legalTerms.title"),
    description: t("legalTerms.description"),
    keywords: t("legalTerms.keywords"),
    siteName: t("siteName"),
    robots: "index, follow",
  });
}

export default async function TermsAndConditionsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legalPages" });
  const doc = t.raw("terms") as LegalDocument;

  return (
    <>
      <LegalDocumentView
        doc={doc}
        backToHome={t("backToHome")}
        locale={locale}
      />
      <FooterSection />
    </>
  );
}
