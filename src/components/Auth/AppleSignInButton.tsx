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
import { SiteButton } from "@/components/site/Button";

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
  ariaLabel?: string;
  className?: string;
  redirectParam?: string | null;
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
  ariaLabel,
  className,
  redirectParam = null,
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
        name: firstName || lastName ? { firstName, lastName } : undefined,
        locale,
      });
    } catch (err: unknown) {
      const anyErr = err as { error?: string; message?: string };
      // User closed the popup
      if (anyErr?.error === "popup_closed_by_user") {
        return;
      }
      toast.error(
        anyErr?.message || anyErr?.error || t("auth.loginWithAppleFailed"),
      );
    } finally {
      setLoading(false);
    }
  };

  if (!appleClientId) {
    return null;
  }

  return (
    <SiteButton
      type="button"
      variant="secondary"
      size="lg"
      block
      onClick={handleAppleClick}
      loading={loading}
      className={className}
      aria-label={ariaLabel || t("auth.loginWithApple")}
    >
      {loading ? null : <FaApple className="size-4" aria-hidden />}
      <span>{t("auth.continueWithApple")}</span>
    </SiteButton>
  );
}
