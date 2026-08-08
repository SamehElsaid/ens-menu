import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LegalView, {
  type LegalDocument,
} from "@/components/site/legal/LegalView";
import { formatLegalUpdatedLabel } from "@/components/Legal/formatLegalUpdatedLabel";
import { buildSeoMetadata } from "@/lib/seo";
import { fetchPageMetadata, resolveMetaField } from "@/lib/fetchPageMetadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const dynamic = await fetchPageMetadata("privacy-policy");
  return buildSeoMetadata({
    locale,
    path: "privacy-policy",
    title: resolveMetaField(dynamic, locale, "title", t("legalPrivacy.title")),
    description: resolveMetaField(
      dynamic,
      locale,
      "description",
      t("legalPrivacy.description"),
    ),
    keywords: resolveMetaField(
      dynamic,
      locale,
      "keywords",
      t("legalPrivacy.keywords"),
    ),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "index, follow",
  });
}

export default async function PrivacyPolicyPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legalPages" });
  const doc = t.raw("privacy") as LegalDocument;

  return (
    <LegalView
      doc={doc}
      backToHome={t("backToHome")}
      updatedLabel={formatLegalUpdatedLabel(locale, t("updatedPrefix"))}
      tocLabel={t("tocLabel")}
      contactCta={t("contactCta")}
    />
  );
}
