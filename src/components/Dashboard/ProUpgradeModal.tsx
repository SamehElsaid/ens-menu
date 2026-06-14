"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { FaCrown, FaTimes } from "react-icons/fa";
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

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const featureDescriptions: Record<string, string> = {
    tables: t("proFeatureDescription.tables"),
    orders: t("proFeatureDescription.orders"),
    "delivery-orders": t("proFeatureDescription.deliveryOrders"),
    staff: t("proFeatureDescription.staff"),
    advertisements: t("proFeatureDescription.advertisements"),
  };
  const description =
    featureKey && featureDescriptions[featureKey]
      ? featureDescriptions[featureKey]
      : t("proUpgradeDescription");

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#12161f]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pro-upgrade-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute end-3 top-3 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label={t("proUpgradeClose")}
        >
          <FaTimes className="size-4" />
        </button>

        <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600 ring-1 ring-amber-200/60 dark:from-amber-950/50 dark:to-amber-900/30 dark:text-amber-400 dark:ring-amber-800/40">
          <FaCrown className="size-5" aria-hidden />
        </div>

        <h2
          id="pro-upgrade-title"
          className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100"
        >
          {t("proUpgradeTitle")}
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {description}
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <LinkTo
            href={subscriptionHref}
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            {t("proUpgradeCta")}
          </LinkTo>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/60"
          >
            {t("proUpgradeClose")}
          </button>
        </div>
      </div>
    </div>
  );
}
