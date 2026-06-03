"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Controller, Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslations, useLocale } from "next-intl";
import {
  HiOutlinePhone,
  HiOutlineLockClosed,
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlineCreditCard,
  HiOutlineChatAlt2,
} from "react-icons/hi";
import { IoCloseOutline } from "react-icons/io5";
import { FaStore, FaWhatsapp } from "react-icons/fa";
import { ImSpinner8 } from "react-icons/im";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { SET_ACTIVE_USER } from "@/store/authSlice/authSlice";
import { axiosGet, axiosPatch, axiosPost } from "@/shared/axiosCall";
import CustomInput from "@/components/Custom/CustomInput";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  requirePhoneSchema,
  RequirePhoneSchema,
} from "@/schemas/requirePhoneSchema";

let phoneCheckTimeout: ReturnType<typeof setTimeout> | null = null;
let lastCheckedAvailablePhone: string | null = null;

interface RequirePhoneProps {
  children?: ReactNode;
  /** When true, blocks until required profile fields (and optionally verification) are complete. */
  enforce?: boolean;
  /** When true, WhatsApp verification runs after missing profile fields are saved (payment only). */
  requireVerification?: boolean;
  /** "page" = full screen (dashboard gate), "modal" = popup overlay (payment flow). */
  variant?: "page" | "modal";
  /** Called after all requirements succeed (payment flow). */
  onVerified?: () => void;
  /** Called when the user dismisses the payment overlay. */
  onCancel?: () => void;
}

type UserProfile = Record<string, unknown>;
type VerifyKitStartResponse = {
  result?: {
    deeplink?: string;
    reference?: string;
  };
};
type VerifyKitCheckResponse = {
  result?: Record<string, unknown>;
  user?: UserProfile;
  isPhoneVerified?: boolean;
  verified?: boolean;
  status?: string;
};

const VERIFICATION_TIMEOUT_SECONDS = 5 * 60;
const CHECK_INTERVAL_MS = 5000;

function isVerificationSuccess(data?: VerifyKitCheckResponse): boolean {
  const result = data?.result;
  const status = String(data?.status ?? result?.status ?? "").toLowerCase();

  return (
    data?.isPhoneVerified === true ||
    data?.verified === true ||
    data?.user?.isPhoneVerified === true ||
    result?.validationStatus === true ||
    result?.isPhoneVerified === true ||
    result?.verified === true ||
    ["verified", "completed", "success", "approved"].includes(status)
  );
}

export type ProfileGateStatus = "loading" | "complete" | "incomplete";

export function useProfileGateStatus(): ProfileGateStatus {
  const authLoading = useAppSelector((s) => s.auth.loading);
  const authData = useAppSelector((s) => s.auth.data) as
    | {
        user?: {
          phoneNumber?: string | null;
          restaurantName?: string | null;
          role?: string;
        };
      }
    | null;

  const userProfile = authData?.user;
  const authLoaded = authLoading === "yes" && Boolean(userProfile);

  if (!authLoaded) {
    return "loading";
  }

  if (userProfile?.role === "staff" || userProfile?.role === "admin") {
    return "complete";
  }

  const hasPhone = Boolean(userProfile?.phoneNumber?.trim());
  const hasRestaurantName = Boolean(userProfile?.restaurantName?.trim());

  if (!hasPhone || !hasRestaurantName) {
    return "incomplete";
  }

  return "complete";
}

