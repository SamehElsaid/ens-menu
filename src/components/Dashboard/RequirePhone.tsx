"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  HiOutlinePhone,
  HiOutlineLockClosed,
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlineCreditCard,
  HiOutlineChatAlt2,
} from "react-icons/hi";
import { ImSpinner8 } from "react-icons/im";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { SET_ACTIVE_USER } from "@/store/authSlice/authSlice";
import { axiosPatch, axiosPost } from "@/shared/axiosCall";
import CustomInput from "@/components/Custom/CustomInput";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface RequirePhoneProps {
  children: ReactNode;
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

export function RequirePhone({ children }: RequirePhoneProps) {
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
      } & UserProfile;
    }
    | null;

  const [phone, setPhone] = useState("");
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
  const authLoaded = authLoading === "yes";
  const hasPhone = Boolean(userProfile?.phoneNumber?.trim());
  const isPhoneVerified = userProfile?.isPhoneVerified === true;
  const requiresPhoneGate = authLoaded && (!hasPhone || !isPhoneVerified);
  const requiresVerification =
    authLoaded && hasPhone && !isPhoneVerified;

  useEffect(() => {
    if (
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
    requiresVerification,
    verificationReference,
    pendingReference,
    startAttempted,
    locale,
    userProfile?.phoneNumber,
    t,
  ]);

  useEffect(() => {
    if (!requiresVerification || !verificationReference) return;

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
  }, [requiresVerification, verificationReference]);

  useEffect(() => {
    if (
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
    };

    void checkVerification();
    const intervalId = window.setInterval(checkVerification, CHECK_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [
    requiresVerification,
    verificationReference,
    verificationExpired,
    locale,
    dispatch,
    authData,
    userProfile,
    t,
  ]);

  if (!requiresPhoneGate) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextPhone = phone.trim();
    if (!nextPhone) return;

    setSaving(true);
    const res = await axiosPatch<
      { phoneNumber: string },
      { user?: UserProfile }
    >("/user/profile", locale, { phoneNumber: nextPhone });
    setSaving(false);

    if (res?.status && res.data) {
      toast.success(t("successMessage"));
      const updatedUser = (res.data as { user?: UserProfile })?.user ?? {};
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
            phoneNumber: nextPhone,
            isPhoneVerified: updatedUser.isPhoneVerified === true,
          },
        } as UserProfile),
      );
    } else {
      toast.error(t("errorMessage"));
    }
  };

  const handleOpenWhatsapp = () => {
    if (!deeplink || !pendingReference) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("verifyReference", pendingReference);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setTimeLeft(VERIFICATION_TIMEOUT_SECONDS);
    setVerificationExpired(false);
    setVerificationReference(pendingReference);
    window.open(deeplink, "_blank", "noopener,noreferrer");
  };

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

  return (
    <div
      className="min-h-[calc(100vh-80px)] flex items-center justify-center relative overflow-hidden bg-linear-to-br from-violet-50 via-white to-purple-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950/20 px-4 py-12"
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute start-0 top-0 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-300/20 blur-3xl dark:bg-violet-800/10" />
      <div className="pointer-events-none absolute bottom-0 end-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-purple-300/15 blur-3xl dark:bg-purple-800/10" />
      <div className="pointer-events-none absolute start-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-accent-purple/5 blur-2xl dark:bg-accent-purple/10" />

      <div className="relative w-full max-w-md">
        {/* Progress indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="h-1.5 w-6 rounded-full bg-accent-purple/30" />
          <div className="h-1.5 w-10 rounded-full bg-accent-purple" />
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/80 shadow-2xl shadow-violet-200/40 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-violet-950/20">
          {/* Top gradient bar */}
          <div className="h-1 w-full bg-linear-to-r from-accent-purple via-violet-400 to-purple-500" />

          <div className="p-8">
            {/* User greeting */}
            {userName && (
              <div
                className={`mb-6 flex items-center gap-3 `}
              >
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
                <div >
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {t("welcomeBack")}
                  </p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {userName}
                  </p>
                </div>
              </div>
            )}

            {/* Icon */}
            <div className="mb-5 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 scale-150 rounded-2xl bg-accent-purple/20 blur-xl" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-accent-purple to-violet-500 shadow-lg shadow-violet-300/50 dark:shadow-violet-900/50">
                  <HiOutlinePhone className="text-2xl text-white" />
                </div>
              </div>
            </div>

            {/* Title & subtitle */}
            <h1
              className={`mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100 `}
            >
              {requiresVerification ? t("verifyTitle") : t("title")}
            </h1>
            <p
              className={`mb-6 text-sm leading-relaxed text-slate-500 dark:text-slate-400 `}
            >
              {requiresVerification ? t("verifySubtitle") : t("subtitle")}
            </p>

            {requiresVerification ? (
              <div className="mb-7 space-y-4">
                {verificationReference ? (
                  <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4 text-center dark:border-violet-900/40 dark:bg-violet-950/20">
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
                  <>
                    <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4 text-center dark:border-violet-900/40 dark:bg-violet-950/20">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {t("whatsappReadyTitle")}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        {t("whatsappReadySubtitle")}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenWhatsapp}
                      disabled={
                        startingVerification ||
                        !deeplink ||
                        !pendingReference
                      }
                      className="group relative w-full overflow-hidden rounded-xl bg-linear-to-r from-accent-purple to-violet-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-300/40 transition-all duration-200 hover:shadow-xl hover:shadow-violet-300/50 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-violet-900/30 dark:hover:shadow-violet-900/50"
                    >
                      <span className="flex items-center justify-center gap-2">
                        {startingVerification ? (
                          <>
                            <ImSpinner8 className="animate-spin text-base" />
                            {t("startingVerification")}
                          </>
                        ) : (
                          <>
                            <HiOutlineChatAlt2 className="text-lg" />
                            {t("openWhatsapp")}
                          </>
                        )}
                      </span>
                    </button>
                  </>
                )}

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
            ) : (
              <>
                {/* Benefits */}
                <ul className="mb-7 space-y-2.5">
                  {benefits.map(({ icon: Icon, key }) => (
                    <li
                      key={key}
                      className={`flex items-start gap-3 `}
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-accent-purple/10 dark:bg-accent-purple/20">
                        <Icon className="text-sm text-accent-purple" />
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {t(key)}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* Divider */}
            <div className="mb-6 border-t border-slate-100 dark:border-slate-800" />

            {/* Form */}
            {!requiresVerification && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    className={`mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400 `}
                  >
                    {t("phoneLabel")}{" "}
                    <span className="text-accent-purple">*</span>
                  </label>
                  <CustomInput
                    type="tel"
                    id="phone-gate"
                    defaultCountry="EG"
                    value={phone || undefined}
                    onChange={(val) =>
                      setPhone((val as unknown as string) ?? "")
                    }
                    placeholder={t("phoneLabel")}
                    icon={<HiOutlinePhone className="text-lg" />}
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving || !phone.trim()}
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

                {/* Trust badge */}
                <div
                  className={`flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 `}
                >
                  <HiOutlineLockClosed className="shrink-0" />
                  <span>{t("trustBadge")}</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
