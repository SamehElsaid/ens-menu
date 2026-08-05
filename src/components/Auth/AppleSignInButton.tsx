"use client";

import { FaApple } from "react-icons/fa";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useAppDispatch } from "@/store/hooks";
import { SET_ACTIVE_USER } from "@/store/authSlice/authSlice";
import { withNewUserOnboardingFlag } from "@/lib/aiImportOnboarding";
import { axiosPost } from "@/shared/axiosCall";
import { pushSignUpEvent } from "@/shared/gtmEvents";
import { encryptData } from "@/shared/encryption";
import { LoginResponse } from "@/types/LoginResponse";
import { resolvePostLoginPath } from "@/lib/authRedirect";

const appleClientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID?.trim() || "";
const appleRedirectUriEnv =
  process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI?.trim() || "";

type AppleAuthRequest = {
  identityToken: string;
  email?: string;
  name?: { firstName?: string; lastName?: string };
  locale: string;
};

type AppleSignInButtonProps = {
  dividerLabel?: string;
  ariaLabel?: string;
  className?: string;
  redirectParam?: string | null;
  variant?: "icon" | "full";
  showDivider?: boolean;
};

let appleScriptPromise: Promise<void> | null = null;

function loadAppleSdk(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Apple SDK requires browser"));
  }
  if (window.AppleID?.auth) return Promise.resolve();
  if (appleScriptPromise) return appleScriptPromise;

  appleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-apple-signin="true"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Apple SDK")),
        { once: true },
      );
      if (window.AppleID?.auth) resolve();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    script.async = true;
    script.dataset.appleSignin = "true";
    script.onload = () => resolve();
    script.onerror = () => {
      appleScriptPromise = null;
      reject(new Error("Failed to load Apple SDK"));
    };
    document.head.appendChild(script);
  });

  return appleScriptPromise;
}

export default function AppleSignInButton({
  dividerLabel,
  ariaLabel,
  className = "",
  redirectParam = null,
  variant = "full",
  showDivider = true,
}: AppleSignInButtonProps) {
  const t = useTranslations("");
  const dispatch = useAppDispatch();
  const locale = useLocale();
  const [loading, setLoading] = useState(false);

  const completeLogin = useCallback(
    async (payload: AppleAuthRequest) => {
      const response = await axiosPost<AppleAuthRequest, LoginResponse>(
        "/auth/apple",
        locale,
        payload,
        false,
        true,
      );

      if (response.status && response.data) {
        const { accessToken, refreshToken, user, isNew } = response.data;
        if (isNew) {
          pushSignUpEvent("apple");
        }
        const saveTokens = {
          token: accessToken ?? "",
          refreshToken: refreshToken ?? "",
          role: user?.role ?? "",
        };
        const encryptedData = encryptData(saveTokens);
        Cookies.set("sub", encryptedData, {
          expires: 3,
          sameSite: "Lax",
          secure: true,
          path: "/",
        });
        window.location.href = resolvePostLoginPath(
          locale,
          user?.role,
          redirectParam,
        );
        if (user) {
          const nextUser = isNew ? withNewUserOnboardingFlag(user) : user;
          dispatch(SET_ACTIVE_USER({ user: nextUser }));
        }
      } else {
        const errMsg = (response.data as { error?: string })?.error;
        toast.error(errMsg || t("auth.loginFailed"));
      }
    },
    [dispatch, locale, redirectParam, t],
  );

  const handleAppleClick = async () => {
    if (!appleClientId) {
      toast.error(t("auth.appleNotConfigured"));
      return;
    }

    setLoading(true);
    try {
      await loadAppleSdk();
      if (!window.AppleID?.auth) {
        throw new Error("Apple SDK unavailable");
      }

      const redirectURI =
        appleRedirectUriEnv ||
        (typeof window !== "undefined" ? window.location.origin : "");

      window.AppleID.auth.init({
        clientId: appleClientId,
        scope: "name email",
        redirectURI,
        usePopup: true,
      });

      const result = await window.AppleID.auth.signIn();
      const identityToken = result?.authorization?.id_token;
      if (!identityToken) {
        throw new Error("Missing Apple identity token");
      }

      const firstName = result.user?.name?.firstName || undefined;
      const lastName = result.user?.name?.lastName || undefined;

      await completeLogin({
        identityToken,
        email: result.user?.email || undefined,
        name:
          firstName || lastName
            ? { firstName, lastName }
            : undefined,
        locale,
      });
    } catch (err: unknown) {
      const anyErr = err as { error?: string; message?: string };
      // User closed the popup
      if (anyErr?.error === "popup_closed_by_user") {
        return;
      }
      toast.error(
        anyErr?.message ||
          anyErr?.error ||
          t("auth.loginWithAppleFailed"),
      );
    } finally {
      setLoading(false);
    }
  };

  if (!appleClientId) {
    return null;
  }

  return (
    <div className={className}>
      {showDivider && dividerLabel && (
        <div className="auth-social-divider auth-social-divider--subtle mb-3.5 flex w-full items-center gap-2.5">
          <span
            aria-hidden
            className="h-px flex-1 bg-slate-200/70 dark:bg-slate-700/60"
          />
          <span className="shrink-0 text-[10px] font-normal text-slate-400/90 dark:text-slate-500/90">
            {t(dividerLabel)}
          </span>
          <span
            aria-hidden
            className="h-px flex-1 bg-slate-200/70 dark:bg-slate-700/60"
          />
        </div>
      )}

      {variant === "full" ? (
        <button
          type="button"
          onClick={handleAppleClick}
          disabled={loading}
          className="login-apple-btn flex w-full items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-950 px-4 py-2.5 text-[13px] font-medium text-white transition-all duration-200 hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-100 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          aria-label={ariaLabel || t("auth.loginWithApple")}
        >
          {loading ? (
            <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-slate-900 dark:border-t-transparent" />
          ) : (
            <FaApple className="size-4" aria-hidden />
          )}
          <span>{t("auth.continueWithApple")}</span>
        </button>
      ) : (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleAppleClick}
            disabled={loading}
            className="flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border border-slate-900 bg-slate-950 text-xl text-white shadow-sm transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-100 dark:bg-white dark:text-slate-900"
            aria-label={ariaLabel || t("auth.loginWithApple")}
          >
            {loading ? (
              <span className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-slate-900 dark:border-t-transparent" />
            ) : (
              <FaApple />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
