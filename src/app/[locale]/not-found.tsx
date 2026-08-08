import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FiArrowLeft } from "react-icons/fi";
import StatusScreen from "@/components/site/StatusScreen";
import { SiteButtonLink } from "@/components/site";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function NotFound() {
  const t = await getTranslations("NotFound");
  const tNav = await getTranslations("header");

  return (
    <StatusScreen code="404" title={t("title")} body={t("body")}>
      <SiteButtonLink href="/" size="lg">
        <FiArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
        {t("backHome")}
      </SiteButtonLink>
      <SiteButtonLink href="/contact" variant="secondary" size="lg">
        {tNav("contact")}
      </SiteButtonLink>
    </StatusScreen>
  );
}
