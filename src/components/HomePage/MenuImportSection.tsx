import { getTranslations } from "next-intl/server";
import { buildCtaMenuItems } from "@/lib/mockDemoProducts";
import MenuImportStory from "@/components/HomePage/MenuImportStory";
import { MarketingAccent, MarketingBadge, MarketingSection } from "@/components/marketing";
import { ds } from "@/lib/designSystem";
import { isRtlLocale } from "@/lib/localeDirection";

type MenuImportSectionProps = {
  locale: string;
};

export default async function MenuImportSection({
  locale,
}: MenuImportSectionProps) {
  const t = await getTranslations({ locale, namespace: "menuImportSection" });
  const isRtl = isRtlLocale(locale);

  const items = buildCtaMenuItems(
    {
      item1: t("visual.item1"),
      item2: t("visual.item2"),
      item3: t("visual.item3"),
    },
    isRtl,
  ).map(({ name, price, image }) => ({ name, price, image }));

  const steps = [1, 2, 3, 4, 5].map((n) => ({
    title: t(`steps.${n}.title`),
    caption: t(`steps.${n}.caption`),
  }));

  const highlightOrder = ["rocket", "photos", "ai", "clock"] as const;
  const highlights = highlightOrder.map((icon) => ({
    text: t(`highlights.${icon}`),
    icon,
  }));

  return (
    <MarketingSection
      id="menu-import"
      variant="default"
      className="menu-import-section !pb-12 !pt-5 sm:!pb-14 sm:!pt-7 lg:!pb-16"
    >
      <div className="container max-w-7xl">
        <header className="mx-auto mb-5 max-w-4xl text-center sm:mb-7">
          <MarketingBadge className="mb-3 justify-center sm:mb-4">
            {t("badge")}
          </MarketingBadge>

          <h2
            className={`${ds.type.sectionTitle} text-[1.6rem] leading-tight sm:text-[1.9rem] lg:text-[2.25rem]`}
          >
            {t("title1")}{" "}
            <MarketingAccent>{t("title2")}</MarketingAccent>
          </h2>

          <p className="mx-auto mt-2.5 max-w-2xl text-[15px] leading-relaxed text-slate-500 sm:mt-3 sm:text-base dark:text-slate-400">
            {t("subtitle")}
          </p>
        </header>

        <MenuImportStory
          steps={steps}
          items={items}
          uploadProgressLabel={t("visual.uploading")}
          uploadCompleteLabel={t("visual.uploadComplete")}
          processingLabel={t("visual.processing")}
          processingCompleteLabel={t("visual.processingComplete")}
          extractProgressLabel={t("visual.extracting")}
          extractCompleteLabel={t("visual.extractComplete")}
          qrDownloadLabel={t("visual.qrDownload")}
          liveBadgeLabel={t("visual.liveBadge")}
          newOrderLabel={t("visual.newOrder")}
          scanToOrderLabel={t("visual.scanToOrder")}
          highlights={highlights}
        />
      </div>
    </MarketingSection>
  );
}
