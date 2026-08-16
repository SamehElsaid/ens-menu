"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { SET_AUTH_SESSION_CACHE } from "@/store/authSlice/authSlice";
import { HiOutlineArrowRight } from "react-icons/hi";
import {
  Badge,
  ConfirmDialog,
  PageShell,
  SectionHeader,
} from "@/components/ui";
import { axiosGet, axiosPost } from "@/shared/axiosCall";
import { performAuthLogout } from "@/shared/authLogout";
import { resolveAuthMeSession } from "@/shared/resolveAuthMeSession";
import { toast } from "react-toastify";
import {
  formatPhoneForPaymentGateway,
  pickFailedRequestMessage,
} from "@/lib/subscriptionPayment";
import type { Plan, PlansResponse } from "@/types/Plan";
import type { PlanCapabilities } from "@/types/PlanCapabilities";
import {
  DEFAULT_CUSTOM_CAPABILITIES,
  normalizePlanCapabilities,
} from "@/types/PlanCapabilities";
import CurrentPlanSummary from "@/components/Dashboard/CurrentPlanSummary";
import PageTitleWithHelp from "@/components/Dashboard/PageTitleWithHelp";
import SubscriptionPlanCard, {
  CustomSubscriptionPlanCard,
  SubscriptionPlanCardSkeleton,
} from "@/components/Dashboard/SubscriptionPlanCard";
import SubscriptionPaymentMethods from "@/components/Dashboard/SubscriptionPaymentMethods";
import SubscriptionManagePanel from "@/components/Dashboard/SubscriptionManagePanel";
import { RequirePhone } from "@/components/Dashboard/RequirePhone";
import type { Menu, MenusResponse } from "@/types/Menu";
import { isProSubscription } from "@/lib/subscriptionMenus";
import {
  buildPricingComparisonRows,
  comparisonRowsToPlanFeatures,
} from "@/lib/pricingComparison";
import type { Subscription, SubscriptionResponse } from "@/types/Subscription";
import type { VoucherValidationResult } from "@/types/Voucher";
import {
  clearPaymentAttempt,
  getPaymentAttemptKey,
} from "@/lib/paymentIdempotency";

const WHATSAPP_URL = "https://wa.me/201500800050";

type AuthUser = {
  name?: string;
  email?: string;
  phoneNumber?: string;
  restaurantName?: string | null;
  isPhoneVerified?: boolean;
  role?: string;
  user?: {
    subscription?: {
      planName?: string;
    };
  };
};

