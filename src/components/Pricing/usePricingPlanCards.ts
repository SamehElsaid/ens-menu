"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { translatePlanFeaturesWithMenuLimit } from "@/lib/planFeatureI18n";
import {
  CUSTOM_CARD_FEATURE_KEYS,
  STATIC_FREE_PLAN,
  STATIC_PRO_PLAN,
  STATIC_PRO_YEARLY_USD,
  WHATSAPP_URL,
} from "./pricingStaticPlans";

export type PricingPlanCardCta = {
  href: string;
  label: string;
  external: boolean;
};

export type PricingPlanCard = {
  id: string;
  title: string;
  desc: string;
  price: string;
  priceNote: string | null;
  features: string[];
  premium: boolean;
  cta: PricingPlanCardCta;
};

export function usePricingPlanCards() {
  const t = useTranslations("PricingPage");
  const tLanding = useTranslations("Landing.pricing");
  const tProfile = useTranslations("personalProfile");

  const freeFeatures = useMemo(
    () =>
      translatePlanFeaturesWithMenuLimit(
        [t("staticFreeFeature1"), t("staticFreeFeature2")],
        STATIC_FREE_PLAN.maxMenus,
        tProfile,
      ),
    [t, tProfile],
  );

  const proFeatures = useMemo(() => {
    const base = translatePlanFeaturesWithMenuLimit(
      [
        t("staticProFeature1"),
        t("staticProFeature2"),
        t("staticProFeature3"),
      ],
      STATIC_PRO_PLAN.maxMenus,
      tProfile,
    );
    return [
      ...base,
      tLanding("proExtraFeatures.staffSystem"),
      tLanding("proExtraFeatures.tablesSystem"),
      t("proStaffMobileAppBullet"),
    ];
  }, [tProfile, tLanding, t]);

  const cards: PricingPlanCard[] = useMemo(
    () => [
      {
        id: "free",
        title: tLanding("planFree"),
        desc: t("staticFreeDescription"),
        price: `0${tLanding("currencyUsd")}`,
        priceNote: tLanding("perYear"),
        features: freeFeatures,
        premium: false,
        cta: {
          href: "/auth/register",
          label: t("ctaRegister"),
          external: false,
        },
      },
      {
        id: "pro",
        title: tLanding("planPro"),
        desc: t("staticProDescription"),
        price: `${STATIC_PRO_YEARLY_USD}${tLanding("currencyUsd")}`,
        priceNote: tLanding("perYear"),
        features: proFeatures,
        premium: true,
        cta: {
          href: "/auth/register",
          label: t("ctaUpgrade"),
          external: false,
        },
      },
      {
        id: "custom",
        title: tLanding("planCustom"),
        desc: tLanding("customDescription"),
        price: tLanding("customPrice"),
        priceNote: null,
        features: CUSTOM_CARD_FEATURE_KEYS.map((k) =>
          tLanding(`customFeatures.${k}`),
        ),
        premium: false,
        cta: { href: WHATSAPP_URL, label: t("ctaContact"), external: true },
      },
    ],
    [freeFeatures, proFeatures, t, tLanding],
  );

  return {
    cards,
    title: tLanding("title"),
    popularLabel: tLanding("popular"),
  };
}
