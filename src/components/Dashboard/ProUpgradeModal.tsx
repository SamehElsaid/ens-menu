"use client";

import { useTranslations } from "next-intl";
import { FaCrown } from "react-icons/fa";
import { Button, Modal, buttonClasses } from "@/components/ui";
import LinkTo from "../Global/LinkTo";

type ProUpgradeModalProps = {
  open: boolean;
  onClose: () => void;
  subscriptionHref: string;
  featureKey?: string;
};

export default function ProUpgradeModal({
  open,
  onClose,
  subscriptionHref,
  featureKey,
}: ProUpgradeModalProps) {
  const t = useTranslations("Dashboard");
  const tCommon = useTranslations("common");

  const featureDescriptions: Record<string, string> = {
    tables: t("proFeatureDescription.tables"),
    orders: t("proFeatureDescription.orders"),
    "delivery-orders": t("proFeatureDescription.deliveryOrders"),
    staff: t("proFeatureDescription.staff"),
    advertisements: t("proFeatureDescription.advertisements"),
    deliveryDistance: t("proFeatureDescription.deliveryDistance"),
  };
  const description =
    featureKey && featureDescriptions[featureKey]
      ? featureDescriptions[featureKey]
      : t("proUpgradeDescription");

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xs"
      title={t("proUpgradeTitle")}
      icon={<FaCrown className="size-4.5" />}
      iconTone="warning"
      closeLabel={tCommon("close")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t("proUpgradeClose")}
          </Button>
          <LinkTo
            href={subscriptionHref}
            onClick={onClose}
            className={buttonClasses({ variant: "primary" })}
          >
            {t("proUpgradeCta")}
          </LinkTo>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-fg-muted">{description}</p>
    </Modal>
  );
}