export function RequirePhone({
  children,
  enforce = false,
  requireVerification = false,
  variant = "page",
  onVerified,
  onCancel,
}: RequirePhoneProps) {
  const t = useTranslations("phoneGate");
  const locale = useLocale();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const authLoading = useAppSelector((s) => s.auth.loading);
  const authData = useAppSelector((s) => s.auth.data) as
    | {
      user?: {
        phoneNumber?: string;
        isPhoneVerified?: boolean;
        role?: string;
        name?: string;
        profileImage?: string;
        restaurantName?: string | null;
      } & UserProfile;
    }
    | null;

  const [saving, setSaving] = useState(false);
  const [verificationReference, setVerificationReference] = useState(
    searchParams.get("verifyReference") ?? "",
  );
  const [pendingReference, setPendingReference] = useState("");
  const [deeplink, setDeeplink] = useState("");
  const [startingVerification, setStartingVerification] = useState(false);
  const [startAttempted, setStartAttempted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(VERIFICATION_TIMEOUT_SECONDS);
  const [verificationExpired, setVerificationExpired] = useState(false);

  const userProfile = authData?.user;
  const authLoaded = authLoading === "yes" && Boolean(userProfile);
  const hasPhone = Boolean(userProfile?.phoneNumber?.trim());
  const hasRestaurantName = Boolean(userProfile?.restaurantName?.trim());
  const isPhoneVerified = userProfile?.isPhoneVerified === true;
  const requiresProfileDetails = authLoaded && (!hasPhone || !hasRestaurantName);
  const requiresVerification =
    authLoaded &&
    requireVerification &&
    !requiresProfileDetails &&
    !isPhoneVerified;
  const requiresPhoneGate =
    authLoaded && (requiresProfileDetails || requiresVerification);

  const tAuth = useTranslations("");

  const checkPhoneAvailableDebounced = useCallback(
    (phoneNumber: string): Promise<boolean> =>
      new Promise((resolve) => {
        if (phoneCheckTimeout) clearTimeout(phoneCheckTimeout);
        if (!phoneNumber || !/^\+?[0-9]{8,15}$/.test(phoneNumber)) {
          resolve(true);
          return;
        }
        if (lastCheckedAvailablePhone === phoneNumber) {
          resolve(true);
          return;
        }
        phoneCheckTimeout = setTimeout(async () => {
          phoneCheckTimeout = null;
          const res = await axiosGet<{ isAvailable?: boolean }>(
            "/auth/check-availability",
            locale,
            undefined,
            { phoneNumber },
            true,
          );
          const available =
            res.status === true && res.data?.isAvailable === true;
          if (available) lastCheckedAvailablePhone = phoneNumber;
          resolve(available);
        }, 400);
      }),
    [locale],
  );

  const profileSchema = useMemo(
    () =>
      requirePhoneSchema(tAuth, {
        checkPhoneAvailable: checkPhoneAvailableDebounced,
        requirePhone: authLoaded && !hasPhone,
        requireRestaurantName: authLoaded && !hasRestaurantName,
      }),
    [
      tAuth,
      checkPhoneAvailableDebounced,
      authLoaded,
      hasPhone,
      hasRestaurantName,
    ],
  );

  const {
    control,
    handleSubmit: handleFormSubmit,
    formState: { errors, isValid },
  } = useForm<RequirePhoneSchema>({
    defaultValues: {
      phone: "",
      restaurantName: "",
    },
    resolver: yupResolver(profileSchema) as unknown as Resolver<RequirePhoneSchema>,
    mode: "onChange",
  });

  useEffect(() => {
    if (
      !requireVerification ||
      !requiresVerification ||
      verificationReference ||
      pendingReference ||
      startAttempted
    ) {
      return;
    }

    let cancelled = false;
    const startVerification = async () => {
      setStartingVerification(true);

      const res = await axiosPost<
        { phoneNumber: string; lang: string },
        VerifyKitStartResponse
      >("/verifykit/start", locale, {
        phoneNumber: userProfile?.phoneNumber?.trim() ?? "",
        lang: locale,
      });

      if (cancelled) return;
      setStartingVerification(false);
      setStartAttempted(true);

      const reference = res.data?.result?.reference;
      const nextDeeplink = res.data?.result?.deeplink;

      if (res.status && reference && nextDeeplink) {
        setPendingReference(reference);
        setDeeplink(nextDeeplink);
        return;
      }

      toast.error(t("verificationStartError"));
    };

    void startVerification();

    return () => {
      cancelled = true;
    };
  }, [
    requireVerification,
    requiresVerification,
    verificationReference,
    pendingReference,
    startAttempted,
    locale,
    userProfile?.phoneNumber,
    t,
  ]);

  useEffect(() => {
    if (
      !requireVerification ||
      !requiresVerification ||
      !verificationReference
    ) {
      return;
    }

    const timerId = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timerId);
          setVerificationExpired(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [requireVerification, requiresVerification, verificationReference]);

  useEffect(() => {
    if (
      !requireVerification ||
      !requiresVerification ||
      !verificationReference ||
      verificationExpired
    ) {
      return;
    }

    let cancelled = false;
    let inFlight = false;

    const checkVerification = async () => {
      if (inFlight) return;
      inFlight = true;
      const res = await axiosPost<
        { reference: string },
        VerifyKitCheckResponse
      >("/verifykit/check", locale, { reference: verificationReference });
      inFlight = false;

      if (cancelled) return;

      if (!res.status || !isVerificationSuccess(res.data)) return;

      toast.success(t("verificationSuccess"));
      dispatch(
        SET_ACTIVE_USER({
          ...authData,
          user: {
            ...userProfile,
            ...(res.data?.user ?? {}),
            isPhoneVerified: true,
          },
        } as UserProfile),
      );
      onVerified?.();
    };

    void checkVerification();
    const intervalId = window.setInterval(checkVerification, CHECK_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [
    requireVerification,
    requiresVerification,
    verificationReference,
    verificationExpired,
    locale,
    dispatch,
    authData,
    userProfile,
    t,
    onVerified,
  ]);

  if (!enforce) {
    return <>{children}</>;
  }

  if (!authLoaded) {
    if (variant === "modal") {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <ImSpinner8 className="animate-spin text-3xl text-white" />
        </div>
      );
    }
    return null;
  }

  if (!requiresPhoneGate) {
    if (variant === "modal") {
      return null;
    }
    return <>{children}</>;
  }

  const userName =
    typeof userProfile?.name === "string" ? userProfile.name.split(" ")[0] : "";
  const initial = userName ? userName.charAt(0).toUpperCase() : "U";

  const benefits = [
    { icon: HiOutlineBell, key: "benefit1" },
    { icon: HiOutlineShieldCheck, key: "benefit2" },
    { icon: HiOutlineCreditCard, key: "benefit3" },
  ] as const;
  const formattedTime = `${Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0")}:${(timeLeft % 60).toString().padStart(2, "0")}`;
  const showVerificationRetry =
    verificationExpired ||
    (!verificationReference &&
      startAttempted &&
      !pendingReference &&
      !startingVerification);

  const handleSubmit = handleFormSubmit(async (data) => {
    const nextPhone = hasPhone
      ? userProfile?.phoneNumber?.trim()
      : data.phone?.trim();
    const nextRestaurantName = hasRestaurantName
      ? userProfile?.restaurantName?.trim()
      : data.restaurantName?.trim();
    if (!nextPhone || !nextRestaurantName) return;

    const payload: Record<string, string> = {};
    if (!hasPhone && nextPhone) {
      payload.phoneNumber = nextPhone;
    }
    if (!hasRestaurantName && nextRestaurantName) {
      payload.restaurantName = nextRestaurantName;
      payload.resturantName = nextRestaurantName;
    }
    if (Object.keys(payload).length === 0) return;

    const resolvedPhone = payload.phoneNumber ?? userProfile?.phoneNumber?.trim();
    const resolvedRestaurantName =
      payload.restaurantName ?? userProfile?.restaurantName?.trim();

    setSaving(true);
    const res = await axiosPatch<
      Record<string, string>,
      { user?: UserProfile }
    >("/user/profile", locale, payload);
    setSaving(false);

    if (res?.status && res.data) {
      toast.success(t("successMessage"));
      const updatedUser = (res.data as { user?: UserProfile })?.user ?? {};
      const updatedPhoneVerified =
        updatedUser.isPhoneVerified === true || isPhoneVerified;
      setVerificationReference("");
      setPendingReference("");
      setDeeplink("");
      setVerificationExpired(false);
      setTimeLeft(VERIFICATION_TIMEOUT_SECONDS);
      setStartAttempted(false);
      dispatch(
        SET_ACTIVE_USER({
          ...authData,
          user: {
            ...userProfile,
            ...updatedUser,
            ...(payload.phoneNumber ? { phoneNumber: payload.phoneNumber } : {}),
            ...(payload.restaurantName
              ? { restaurantName: payload.restaurantName }
              : {}),
            isPhoneVerified:
              !payload.phoneNumber &&
              hasPhone &&
              resolvedPhone === userProfile?.phoneNumber?.trim() &&
              updatedPhoneVerified,
          },
        } as UserProfile),
      );
      const profileComplete = Boolean(resolvedPhone && resolvedRestaurantName);
      const isVerifiedAfterSave =
        updatedUser.isPhoneVerified === true ||
        (!payload.phoneNumber && isPhoneVerified);
      if (enforce && profileComplete) {
        if (!requireVerification || isVerifiedAfterSave) {
          onVerified?.();
        }
      }
    } else {
      toast.error(t("errorMessage"));
    }
  });

  const handleOpenWhatsapp = () => {
    const reference = pendingReference || verificationReference;
    if (!deeplink || !reference) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("verifyReference", reference);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setTimeLeft(VERIFICATION_TIMEOUT_SECONDS);
    setVerificationExpired(false);
    setVerificationReference(reference);
    window.open(deeplink, "_blank", "noopener,noreferrer");
  };

  const canOpenWhatsapp = Boolean(
    deeplink && (pendingReference || verificationReference),
  );

  const handleRestartVerification = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("verifyReference");
    router.replace(
      params.toString() ? `${pathname}?${params.toString()}` : pathname,
      { scroll: false },
    );
    setVerificationReference("");
    setPendingReference("");
    setDeeplink("");
    setVerificationExpired(false);
    setTimeLeft(VERIFICATION_TIMEOUT_SECONDS);
    setStartAttempted(false);
  };

  const isModal = variant === "modal";
  const panelPadding = isModal ? "p-6" : "p-8";
  const gateTitle = requiresVerification ? t("verifyTitle") : t("title");
  const gateSubtitle = requiresVerification ? t("verifySubtitle") : t("subtitle");
  const displayPhone = userProfile?.phoneNumber?.trim() ?? "";

  const verificationContent = (
    <div className={isModal ? "space-y-3" : "mb-7 space-y-4"}>
      {isModal && displayPhone && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center dark:border-slate-700 dark:bg-slate-800/60">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {t("verifyPhoneLabel")}
          </p>
          <p className="mt-0.5 text-base font-bold tabular-nums text-slate-800 dir-ltr dark:text-slate-100">
            {displayPhone}
          </p>
        </div>
      )}

      {verificationReference ? (
        <div
          className={`rounded-2xl border text-center ${
            isModal
              ? "border-accent-purple/20 bg-accent-purple/5 px-4 py-5 dark:border-accent-purple/30 dark:bg-accent-purple/10"
              : "border-violet-100 bg-violet-50/70 p-4 dark:border-violet-900/40 dark:bg-violet-950/20"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-purple">
            {t("timerLabel")}
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
            {formattedTime}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {verificationExpired
              ? t("verificationExpired")
              : t("checkingStatus")}
          </p>
        </div>
      ) : (
        <div
          className={`rounded-2xl border ${
            isModal
              ? "border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-700 dark:bg-slate-800/50"
              : "border-violet-100 bg-violet-50/70 p-4 text-center dark:border-violet-900/40 dark:bg-violet-950/20"
          }`}
        >
          {isModal ? (
            <ol className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#25D366]/15 text-[10px] font-bold text-[#25D366]">
                  1
                </span>
                <span>{t("whatsappReadyTitle")}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#25D366]/15 text-[10px] font-bold text-[#25D366]">
                  2
                </span>
                <span>{t("whatsappReadySubtitle")}</span>
              </li>
            </ol>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {t("whatsappReadyTitle")}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {t("whatsappReadySubtitle")}
              </p>
            </>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={handleOpenWhatsapp}
        disabled={startingVerification || !canOpenWhatsapp}
        className={`group relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 ${
          isModal
            ? "bg-[#25D366] shadow-[#25D366]/25 hover:bg-[#20BD5A] hover:shadow-xl hover:shadow-[#25D366]/30"
            : "bg-linear-to-r from-accent-purple to-violet-500 shadow-violet-300/40 hover:shadow-xl hover:shadow-violet-300/50 dark:shadow-violet-900/30 dark:hover:shadow-violet-900/50"
        }`}
      >
        <span className="flex items-center justify-center gap-2">
          {startingVerification ? (
            <>
              <ImSpinner8 className="animate-spin text-base" />
              {t("startingVerification")}
            </>
          ) : (
            <>
              {isModal ? (
                <FaWhatsapp className="text-lg" />
              ) : (
                <HiOutlineChatAlt2 className="text-lg" />
              )}
              {t("openWhatsapp")}
            </>
          )}
        </span>
      </button>

      {showVerificationRetry && (
        <button
          type="button"
          onClick={handleRestartVerification}
          className="w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:border-accent-purple hover:text-accent-purple dark:border-slate-700 dark:text-slate-200"
        >
          {t("restartVerification")}
        </button>
      )}

      {verificationReference && !verificationExpired && (
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <ImSpinner8 className="animate-spin" />
          <span>{t("checkingNow")}</span>
        </div>
      )}
    </div>
  );

  const profileFormContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!hasRestaurantName && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
            {t("restaurantNameLabel")}{" "}
            <span className="text-accent-purple">*</span>
          </label>
          <Controller
            control={control}
            name="restaurantName"
            render={({ field: { value, onChange } }) => (
              <CustomInput
                type="text"
                id="restaurant-name-gate"
                value={value}
                onChange={onChange}
                placeholder={t("restaurantNameLabel")}
                icon={<FaStore className="text-lg" />}
                error={errors.restaurantName?.message}
              />
            )}
          />
        </div>
      )}

      {!hasPhone && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
            {t("phoneLabel")}{" "}
            <span className="text-accent-purple">*</span>
          </label>
          <Controller
            control={control}
            name="phone"
            render={({ field: { value, onChange } }) => (
              <CustomInput
                type="tel"
                id="phone-gate"
                value={value}
                onChange={onChange}
                placeholder={t("phoneLabel")}
                icon={<HiOutlinePhone className="text-lg" />}
                error={errors.phone?.message}
              />
            )}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={saving || !isValid}
        className="group relative w-full overflow-hidden rounded-xl bg-linear-to-r from-accent-purple to-violet-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-300/40 transition-all duration-200 hover:shadow-xl hover:shadow-violet-300/50 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-violet-900/30 dark:hover:shadow-violet-900/50"
      >
        <span className="flex items-center justify-center gap-2">
          {saving ? (
            <>
              <ImSpinner8 className="animate-spin text-base" />
              {t("saving")}
            </>
          ) : (
            t("submit")
          )}
        </span>
      </button>

      <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
        <HiOutlineLockClosed className="shrink-0" />
        <span>{t("trustBadge")}</span>
      </div>
    </form>
  );

  const modalPanel = (
    <div className="relative w-full overflow-hidden rounded-[28px] border border-slate-200/90 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
      <div className="h-1 w-full bg-linear-to-r from-accent-purple via-violet-400 to-purple-500" />

      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-purple/10 dark:bg-accent-purple/20">
            {requiresVerification ? (
              <FaWhatsapp className="text-xl text-[#25D366]" />
            ) : (
              <HiOutlinePhone className="text-xl text-accent-purple" />
            )}
          </div>
          <div className="min-w-0">
            {userName && (
              <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                {t("welcomeBack")} {userName}
              </p>
            )}
            <h2
              id="phone-gate-title"
              className="text-lg font-bold leading-snug text-slate-900 dark:text-slate-100"
            >
              {gateTitle}
            </h2>
          </div>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label={t("cancel")}
          >
            <IoCloseOutline className="text-xl" />
          </button>
        )}
      </div>

      <div className="px-5 pb-5 pt-4">
        <p className="mb-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {gateSubtitle}
        </p>
        {requiresVerification ? verificationContent : profileFormContent}
      </div>
    </div>
  );

  const gatePanel = (
    <div className="relative w-full max-w-md">
      <div className="mb-8 flex items-center justify-center gap-2">
        <div
          className={`h-1.5 rounded-full ${requiresVerification ? "w-10 bg-accent-purple" : "w-6 bg-accent-purple/30"}`}
        />
        <div
          className={`h-1.5 rounded-full ${requiresVerification ? "w-6 bg-accent-purple/30" : "w-10 bg-accent-purple"}`}
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/80 shadow-2xl shadow-violet-200/40 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-violet-950/20">
        <div className="h-1 w-full bg-linear-to-r from-accent-purple via-violet-400 to-purple-500" />

        <div className={panelPadding}>
          {userName && (
            <div className="mb-6 flex items-center gap-3">
              {typeof userProfile?.profileImage === "string" &&
              userProfile.profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userProfile.profileImage}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-accent-purple/20"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-accent-purple to-violet-400 text-sm font-bold text-white ring-4 ring-accent-purple/10">
                  {initial}
                </div>
              )}
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {t("welcomeBack")}
                </p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {userName}
                </p>
              </div>
            </div>
          )}

          <div className="mb-5 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 scale-150 rounded-2xl bg-accent-purple/20 blur-xl" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-accent-purple to-violet-500 shadow-lg shadow-violet-300/50 dark:shadow-violet-900/50">
                <HiOutlinePhone className="text-2xl text-white" />
              </div>
            </div>
          </div>

          <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {gateTitle}
          </h1>
          <p className="mb-6 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {gateSubtitle}
          </p>

          {requiresVerification ? (
            verificationContent
          ) : (
            <>
              <ul className="mb-7 space-y-2.5">
                {benefits.map(({ icon: Icon, key }) => (
                  <li key={key} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-accent-purple/10 dark:bg-accent-purple/20">
                      <Icon className="text-sm text-accent-purple" />
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {t(key)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mb-6 border-t border-slate-100 dark:border-slate-800" />
              {profileFormContent}
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onCancel?.();
          }
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="phone-gate-title"
          className="w-full max-w-[420px] max-h-[90vh] overflow-y-auto animate-[fadeIn_0.25s_ease-out]"
          onClick={(e) => e.stopPropagation()}
        >
          {modalPanel}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden bg-linear-to-br from-violet-50 via-white to-purple-50/60 px-4 py-12 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/20">
      <div className="pointer-events-none absolute start-0 top-0 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-300/20 blur-3xl dark:bg-violet-800/10" />
      <div className="pointer-events-none absolute bottom-0 end-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-purple-300/15 blur-3xl dark:bg-purple-800/10" />
      <div className="pointer-events-none absolute start-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-accent-purple/5 blur-2xl dark:bg-accent-purple/10" />
      {gatePanel}
    </div>
  );
}