const EMPTY_AUTH_USER: AuthUser = {};

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
  const tPricingPage = useTranslations("PricingPage");
  const searchParams = useSearchParams();

  const authData = useAppSelector((state) => state.auth.data) as {
    user?: AuthUser;
  } | null;
  const profile = useMemo(
    () => authData?.user ?? EMPTY_AUTH_USER,
    [authData?.user],
  );

  const isAdmin = profile?.role === "admin";

  const [plans, setPlans] = useState<Plan[]>([]);
  const [customDisplay, setCustomDisplay] = useState<PlanCapabilities>(
    DEFAULT_CUSTOM_CAPABILITIES,
  );
  const [plansLoading, setPlansLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState<Subscription | null>(
    null,
  );
  const [subscriptionInfoLoading, setSubscriptionInfoLoading] = useState(true);
  const [proBillingChoice, setProBillingChoice] = useState<
    "monthly" | "yearly"
  >("monthly");
  const [proPayLoading, setProPayLoading] = useState(false);
  const [downgradeModalOpen, setDowngradeModalOpen] = useState(false);
  const [downgradeLoading, setDowngradeLoading] = useState(false);
  const [phoneGateOpen, setPhoneGateOpen] = useState(() =>
    Boolean(searchParams.get("verifyReference")),
  );
  const [appliedVoucherCode, setAppliedVoucherCode] = useState<string | null>(
    null,
  );
  const [voucherValidation, setVoucherValidation] =
    useState<VoucherValidationResult | null>(null);
  const [voucherRedeemLoading, setVoucherRedeemLoading] = useState(false);
  const [renewExtraMenusCount, setRenewExtraMenusCount] = useState(0);
  const [menusUsed, setMenusUsed] = useState<number | null>(null);
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
          const nextSubscription = res.data.subscription;
          setSubscriptionInfo(nextSubscription);
          const nextExtraMenus = Number(nextSubscription.extraMenus ?? 0);
          if (Number.isFinite(nextExtraMenus) && nextExtraMenus >= 0) {
            setRenewExtraMenusCount(nextExtraMenus);
          }
          const nextCycle = String(
            nextSubscription.billingCycle ?? "",
          ).toLowerCase();
          if (nextCycle === "monthly" || nextCycle === "yearly") {
            setProBillingChoice(nextCycle);
          }
        } else {
          setSubscriptionInfo(null);
        }
      })
      .finally(() => setSubscriptionInfoLoading(false));

    axiosGet<PlansResponse>("/user/plans", locale)
      .then((res) => {
        if (res.status && res.data?.plans?.length) {
          setPlans(res.data.plans);
          setCustomDisplay(
            normalizePlanCapabilities(
              res.data.customDisplay,
              DEFAULT_CUSTOM_CAPABILITIES,
            ),
          );
        }
      })
      .finally(() => setPlansLoading(false));

    void axiosGet<MenusResponse | Menu[]>("/menus", locale).then((res) => {
      if (res.status && res.data) {
        const menus = Array.isArray(res.data)
          ? res.data
          : (res.data.menus ?? []);
        setMenusUsed(menus.length);
      }
    });
  }, [locale, authData?.user, isAdmin]);

  const freePlanRow = useMemo(
    () => plans.find((p) => p.name?.toLowerCase() === "free"),
    [plans],
  );
  const proPlanRow = useMemo(
    () => plans.find((p) => p.name?.toLowerCase() === "pro"),
    [plans],
  );

  const pricingComparisonRows = useMemo(
    () =>
      buildPricingComparisonRows({
        t: tPricingPage,
        tLanding: tLandingPricing,
        freePlan: freePlanRow
          ? {
              maxMenus: freePlanRow.maxMenus,
              allowCustomDomain: freePlanRow.allowCustomDomain,
              capabilities: freePlanRow.capabilities,
            }
          : null,
        proPlan: proPlanRow
          ? {
              maxMenus: proPlanRow.maxMenus,
              allowCustomDomain: proPlanRow.allowCustomDomain,
              capabilities: proPlanRow.capabilities,
            }
          : null,
        customDisplay,
      }),
    [tPricingPage, tLandingPricing, freePlanRow, proPlanRow, customDisplay],
  );

  const planFeaturesByKey = useMemo(
    () => ({
      free: comparisonRowsToPlanFeatures(pricingComparisonRows, "free"),
      pro: comparisonRowsToPlanFeatures(pricingComparisonRows, "pro"),
      custom: comparisonRowsToPlanFeatures(pricingComparisonRows, "custom"),
    }),
    [pricingComparisonRows],
  );

  const planDescriptionsByKey = useMemo(
    () => ({
      free: tPricingPage("staticFreeDescription"),
      pro: tPricingPage("staticProDescription"),
      custom: tLandingPricing("customDescription"),
    }),
    [tPricingPage, tLandingPricing],
  );
  const isCurrentCustomPlan = Boolean(
    profile?.user?.subscription?.planName &&
    String(profile.user.subscription.planName).toLowerCase().includes("custom"),
  );

  const currentPlanNameResolved =
    subscriptionInfo?.planName ?? profile?.user?.subscription?.planName ?? "";

  const isProUser = isProSubscription({
    planName: currentPlanNameResolved,
  });

  const proPlan =
    plans.find((p) => String(p.name).toLowerCase() === "pro") ?? null;

  const currentPlanIndex = plans.findIndex(
    (p) =>
      String(p.name).toLowerCase() ===
      String(currentPlanNameResolved).toLowerCase(),
  );
  const proPlanIndex = plans.findIndex(
    (p) => String(p.name).toLowerCase() === "pro",
  );
  const canUpgradeToPro =
    currentPlanIndex >= 0 &&
    proPlanIndex > currentPlanIndex &&
    proPlanIndex >= 0;

  const hasDiscountVoucher =
    Boolean(appliedVoucherCode) &&
    voucherValidation?.voucher.type === "discount";
  const hasDurationVoucher =
    Boolean(appliedVoucherCode) &&
    voucherValidation?.voucher.type === "duration";

  const voucherDiscountedPrice = hasDiscountVoucher
    ? (voucherValidation?.discountedPrice ?? null)
    : null;
  const voucherDiscountAmount = hasDiscountVoucher
    ? (voucherValidation?.discountAmount ?? null)
    : null;
  const voucherDurationHint =
    hasDurationVoucher && canUpgradeToPro ? t("voucherUseRedeemButton") : null;

  const activeSubscriptionBillingCycle = (() => {
    const cycle = String(subscriptionInfo?.billingCycle ?? "").toLowerCase();
    if (cycle === "yearly") return "yearly" as const;
    if (cycle === "monthly") return "monthly" as const;
    return null;
  })();

  const canRenewPro = subscriptionInfo?.canRenewPro === true;

  const handleProBillingChange = useCallback((cycle: "monthly" | "yearly") => {
    setProBillingChoice(cycle);
    setAppliedVoucherCode(null);
    setVoucherValidation(null);
  }, []);

  const handleVoucherApplied = useCallback(
    (code: string, result: VoucherValidationResult | null) => {
      setAppliedVoucherCode(code || null);
      setVoucherValidation(result);
    },
    [setAppliedVoucherCode, setVoucherValidation],
  );

  const refreshSubscriptionState = useCallback(async () => {
    const subRes = await axiosGet<SubscriptionResponse>(
      "/user/subscription",
      locale,
    );
    if (subRes.status && subRes.data?.subscription) {
      const nextSubscription = subRes.data.subscription;
      setSubscriptionInfo(nextSubscription);
      const nextExtraMenus = Number(nextSubscription.extraMenus ?? 0);
      if (Number.isFinite(nextExtraMenus) && nextExtraMenus >= 0) {
        setRenewExtraMenusCount(nextExtraMenus);
      }
      const nextCycle = String(
        nextSubscription.billingCycle ?? "",
      ).toLowerCase();
      if (nextCycle === "monthly" || nextCycle === "yearly") {
        setProBillingChoice(nextCycle);
      }
    } else {
      setSubscriptionInfo(null);
    }
    const meResult = await resolveAuthMeSession(locale);
    if (meResult.outcome === "logout") {
      await performAuthLogout();
      return;
    }
    if (meResult.outcome === "user") {
      dispatch(SET_AUTH_SESSION_CACHE({ user: meResult.user }));
    }
  }, [
    locale,
    dispatch,
    setSubscriptionInfo,
    setRenewExtraMenusCount,
    setProBillingChoice,
  ]);

  const handleRedeemDurationVoucher = useCallback(async () => {
    if (!appliedVoucherCode) return;
    setVoucherRedeemLoading(true);
    const res = await axiosPost<
      { code: string },
      { success?: boolean; data?: { extended?: boolean }; message?: string }
    >("/vouchers/redeem-duration", locale, { code: appliedVoucherCode });
    setVoucherRedeemLoading(false);
    if (res?.status) {
      toast.success(
        res.data?.data?.extended
          ? t("voucherRedeemExtended")
          : t("voucherRedeemSuccess"),
      );
      setAppliedVoucherCode(null);
      setVoucherValidation(null);
      await refreshSubscriptionState();
      return;
    }
    const serverMsg = pickFailedRequestMessage(res?.data as unknown);
    toast.error(serverMsg ?? t("voucherInvalid"));
  }, [
    appliedVoucherCode,
    locale,
    t,
    refreshSubscriptionState,
    setVoucherRedeemLoading,
    setAppliedVoucherCode,
    setVoucherValidation,
  ]);

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
  }, [
    locale,
    t,
    refreshSubscriptionState,
    setDowngradeLoading,
    setDowngradeModalOpen,
  ]);

  const needsPhoneGateForPayment = useCallback(() => {
    const hasPhone = Boolean(profile?.phoneNumber?.trim());
    const hasRestaurantName = Boolean(profile?.restaurantName?.trim());
    const isPhoneVerified = profile?.isPhoneVerified === true;
    return !hasPhone || !hasRestaurantName || !isPhoneVerified;
  }, [profile?.phoneNumber, profile?.restaurantName, profile?.isPhoneVerified]);

  const initiateProPayment = useCallback(
    async (
      userOverride?: AuthUser,
      options?: { renew?: boolean; extraMenus?: number },
    ) => {
      const isRenew = options?.renew === true;
      const activeUser = userOverride ?? profile;
      const hasPhone = Boolean(activeUser?.phoneNumber?.trim());
      const hasRestaurantName = Boolean(activeUser?.restaurantName?.trim());
      const isPhoneVerified = activeUser?.isPhoneVerified === true;

      if (!userOverride) {
        if (!hasPhone || !hasRestaurantName || !isPhoneVerified) {
          setPhoneGateOpen(true);
          return;
        }
      } else if (!hasPhone || !hasRestaurantName || !isPhoneVerified) {
        return;
      }

      const nameToSend =
        (typeof activeUser?.name === "string" ? activeUser.name.trim() : "") ||
        "";
      const rawPhone =
        typeof activeUser?.phoneNumber === "string"
          ? activeUser.phoneNumber.trim()
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
      const payload = {
        name: nameToSend,
        email: activeUser?.email?.trim() || undefined,
        mobile: phoneToSend,
        currency: "EGP",
        ...(isRenew
          ? {
              renew: true,
              extraMenus: options?.extraMenus ?? renewExtraMenusCount,
            }
          : {}),
        ...(appliedVoucherCode && voucherValidation?.voucher.type === "discount"
          ? { voucherCode: appliedVoucherCode }
          : {}),
      };
      const idempotencyKey = getPaymentAttemptKey(
        "subscription",
        JSON.stringify({ endpoint, ...payload }),
      );
      setProPayLoading(true);
      const res = await axiosPost<
        {
          name: string;
          email?: string;
          mobile: string;
          currency?: string;
          voucherCode?: string;
          renew?: boolean;
          extraMenus?: number;
        },
        {
          success?: boolean;
          data?: {
            redirectUrl?: string | null;
            amount?: number;
            order_id?: string;
            currency?: string;
            subscriptionActivated?: boolean;
          };
        }
      >(endpoint, locale, payload, undefined, undefined, {
        headers: { "Idempotency-Key": idempotencyKey },
      });
      setProPayLoading(false);
      if (res?.status && res.data?.data?.subscriptionActivated) {
        clearPaymentAttempt("subscription");
        toast.success(t("voucherRedeemSuccess"));
        setAppliedVoucherCode(null);
        setVoucherValidation(null);
        await refreshSubscriptionState();
        return;
      }
      if (res?.status && res.data?.data?.redirectUrl) {
        const amount = Number(res.data.data.amount);
        const currency = res.data.data.currency || "EGP";
        sessionStorage.setItem(
          "gtm_pending_purchase",
          JSON.stringify({
            ...(Number.isFinite(amount) && amount > 0 ? { value: amount } : {}),
            currency,
            orderId: res.data.data.order_id,
            scope: "subscription",
          }),
        );
        toast.info(t("paying"));
        window.location.href = res.data.data.redirectUrl;
        return;
      }
      const serverMsg = pickFailedRequestMessage(res?.data as unknown);
      toast.error(serverMsg ?? t("payProError"));
    },
    [
      locale,
      proBillingChoice,
      profile,
      t,
      appliedVoucherCode,
      voucherValidation,
      refreshSubscriptionState,
      renewExtraMenusCount,
      setPhoneGateOpen,
      setProPayLoading,
      setAppliedVoucherCode,
      setVoucherValidation,
    ],
  );

  const handleRenewPro = useCallback(async () => {
    if (needsPhoneGateForPayment()) {
      setPhoneGateOpen(true);
      return;
    }
    await initiateProPayment(undefined, {
      renew: true,
      extraMenus: renewExtraMenusCount,
    });
  }, [
    needsPhoneGateForPayment,
    initiateProPayment,
    renewExtraMenusCount,
    setPhoneGateOpen,
  ]);

  const handleUpgradeToPro = useCallback(async () => {
    if (hasDurationVoucher) {
      return;
    }
    if (needsPhoneGateForPayment()) {
      setPhoneGateOpen(true);
      return;
    }
    await initiateProPayment();
  }, [
    needsPhoneGateForPayment,
    initiateProPayment,
    hasDurationVoucher,
    setPhoneGateOpen,
  ]);

  const handlePhoneVerifiedForPayment = useCallback(async () => {
    const meResult = await resolveAuthMeSession(locale);
    if (meResult.outcome === "logout") {
      await performAuthLogout();
      return;
    }
    if (meResult.outcome !== "user") {
      return;
    }

    const freshUser = meResult.user as AuthUser;
    dispatch(SET_AUTH_SESSION_CACHE({ user: freshUser }));

    if (freshUser.isPhoneVerified !== true) {
      return;
    }

    setPhoneGateOpen(false);
    if (canRenewPro) {
      await initiateProPayment(freshUser, {
        renew: true,
        extraMenus: renewExtraMenusCount,
      });
    } else {
      await initiateProPayment(freshUser);
    }
  }, [
    locale,
    dispatch,
    initiateProPayment,
    canRenewPro,
    renewExtraMenusCount,
    setPhoneGateOpen,
  ]);

  if (isAdmin) {
    return null;
  }

  return (
    <>
      {phoneGateOpen && (
        <RequirePhone
          enforce
          requireVerification
          variant="modal"
          onVerified={handlePhoneVerifiedForPayment}
          onCancel={() => setPhoneGateOpen(false)}
        />
      )}
      <PageShell
        kind="wide"
        header={
          <PageTitleWithHelp
            eyebrow={t("planPro")}
            title={t("subscriptionPageTitle")}
            description={t("subscriptionPageDescription")}
            breadcrumbs={
              backLink
                ? [
                    { label: backLinkText, href: backLink },
                    { label: t("subscriptionPageTitle") },
                  ]
                : undefined
            }
            breadcrumbsLabel={t("subscriptionPageTitle")}
            meta={
              currentPlanNameResolved ? (
                <Badge tone="accent" dot size="md">
                  {currentPlanNameResolved}
                </Badge>
              ) : null
            }
          />
        }
      >
        <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
          <CurrentPlanSummary
            subscriptionInfo={subscriptionInfo}
            loading={subscriptionInfoLoading}
            currentPlanName={currentPlanNameResolved}
            menusUsed={menusUsed}
          />

          <SubscriptionManagePanel
            locale={locale}
            isRTL={isRTL}
            subscription={subscriptionInfo}
            menusUsed={menusUsed}
            proPlan={proPlan}
            isProUser={isProUser}
            canRenewPro={canRenewPro}
            canUpgradeToPro={canUpgradeToPro}
            proBillingChoice={proBillingChoice}
            onProBillingChange={handleProBillingChange}
            renewExtraMenusCount={renewExtraMenusCount}
            onRenewExtraMenusChange={setRenewExtraMenusCount}
            appliedVoucherCode={appliedVoucherCode}
            voucherValidation={voucherValidation}
            onVoucherApplied={handleVoucherApplied}
            onRenew={() => void handleRenewPro()}
            onUpgrade={() => void handleUpgradeToPro()}
            onRedeemDuration={() => void handleRedeemDurationVoucher()}
            onRequirePhone={() => setPhoneGateOpen(true)}
            loading={proPayLoading}
            voucherRedeemLoading={voucherRedeemLoading}
            currencyLabel={tLandingPricing("currencyEgp")}
          />
        </div>

        {/* No card around the comparison: the plan columns are themselves the
            panels, and wrapping three ruled cards in a fourth just adds a
            frame the reader has to look past. */}
        <section
          id="onboarding-subscription-plans"
          className="flex flex-col gap-4"
        >
          <SectionHeader
            ruled
            eyebrow={t("comparePlansTitle")}
            title={t("comparePlansTitle")}
            description={t("comparePlansDescription")}
          />

          {plansLoading ? (
            <div className="grid gap-3 md:grid-cols-3 md:items-stretch">
              {[1, 2, 3].map((i) => (
                <SubscriptionPlanCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div
              className={`grid gap-3 md:grid-cols-3 md:items-stretch ${isRTL ? "md:grid-flow-dense" : ""}`}
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
                  const isCurrentPlanBool = Boolean(
                    currentPlanName &&
                    planKey === String(currentPlanName).toLowerCase(),
                  );
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
                  const showProBilling = false;
                  const canRenewOnCard = false;
                  const showUpgradeOnCard = false;

                  const planDisplayName =
                    planKey === "free"
                      ? t("planFree")
                      : planKey === "pro"
                        ? t("planPro")
                        : plan.name;

                  const features = isProPlan
                    ? planFeaturesByKey.pro
                    : isFreePlan
                      ? planFeaturesByKey.free
                      : planFeaturesByKey.custom;

                  const planDescription =
                    planDescriptionsByKey[
                      planKey as keyof typeof planDescriptionsByKey
                    ] ?? plan.description;

                  const upgradeLabel = isProPlan
                    ? proBillingChoice === "monthly"
                      ? t("upgradeToProMonthlyCta")
                      : t("upgradeToProYearlyCta")
                    : t("upgrade");

                  const renewLabel = isProPlan
                    ? proBillingChoice === "monthly"
                      ? t("renewProMonthlyCta")
                      : t("renewProYearlyCta")
                    : t("renewSubscriptionCta");

                  return (
                    <SubscriptionPlanCard
                      key={plan.id}
                      plan={{ ...plan, description: planDescription }}
                      planDisplayName={planDisplayName}
                      features={features}
                      isRTL={isRTL}
                      isCurrentPlan={isCurrentPlanBool}
                      isMostPopular={isMostPopular}
                      isProPlan={isProPlan}
                      isFreePlan={isFreePlan}
                      showProBilling={showProBilling}
                      proBillingChoice={proBillingChoice}
                      onProBillingChange={handleProBillingChange}
                      canUpgrade={showUpgradeOnCard}
                      canDowngrade={canDowngrade}
                      canRenew={canRenewOnCard}
                      proPayLoading={proPayLoading}
                      downgradeLoading={downgradeLoading}
                      renewLoading={proPayLoading}
                      onUpgrade={() => void handleUpgradeToPro()}
                      onDowngrade={() => setDowngradeModalOpen(true)}
                      onRenew={() => void handleRenewPro()}
                      upgradeLabel={upgradeLabel}
                      downgradeLabel={t("downgrade")}
                      renewLabel={renewLabel}
                      payingLabel={t("paying")}
                      downgradingLabel={t("downgrading")}
                      currentPlanLabel={t("currentPlan")}
                      mostPopularLabel={t("mostPopular")}
                      freePriceLabel={t("freePrice")}
                      contactForDetailsLabel={t("contactForDetails")}
                      contactWhatsAppLabel={t("contactWhatsApp")}
                      currencyEgp={tLandingPricing("currencyEgp")}
                      voucherDiscountedPrice={
                        isProPlan && canUpgrade ? voucherDiscountedPrice : null
                      }
                      voucherDiscountAmount={
                        isProPlan && canUpgrade ? voucherDiscountAmount : null
                      }
                      voucherDurationHint={
                        isProPlan && canUpgrade ? voucherDurationHint : null
                      }
                      activeBillingCycle={
                        isProPlan && isCurrentPlanBool
                          ? activeSubscriptionBillingCycle
                          : null
                      }
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
                customPlanFeatures={planFeaturesByKey.custom}
                planDescription={planDescriptionsByKey.custom}
                whatsappUrl={WHATSAPP_URL}
                className={isRTL ? "md:col-start-1" : ""}
              />
            </div>
          )}
        </section>

        <SubscriptionPaymentMethods />

        <ConfirmDialog
          open={downgradeModalOpen}
          onClose={() => setDowngradeModalOpen(false)}
          onConfirm={handleConfirmDowngrade}
          title={t("downgradeConfirmTitle")}
          description={t("downgradeConfirmBody")}
          confirmLabel={
            downgradeLoading ? t("downgrading") : t("downgradeConfirm")
          }
          cancelLabel={tRoot("form.cancel")}
          loading={downgradeLoading}
          tone="danger"
          icon={
            <HiOutlineArrowRight
              className={`h-6 w-6 ${isRTL ? "rotate-180" : ""}`}
            />
          }
        />
      </PageShell>
    </>
  );
}
