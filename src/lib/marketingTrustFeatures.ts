import { getTranslations } from "next-intl/server";
import {
  MARKETING_TRUST_FEATURE_IDS,
  type MarketingTrustFeature,
} from "@/lib/marketingTrustFeatureIds";

export async function getMarketingTrustFeatures(
  locale: string,
): Promise<MarketingTrustFeature[]> {
  const t = await getTranslations({ locale, namespace: "marketingTrustFeatures" });

  return MARKETING_TRUST_FEATURE_IDS.map((id) => ({
    id,
    title: t(`${id}.title`),
  }));
}
