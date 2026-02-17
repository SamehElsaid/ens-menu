"use client";

import { FaGoogle } from "react-icons/fa";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useAppDispatch } from "@/store/hooks";
import { SET_ACTIVE_USER } from "@/store/authSlice/authSlice";
import { axiosPost } from "@/shared/axiosCall";
import { encryptData } from "@/shared/encryption";
import { LoginResponse } from "@/types/LoginResponse";

const hasGoogleClientId = !!(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL
);

type GoogleSignInButtonProps = {
  /** Translation key for divider text, e.g. "auth.orLoginWith" or "auth.orRegisterWith". Omit to hide divider. */
  dividerLabel?: string;
  /** Aria label for the button */
  ariaLabel?: string;
  /** Optional custom class for the wrapper */
  className?: string;
};

export default function GoogleSignInButton({
  dividerLabel,
  ariaLabel,
  className = "",
}: GoogleSignInButtonProps) {
  const t = useTranslations("");
  const router = useRouter();
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
        const { accessToken, refreshToken, user } = response.data;
        const saveTokens = {
          token: accessToken ?? "",
          refreshToken: refreshToken ?? "",
          role: user?.role ?? "",
        };
        const encryptedData = encryptData(saveTokens);
        Cookies.set("sub", encryptedData, {
          expires: 3,
          sameSite: "Strict",
          secure: true,
          path: "/",
        });
        router.push(user?.role === "admin" ? "/admin" : "/dashboard");
        if (user) {
          dispatch(SET_ACTIVE_USER({ user }));
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
        <div className="flex items-center gap-4 w-full mb-4">
          <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700" />
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {t(dividerLabel)}
          </span>
          <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700" />
        </div>
      )}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => googleLogin()}
          disabled={loading}
          className="w-14 h-14 text-xl hover:bg-accent-purple/10! dark:hover:bg-accent-purple/20! rounded-full glass-input flex items-center justify-center transition-all shadow-sm dark:border dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={ariaLabel || t("auth.loginWithGoogle")}
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
          ) : (
            <FaGoogle className="text-accent-purple" />
          )}
        </button>
      </div>
    </div>
  );
}
