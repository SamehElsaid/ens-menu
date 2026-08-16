"use client";

import { FaApple } from "react-icons/fa";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { useAppDispatch } from "@/store/hooks";
import { SET_AUTH_SESSION_CACHE } from "@/store/authSlice/authSlice";
import { withNewUserOnboardingFlag } from "@/lib/aiImportOnboarding";
import { axiosPost } from "@/shared/axiosCall";
import { pushSignUpEvent } from "@/shared/gtmEvents";
import { LoginResponse } from "@/types/LoginResponse";
import { resolvePostLoginPath } from "@/lib/authRedirect";
import { SiteButton } from "@/components/site/Button";
import { writeAuthUiCookie } from "@/shared/authUiCookie";
import { storeCsrfTokenFromPayload } from "@/shared/csrfToken";

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
        const { user, isNew } = response.data;
        if (isNew) {
          pushSignUpEvent("apple");
        }
        writeAuthUiCookie({ role: user?.role ?? "" });
        storeCsrfTokenFromPayload(response.data);
        window.location.href = resolvePostLoginPath(
          locale,
          user?.role,
          redirectParam,
        );
        if (user) {
          const nextUser = isNew ? withNewUserOnboardingFlag(user) : user;
          dispatch(SET_AUTH_SESSION_CACHE({ user: nextUser }));
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
    /* Same chrome and the same height as the Google button — Apple's guidelines
       require its button to be no less prominent than any other sign-in option
       on the screen, so the two are one control with two marks.

       The Apple logo is a §14.4 exemption and stays a solid mark, but it is the
       one brand hue that is *defined* as the foreground: Apple permits black or
       white only, so `currentColor` is the correct treatment — it inherits dark
       on a light button and light on a dark one, which is exactly the pair Apple
       allows. The 20px box gives it the clear space the guidelines ask for. */
    <SiteButton
      type="button"
      variant="secondary"
      size="md"
      block
      onClick={handleAppleClick}
      loading={loading}
      className={className}
      aria-label={ariaLabel}
    >
      {/* Stays mounted while loading — see the note in `GoogleSignInButton`. */}
      <span className="me-1 flex shrink-0 items-center" aria-hidden>
        <FaApple className="size-5" />
      </span>
      <span>{t("auth.continueWithApple")}</span>
    </SiteButton>
  );
}
