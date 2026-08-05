"use client";

import { FaGoogle } from "react-icons/fa";
import { useLocale, useTranslations } from "next-intl";
import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
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
const hasGoogleClientId = !!(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL
);

type GoogleSignInButtonProps = {
  dividerLabel?: string;
  ariaLabel?: string;
  className?: string;
  redirectParam?: string | null;
  variant?: "icon" | "full";
};

export default function GoogleSignInButton({
  dividerLabel,
  ariaLabel,
  className = "",
  redirectParam = null,
  variant = "icon",
}: GoogleSignInButtonProps) {
  const t = useTranslations("");
  const dispatch = useAppDispatch();
  const locale = useLocale();
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (tokenResponse: {
    access_token: string;
  }) => {
    setLoading(true);
    try {
      const response = await axiosPost<
        { access_token: string; locale: string },
        LoginResponse
      >(
        "/auth/google",
        locale,
        { access_token: tokenResponse.access_token, locale },
        false,
        true,
      );
      if (response.status && response.data) {
        const { accessToken, refreshToken, user, isNew } = response.data;
        if (isNew) {
          pushSignUpEvent("google");
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
    } catch {
      toast.error(t("auth.loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: (err) => {
      setLoading(false);
      const msg = err?.error_description || t("auth.loginWithGoogleFailed");
      if (err?.error !== "access_denied") {
        toast.error(msg);
      }
    },
    flow: "implicit",
  });

  if (!hasGoogleClientId) {
    return null;
  }

  return (
    <div className={className}>
      {dividerLabel && (
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
          onClick={() => googleLogin()}
          disabled={loading}
          className="login-google-btn flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-[13px] font-medium text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50/90 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600/80 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-800/90"
          aria-label={ariaLabel || t("auth.loginWithGoogle")}
        >
          {loading ? (
            <span className="size-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          ) : (
            <FaGoogle className="size-3.5 text-[#4285F4]" aria-hidden />
          )}
          <span>{t("auth.continueWithGoogle")}</span>
        </button>
      ) : (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => googleLogin()}
            disabled={loading}
            className="flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full border border-slate-200/80 bg-white text-xl shadow-sm transition-all hover:-translate-y-0.5 hover:border-purple-200/80 hover:bg-purple-50/80 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700/80 dark:bg-slate-900/60 dark:hover:border-purple-500/30 dark:hover:bg-purple-500/10"
            aria-label={ariaLabel || t("auth.loginWithGoogle")}
          >
            {loading ? (
              <span className="size-5 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
            ) : (
              <FaGoogle className="text-purple-600" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
