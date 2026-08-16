"use client";

import { useLocale, useTranslations } from "next-intl";
import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
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

const hasGoogleClientId = !!(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL
);

/**
 * The Google "G", in Google's four colours.
 *
 * A documented exemption (DESIGN.md §14.4): a third-party mark identifies an
 * external service, so it keeps its own hues and must not be restyled to the
 * brand purple or flattened to `currentColor`. This is the full-colour logo
 * Google's identity guidelines require on a light button. The exemption covers
 * the glyph only — the button around it is house chrome.
 */
function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden focusable="false">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

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
        const { user, isNew } = response.data;
        if (isNew) {
          pushSignUpEvent("google");
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
    /* House chrome, third-party mark. `secondary` is the site's quiet control —
       hairline, soft radius, flat fill, no resting glow — and it is one notch
       shorter than the brand submit above it, so the form still has exactly one
       primary action. The mark sits in its own 20px box with an added margin,
       which is the clear space Google's guidelines ask for around the logo.

       No `aria-label` unless a caller supplies one: the visible label is the
       accessible name, so the two cannot drift apart (WCAG 2.5.3). */
    <SiteButton
      type="button"
      variant="secondary"
      size="md"
      block
      onClick={() => googleLogin()}
      loading={loading}
      className={className}
      aria-label={ariaLabel}
    >
      {/* The mark stays mounted while loading. `SiteButton` fades the whole label
          under a centred spinner and holds the width; removing the mark here
          instead would rebuild the row underneath it. */}
      <span className="me-1 flex shrink-0 items-center" aria-hidden>
        <GoogleMark />
      </span>
      <span>{t("auth.continueWithGoogle")}</span>
    </SiteButton>
  );
}
