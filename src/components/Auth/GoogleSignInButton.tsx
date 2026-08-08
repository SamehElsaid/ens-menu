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
import { SiteButton } from "@/components/site/Button";

const hasGoogleClientId = !!(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL
);

type GoogleSignInButtonProps = {
  ariaLabel?: string;
  className?: string;
  redirectParam?: string | null;
};

export default function GoogleSignInButton({
  ariaLabel,
  className,
  redirectParam = null,
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
    <SiteButton
      type="button"
      variant="secondary"
      size="lg"
      block
      onClick={() => googleLogin()}
      loading={loading}
      className={className}
      aria-label={ariaLabel || t("auth.loginWithGoogle")}
    >
      {loading ? null : (
        <FaGoogle className="size-4 text-[#4285F4]" aria-hidden />
      )}
      <span>{t("auth.continueWithGoogle")}</span>
    </SiteButton>
  );
}
