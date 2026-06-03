"use client";

import { useState, useCallback, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { SET_ACTIVE_USER } from "@/store/authSlice/authSlice";
import { HiOutlineArrowRight } from "react-icons/hi";
import { IoCloseOutline } from "react-icons/io5";
import LinkTo from "@/components/Global/LinkTo";
import { axiosGet, axiosPost } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import {
  formatPhoneForPaymentGateway,
  pickFailedRequestMessage,
} from "@/lib/subscriptionPayment";
import type { Plan, PlansResponse } from "@/types/Plan";
import CurrentPlanSummary from "@/components/Dashboard/CurrentPlanSummary";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import SubscriptionPlanCard, {
  CustomSubscriptionPlanCard,
  SubscriptionPlanCardSkeleton,
} from "@/components/Dashboard/SubscriptionPlanCard";
import SubscriptionPaymentMethods from "@/components/Dashboard/SubscriptionPaymentMethods";
import { translatePlanFeaturesWithMenuLimit } from "@/lib/planFeatureI18n";
import type { Subscription, SubscriptionResponse } from "@/types/Subscription";

const WHATSAPP_URL = "https://wa.me/201500800050";

const CUSTOM_PLAN_FEATURE_KEYS = [
  "waiterRequest",
  "billRequest",
  "onlineOrdering",
  "deliveryMaps",
  "newLanguages",
  "onlinePayment",
] as const;

type AuthUser = {
  name?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  user?: {
    subscription?: {
      planName?: string;
    };
  };
};

type SubscriptionPlansSectionProps = {
  backLink?: string;
  backLinkText?: string;
};

export default function SubscriptionPlansSection({
  backLink,
  backLinkText,
}: SubscriptionPlansSectionProps) {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations("personalProfile");
  const tRoot = useTranslations("");
  const tLandingPricing = useTranslations("Landing.pricing");

  const authData = useAppSelector((state) => state.auth.data) as unknown as {
    user: AuthUser;
  };
  const user = authData ?? ({} as { user: AuthUser });
  const profile = user?.user ?? ({} as AuthUser);

  const isAdmin = (authData?.user as AuthUser | undefined)?.role === "admin";

  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState<Subscription | null>(
    null,
  );
  const [subscriptionInfoLoading, setSubscriptionInfoLoading] = useState(true);
  const [proBillingChoice, setProBillingChoice] = useState<
    "monthly" | "yearly"
  >("yearly");
  const [proPayLoading, setProPayLoading] = useState(false);
  const [downgradeModalOpen, setDowngradeModalOpen] = useState(false);
  const [downgradeLoading, setDowngradeLoading] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!authData?.user || isAdmin) {
      queueMicrotask(() => {
        setPlansLoading(false);
        setSubscriptionInfoLoading(false);
      });
      return;
    }

    queueMicrotask(() => {
      setSubscriptionInfoLoading(true);
    });
    void axiosGet<SubscriptionResponse>("/user/subscription", locale)
      .then((res) => {
        if (res.status && res.data?.subscription) {
          setSubscriptionInfo(res.data.subscription);
        } else {
          setSubscriptionInfo(null);
        }
      })
      .finally(() => setSubscriptionInfoLoading(false));

    axiosGet<PlansResponse>("/user/plans", locale)
      .then((res) => {
        if (res.status && res.data?.plans?.length) {
          setPlans(res.data.plans);
        }
      })
      .finally(() => setPlansLoading(false));
  }, [locale, authData?.user, isAdmin]);

  const customPlanFeatures = CUSTOM_PLAN_FEATURE_KEYS.map((key) =>
    tRoot("Landing.pricing.customFeatures." + key),
  );
  const isCurrentCustomPlan = Boolean(
    profile?.user?.subscription?.planName &&
    String(profile.user.subscription.planName).toLowerCase().includes("custom"),
  );

  const currentPlanNameResolved =
    subscriptionInfo?.planName ?? profile?.user?.subscription?.planName ?? "";

  const refreshSubscriptionState = useCallback(async () => {
    const subRes = await axiosGet<SubscriptionResponse>(
      "/user/subscription",
      locale,
    );
    if (subRes.status && subRes.data?.subscription) {
      setSubscriptionInfo(subRes.data.subscription);
    } else {
      setSubscriptionInfo(null);
    }
    const meRes = await axiosGet<{ user?: Record<string, unknown> }>(
      "/auth/me",
      locale,
    );
    if (meRes.status && meRes.data?.user) {
      dispatch(SET_ACTIVE_USER({ user: meRes.data.user }));
    }
  }, [locale, dispatch]);

  const handleConfirmDowngrade = useCallback(async () => {
    setDowngradeLoading(true);
    const res = await axiosPost<Record<string, never>, { message?: string }>(
      "/user/subscription/downgrade-to-free",
      locale,
      {},
    );
    setDowngradeLoading(false);
    if (res?.status) {
      toast.success(t("downgradeSuccess"));
      setDowngradeModalOpen(false);
      await refreshSubscriptionState();
      return;
    }
    const serverMsg = pickFailedRequestMessage(res?.data as unknown);
    toast.error(serverMsg ?? t("downgradeError"));
  }, [locale, t, refreshSubscriptionState]);

  const handleUpgradeToPro = useCallback(async () => {
    const nameToSend =
      (typeof profile?.name === "string" ? profile.name.trim() : "") || "";
    const rawPhone =
      typeof profile?.phoneNumber === "string"
        ? profile.phoneNumber.trim()
        : "";
    const phoneToSend = formatPhoneForPaymentGateway(rawPhone);
    if (!nameToSend || !phoneToSend) {
      toast.error(t("payProError"));
      return;
    }
    const endpoint =
      proBillingChoice === "monthly"
        ? "/payment/subscription/pro-monthly/initiate"
        : "/payment/subscription/pro-yearly/initiate";
    setProPayLoading(true);
    const res = await axiosPost<
      { name: string; email?: string; mobile: string; currency?: string },
      {
        success?: boolean;
        data?: {
          redirectUrl?: string;
          amount?: number;
          order_id?: string;
          currency?: string;
        };
      }
    >(endpoint, locale, {
      name: nameToSend,
      email: profile?.email?.trim() || undefined,
      mobile: phoneToSend,
      currency: "EGP",
    });
    setProPayLoading(false);
    if (res?.status && res.data?.data?.redirectUrl) {
      const amount = Number(res.data.data.amount);
      const currency = res.data.data.currency || "EGP";
      if (Number.isFinite(amount) && amount > 0) {
        sessionStorage.setItem(
          "gtm_pending_purchase",
          JSON.stringify({
            value: amount,
            currency,
            orderId: res.data.data.order_id,
          }),
        );
      }
      toast.info(t("paying"));
      window.location.href = res.data.data.redirectUrl;
      return;
    }
    const serverMsg = pickFailedRequestMessage(res?.data as unknown);
    toast.error(serverMsg ?? t("payProError"));
  }, [
    locale,
    proBillingChoice,
    profile?.name,
    profile?.email,
    profile?.phoneNumber,
    t,
  ]);

  if (isAdmin) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-120px)]">
      {backLink && (
        <div className={isRTL ? "text-right mb-4" : "text-left mb-4"}>
          <LinkTo
            href={backLink}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
          >
            <HiOutlineArrowRight
              className={`text-lg ${isRTL ? "order-2 rotate-180" : ""}`}
            />
            {backLinkText}
          </LinkTo>
        </div>
      )}

      <header
        className={
          isRTL ? "text-right space-y-1 mb-8" : "text-left space-y-1 mb-8"
        }
      >
        <PageTitleWithHelp>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
            {t("subscriptionPageTitle")}
          </h1>
        </PageTitleWithHelp>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("subscriptionPageDescription")}
        </p>
      </header>

      <section
        id="onboarding-subscription-plans"
        className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50/80 dark:from-slate-900 dark:to-slate-950 shadow-sm p-5 md:p-8"
      >
        <CurrentPlanSummary
          subscriptionInfo={subscriptionInfo}
          loading={subscriptionInfoLoading}
          currentPlanName={currentPlanNameResolved}
          className="mb-6"
        />

        {plansLoading ? (
          <div className="grid gap-6 md:grid-cols-3 md:items-stretch">
            {[1, 2, 3].map((i) => (
              <SubscriptionPlanCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div
            className={`grid gap-6 md:gap-8 md:grid-cols-3 md:items-stretch ${isRTL ? "md:grid-flow-dense" : ""}`}
          >
            {plans
              .filter(
                (p) =>
                  !String(p.name).toLowerCase().includes("custom") &&
                  (String(p.name).toLowerCase() === "free" ||
                    String(p.name).toLowerCase() === "pro"),
              )
              .map((plan, index) => {
                const currentPlanName = currentPlanNameResolved;
                const planKey = String(plan.name).toLowerCase();
                const isCurrentPlan =
                  currentPlanName &&
                  planKey === String(currentPlanName).toLowerCase();
                const isCustomPlan = planKey.includes("custom");
                const isMostPopular = index === 1 && plans.length > 1;
                const currentPlanIndex = plans.findIndex(
                  (p) =>
                    String(p.name).toLowerCase() ===
                    String(currentPlanName).toLowerCase(),
                );
                const canUpgrade =
                  currentPlanIndex >= 0 &&
                  index > currentPlanIndex &&
                  !isCustomPlan;
                const canDowngrade =
                  currentPlanIndex >= 0 &&
                  index < currentPlanIndex &&
                  !isCustomPlan;
                const rtlCol =
                  isRTL && index === 0
                    ? "md:col-start-3"
                    : isRTL && index === 1
                      ? "md:col-start-2"
                      : "";

                const isProPlan = planKey === "pro";
                const isFreePlan = planKey === "free";
                const showProBilling = isProPlan && canUpgrade;

                const planDisplayName =
                  planKey === "free"
                    ? t("planFree")
                    : planKey === "pro"
                      ? t("planPro")
                      : plan.name;

                const features =
                  planKey === "pro"
                    ? [
                        ...translatePlanFeaturesWithMenuLimit(
                          plan.features,
                          plan.maxMenus,
                          t,
                        ),
                        tLandingPricing("proExtraFeatures.staffSystem"),
                        tLandingPricing("proExtraFeatures.tablesSystem"),
                      ]
                    : translatePlanFeaturesWithMenuLimit(
                        plan.features,
                        plan.maxMenus,
                        t,
                      ).slice(0, 5);

                const upgradeLabel = isProPlan
                  ? proBillingChoice === "monthly"
                    ? t("upgradeToProMonthlyCta")
                    : t("upgradeToProYearlyCta")
                  : t("upgrade");

                return (
                  <SubscriptionPlanCard
                    key={plan.id}
                    plan={plan}
                    planDisplayName={planDisplayName}
                    features={features}
                    isRTL={isRTL}
                    isCurrentPlan={Boolean(isCurrentPlan)}
                    isMostPopular={isMostPopular}
                    isProPlan={isProPlan}
                    isFreePlan={isFreePlan}
                    showProBilling={showProBilling}
                    proBillingChoice={proBillingChoice}
                    onProBillingChange={setProBillingChoice}
                    canUpgrade={canUpgrade}
                    canDowngrade={canDowngrade}
                    proPayLoading={proPayLoading}
                    downgradeLoading={downgradeLoading}
                    onUpgrade={() => void handleUpgradeToPro()}
                    onDowngrade={() => setDowngradeModalOpen(true)}
                    upgradeLabel={upgradeLabel}
                    downgradeLabel={t("downgrade")}
                    payingLabel={t("paying")}
                    downgradingLabel={t("downgrading")}
                    currentPlanLabel={t("currentPlan")}
                    mostPopularLabel={t("mostPopular")}
                    freePriceLabel={t("freePrice")}
                    contactForDetailsLabel={t("contactForDetails")}
                    contactWhatsAppLabel={t("contactWhatsApp")}
                    currencyEgp={tLandingPricing("currencyEgp")}
                    monthlyPriceFormatted={(price) =>
                      t("monthlyPriceFormatted", {
                        price,
                        currency: tLandingPricing("currencyEgp"),
                        perMonth: tLandingPricing("perMonth"),
                      })
                    }
                    yearlyPriceFormatted={(price) =>
                      t("yearlyPriceFormatted", {
                        price,
                        currency: tLandingPricing("currencyEgp"),
                        perYear: tLandingPricing("perYear"),
                      })
                    }
                    className={rtlCol}
                  />
                );
              })}
            <CustomSubscriptionPlanCard
              isRTL={isRTL}
              isCurrentCustomPlan={isCurrentCustomPlan}
              planCustomLabel={t("planCustom")}
              contactForDetailsLabel={t("contactForDetails")}
              customPriceLabel={tLandingPricing("customPrice")}
              contactWhatsAppLabel={t("contactWhatsApp")}
              currentPlanLabel={t("currentPlan")}
              customPlanFeatures={customPlanFeatures}
              whatsappUrl={WHATSAPP_URL}
              className={isRTL ? "md:col-start-1" : ""}
            />
          </div>
        )}
      </section>

      <SubscriptionPaymentMethods className="mt-6" />

      {downgradeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
          onClick={(e) =>
            e.target === e.currentTarget &&
            !downgradeLoading &&
            setDowngradeModalOpen(false)
          }
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="downgrade-plan-title"
            className="bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl max-w-md w-full p-6 md:p-7 border border-slate-200 dark:border-slate-700 animate-[fadeIn_0.25s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <HiOutlineArrowRight
                className={`h-6 w-6 ${isRTL ? "rotate-180" : ""}`}
              />
            </div>
            <div
              className={`flex items-center justify-between mb-4 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <h2
                id="downgrade-plan-title"
                className="text-lg font-bold text-slate-900 dark:text-slate-100"
              >
                {t("downgradeConfirmTitle")}
              </h2>
              <button
                type="button"
                onClick={() =>
                  !downgradeLoading && setDowngradeModalOpen(false)
                }
                disabled={downgradeLoading}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                aria-label={tRoot("common.close")}
              >
                <IoCloseOutline className="text-xl" />
              </button>
            </div>
            <p
              className={`text-sm text-slate-600 dark:text-slate-400 mb-6 ${isRTL ? "text-right" : "text-left"}`}
            >
              {t("downgradeConfirmBody")}
            </p>
            <div
              className={`flex gap-3 ${isRTL ? "flex-row-reverse justify-start" : "justify-end"}`}
            >
              <button
                type="button"
                onClick={() => setDowngradeModalOpen(false)}
                disabled={downgradeLoading}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                {tRoot("form.cancel")}
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmDowngrade()}
                disabled={downgradeLoading}
                className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
              >
                {downgradeLoading ? t("downgrading") : t("downgradeConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
