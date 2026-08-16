"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Controller, Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslations, useLocale } from "next-intl";
import {
  HiOutlinePhone,
  HiOutlineLockClosed,
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlineCreditCard,
} from "react-icons/hi";
import { FaStore, FaWhatsapp } from "react-icons/fa";
import {
  Button,
  Field,
  Input,
  LoadingBlock,
  Modal,
  Spinner,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { SET_AUTH_SESSION_CACHE } from "@/store/authSlice/authSlice";
import { axiosGet, axiosPut, axiosPost } from "@/shared/axiosCall";
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
  const authData = useAppSelector((s) => s.auth.data) as {
    user?: {
      phoneNumber?: string | null;
      restaurantName?: string | null;
      role?: string;
    };
  } | null;

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
  const authData = useAppSelector((s) => s.auth.data) as {
    user?: {
      phoneNumber?: string;
      isPhoneVerified?: boolean;
      role?: string;
      name?: string;
      profileImage?: string;
      restaurantName?: string | null;
    } & UserProfile;
  } | null;

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
  const requiresProfileDetails =
    authLoaded && (!hasPhone || !hasRestaurantName);
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
    resolver: yupResolver(
      profileSchema,
    ) as unknown as Resolver<RequirePhoneSchema>,
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
        SET_AUTH_SESSION_CACHE({
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
        <Modal
          open
          onClose={() => {}}
          dismissible={false}
          showClose={false}
          title={t("title")}
        >
          <LoadingBlock />
        </Modal>
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

    const resolvedPhone =
      payload.phoneNumber ?? userProfile?.phoneNumber?.trim();
    const resolvedRestaurantName =
      payload.restaurantName ?? userProfile?.restaurantName?.trim();

    setSaving(true);
    const res = await axiosPut<
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
        SET_AUTH_SESSION_CACHE({
          ...authData,
          user: {
            ...userProfile,
            ...updatedUser,
            ...(payload.phoneNumber
              ? { phoneNumber: payload.phoneNumber }
              : {}),
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
  const gateTitle = requiresVerification ? t("verifyTitle") : t("title");
  const gateSubtitle = requiresVerification
    ? t("verifySubtitle")
    : t("subtitle");
  const displayPhone = userProfile?.phoneNumber?.trim() ?? "";
  const gateSteps = [
    { key: "stepProfile", active: !requiresVerification },
    { key: "stepVerify", active: requiresVerification },
  ] as const;

  const verificationContent = (
    <div className="space-y-3">
      {displayPhone && (
        <div className="rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-center">
          <p className="ui-label">{t("verifyPhoneLabel")}</p>
          <p className="ui-figure mt-0.5 text-base text-fg" dir="ltr">
            {displayPhone}
          </p>
        </div>
      )}

      {verificationReference ? (
        /* The countdown is the loudest thing here because it is the only fact
           that changes while the user is away in another app. */
        <div className="rounded-lg border border-accent-line bg-accent-soft px-3 py-4 text-center">
          <p className="ui-label">{t("timerLabel")}</p>
          <p
            className="ui-figure mt-1 text-3xl leading-none text-fg"
            role="timer"
          >
            {formattedTime}
          </p>
          <p className="mt-2 text-xs text-fg-muted" aria-live="polite">
            {verificationExpired
              ? t("verificationExpired")
              : t("checkingStatus")}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-line bg-surface-2 px-3 py-3">
          <p className="text-[13px] font-semibold text-fg">
            {t("whatsappReadyTitle")}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-fg-muted">
            {t("whatsappReadySubtitle")}
          </p>
        </div>
      )}

      {/* The WhatsApp mark stays on the glyph and never on the fill —
          DESIGN.md §14.4. The action itself is ink, like every other primary. */}
      <Button
        type="button"
        size="lg"
        fullWidth
        onClick={handleOpenWhatsapp}
        disabled={startingVerification || !canOpenWhatsapp}
        aria-busy={startingVerification || undefined}
        startIcon={
          startingVerification ? (
            <Spinner size="sm" />
          ) : (
            <FaWhatsapp className="size-4.5" />
          )
        }
      >
        {startingVerification ? t("startingVerification") : t("openWhatsapp")}
      </Button>

      {showVerificationRetry && (
        <Button
          type="button"
          variant="secondary"
          size="lg"
          fullWidth
          onClick={handleRestartVerification}
        >
          {t("restartVerification")}
        </Button>
      )}

      {verificationReference && !verificationExpired && (
        <p
          className="flex items-center justify-center gap-2 text-xs text-fg-subtle"
          role="status"
          aria-live="polite"
        >
          <Spinner size="xs" />
          <span>{t("checkingNow")}</span>
        </p>
      )}
    </div>
  );

  const profileFormContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!hasRestaurantName && (
        <Field
          label={t("restaurantNameLabel")}
          required
          error={errors.restaurantName?.message}
        >
          <Controller
            control={control}
            name="restaurantName"
            render={({ field: { value, onChange } }) => (
              <Input
                type="text"
                id="restaurant-name-gate"
                value={value}
                onChange={onChange}
                placeholder={t("restaurantNameLabel")}
                startIcon={<FaStore className="size-4.5" />}
              />
            )}
          />
        </Field>
      )}

      {!hasPhone && (
        <Field label={t("phoneLabel")} required error={errors.phone?.message}>
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
              />
            )}
          />
        </Field>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        disabled={saving || !isValid}
        loading={saving}
      >
        {t("submit")}
      </Button>

      <p className="flex items-center gap-1.5 text-xs text-fg-subtle">
        <HiOutlineLockClosed className="shrink-0" aria-hidden />
        <span>{t("trustBadge")}</span>
      </p>
    </form>
  );

  const modalPanel = (
    <>
      {userName && (
        <p className="ui-label mb-3 truncate">
          {t("welcomeBack")} · {userName}
        </p>
      )}
      {requiresVerification ? verificationContent : profileFormContent}
    </>
  );

  const gatePanel = (
    <div className="w-full max-w-md">
      {/* Two steps, named. The previous pair of anonymous dashes said "there is
          more than one screen" without saying which one this is; the rule
          thickness and `aria-current` carry the position without a hue. */}
      <ol className="mb-4 flex gap-3">
        {gateSteps.map((step) => (
          <li
            key={step.key}
            aria-current={step.active ? "step" : undefined}
            className={cn(
              "ui-label min-w-0 flex-1 truncate pt-1.5",
              step.active ? "border-t-2 border-accent" : "border-t border-line",
            )}
          >
            {t(step.key)}
          </li>
        ))}
      </ol>

      <div className="rounded-xl border border-line bg-surface">
        <header className="flex items-start gap-3 border-b border-line px-4 py-4 sm:px-5">
          {userName ? (
            typeof userProfile?.profileImage === "string" &&
            userProfile.profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userProfile.profileImage}
                alt=""
                className="size-9 shrink-0 rounded-full border border-line object-cover"
              />
            ) : (
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-on-brand"
                aria-hidden
              >
                {initial}
              </span>
            )
          ) : null}

          <div className="min-w-0">
            {userName && (
              <p className="ui-label mb-1 truncate">
                {t("welcomeBack")} · {userName}
              </p>
            )}
            <h1 className="text-[21px] leading-tight font-semibold tracking-[-0.03em] text-fg">
              {gateTitle}
            </h1>
            <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">
              {gateSubtitle}
            </p>
          </div>
        </header>

        <div className="px-4 py-4 sm:px-5">
          {requiresVerification ? (
            verificationContent
          ) : (
            <>
              {/* Pulled flush so the header's rule doubles as this band's top
                  edge: the gate reads as three stacked bands, not as a card
                  with a list floating inside its padding. */}
              <ul className="-mx-4 -mt-4 mb-4 divide-y divide-line border-b border-line sm:-mx-5">
                {benefits.map(({ icon: Icon, key }) => (
                  <li
                    key={key}
                    className="flex items-start gap-2.5 px-4 py-2.5 sm:px-5"
                  >
                    <Icon
                      className="mt-0.5 size-4 shrink-0 text-fg-subtle"
                      aria-hidden
                    />
                    <span className="min-w-0 text-[13px] leading-relaxed text-fg-muted">
                      {t(key)}
                    </span>
                  </li>
                ))}
              </ul>
              {profileFormContent}
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <Modal
        open
        onClose={onCancel ?? (() => {})}
        title={gateTitle}
        description={gateSubtitle}
        icon={
          requiresVerification ? (
            <FaWhatsapp className="size-5 text-[#25D366]" />
          ) : (
            <HiOutlinePhone className="size-5" />
          )
        }
        size="sm"
        dismissible={!saving && !startingVerification}
        showClose={Boolean(onCancel)}
        closeLabel={t("cancel")}
      >
        {modalPanel}
      </Modal>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-app px-4 py-10">
      {gatePanel}
    </div>
  );
}
