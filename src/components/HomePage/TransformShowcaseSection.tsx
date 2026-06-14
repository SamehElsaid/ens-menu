import { getTranslations } from "next-intl/server";
import { buildCtaMenuItems } from "@/lib/mockDemoProducts";
import MenuImportStory from "@/components/HomePage/MenuImportStory";
import TransformBeforeAfter from "@/components/HomePage/TransformBeforeAfter";
import {
  MarketingAccent,
  MarketingBadge,
  MarketingSection,
  MarketingTrustFeatures,
} from "@/components/marketing";
import { getMarketingTrustFeatures } from "@/lib/marketingTrustFeatures";
import { ds } from "@/lib/designSystem";
import { isRtlLocale } from "@/lib/localeDirection";

const FLOW_STEP_KEYS = [1, 2, 3, 4, 5, 6] as const;
const BEFORE_ITEM_KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
const AFTER_ITEM_KEYS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

type TransformShowcaseSectionProps = {
  locale: string;
};

export default async function TransformShowcaseSection({
  locale,
}: TransformShowcaseSectionProps) {
  const t = await getTranslations({ locale, namespace: "transformSection" });
  const isRtl = isRtlLocale(locale);
  const trustFeatures = await getMarketingTrustFeatures(locale);

  const items = buildCtaMenuItems(
    {
      item1: t("visual.item1"),
      item2: t("visual.item2"),
      item3: t("visual.item3"),
    },
    isRtl,
  ).map(({ name, price, image }) => ({ name, price, image }));

  const steps = FLOW_STEP_KEYS.map((n) => ({
    title: t(`steps.${n}.title`),
    caption: t(`steps.${n}.caption`),
  }));

  const beforeItems = BEFORE_ITEM_KEYS.map((n) => t(`before.items.${n}`));
  const afterItems = AFTER_ITEM_KEYS.map((n) => t(`after.items.${n}`));

  return (
    <MarketingSection
      id="transform"
      variant="default"
      className="transform-section overflow-visible!"
    >
      <div className="home-section-shell">
        <header className="mx-auto mb-6 max-w-3xl text-center sm:mb-8">
          <MarketingBadge className="mb-3 justify-center sm:mb-4">
            {t("badge")}
          </MarketingBadge>

          <h2
            className={`${ds.type.sectionTitle} text-[1.65rem] leading-tight sm:text-[1.95rem] lg:text-[2.35rem]`}
          >
            {t("titleBefore")}{" "}
            <MarketingAccent>{t("titleAfter")}</MarketingAccent>
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-500 sm:text-base dark:text-slate-400">
            {t("subtitle")}
          </p>
        </header>

        <TransformBeforeAfter
          beforeLabel={t("before.label")}
          afterLabel={t("after.label")}
          beforeItems={beforeItems}
          afterItems={afterItems}
          beforeFooter={t("before.footer")}
          afterFooter={t("after.footer")}
          paperMenuAlt={t("visual.paperMenuAlt")}
          restaurantName={t("visual.restaurantName")}
          menuItems={items}
          addLabel={t("visual.add")}
        />

        <div className="mt-8 sm:mt-10">
          <h3 className="mb-3 text-center text-sm font-semibold tracking-wide text-slate-700 sm:mb-5 dark:text-slate-300">
            {t("flowTitle")}
          </h3>
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
            notificationLabel={t("visual.notification")}
            tableLabel={t("visual.tableLabel")}
            statusNewLabel={t("visual.statusNew")}
            orderItemsLabel={t("visual.orderItemsLabel")}
          />
        </div>

        <div className="mt-8 sm:mt-10">
          <MarketingTrustFeatures
            features={trustFeatures}
            variant="light"
            columns={3}
          />
        </div>
      </div>
    </MarketingSection>
  );
}
