import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ContactView from "@/components/site/contact/ContactView";
import { buildSeoMetadata } from "@/lib/seo";
import { fetchPageMetadata, resolveMetaField } from "@/lib/fetchPageMetadata";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const dynamic = await fetchPageMetadata("contact");
  return buildSeoMetadata({
    locale,
    path: "contact",
    title: resolveMetaField(dynamic, locale, "title", t("contactPage.title")),
    description: resolveMetaField(
      dynamic,
      locale,
      "description",
      t("contactPage.description"),
    ),
    keywords: resolveMetaField(
      dynamic,
      locale,
      "keywords",
      t("contactPage.keywords"),
    ),
    coreKeywords: t("coreKeywords"),
    siteName: t("siteName"),
    robots: "index, follow",
  });
}

export default function ContactPage() {
  return <ContactView />;
}
