"use client";

import { Controller, Resolver, useForm } from "react-hook-form";
import { FiMail } from "react-icons/fi";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocale, useTranslations } from "next-intl";
import { loginSchema, LoginSchema } from "@/schemas/loginSchema";
import { useSearchParams } from "next/navigation";
import { resolvePostLoginPath } from "@/lib/authRedirect";
import { getMenuDashboardRef } from "@/lib/menuDashboardPath";
import LinkTo from "./Global/LinkTo";
import { SET_AUTH_SESSION_CACHE } from "@/store/authSlice/authSlice";
import { useAppDispatch } from "@/store/hooks";
import { axiosPost } from "@/shared/axiosCall";
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { LoginResponse } from "@/types/LoginResponse";
import AuthSocialButtons from "@/components/Auth/AuthSocialButtons";
import { syncFcmToken } from "@/shared/syncFcmToken";
import CustomRecaptcha, {
  type RecaptchaGateHandle,
} from "./Auth/CustomRecaptcha";
import {
  Alert,
  Checkbox,
  Field,
  Input,
  PasswordInput,
} from "@/components/site/Form";
import { SiteButton } from "@/components/site/Button";
import { writeAuthUiCookie } from "@/shared/authUiCookie";
import { storeCsrfTokenFromPayload } from "@/shared/csrfToken";

const REMEMBER_EMAIL_KEY = "ensmenu_remember_email";

function readRememberedEmail(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(REMEMBER_EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
}

function subscribeRememberedEmail(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

export default function LoginForm() {
  const t = useTranslations("");
  const dispatch = useAppDispatch();
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<LoginSchema>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: yupResolver(loginSchema(t)) as unknown as Resolver<LoginSchema>,
    mode: "onChange",
  });

  const messages = {
    email: t("auth.email"),
    password: t("auth.password"),
    login: t("auth.login"),
  };

  const locale = useLocale();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const [loading, setLoading] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const savedEmail = useSyncExternalStore(
    subscribeRememberedEmail,
    readRememberedEmail,
    () => "",
  );
  const [rememberOverride, setRememberOverride] = useState<boolean | null>(
    null,
  );
  const rememberMe = rememberOverride ?? Boolean(savedEmail);
  const [apiError, setApiError] = useState<string | null>(null);
  const [emailVerificationRequired, setEmailVerificationRequired] =
    useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const recaptchaRef = useRef<RecaptchaGateHandle>(null);

  useEffect(() => {
    if (savedEmail) {
      setValue("email", savedEmail);
    }
  }, [savedEmail, setValue]);

  const onSubmit = async (data: LoginSchema) => {
    if (!recaptchaVerified) {
      const verified = await recaptchaRef.current?.promptVerification();
      if (!verified) return;
    }

    setLoading(true);
    setApiError(null);
    setEmailVerificationRequired(false);

    try {
      if (rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, data.email);
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
    } catch {
      // ignore storage errors
    }

    const response = await axiosPost<
      LoginSchema,
      LoginResponse & { message?: string }
    >("/auth/login", locale, data, false, true);

    if (response.status && response.data) {
      const { user } = response.data;
      const data = response.data as LoginResponse & {
        permissions?: unknown;
        menu?: { id?: number; uuid?: string };
        role?: { id?: number; name?: string | null } | null;
        staff?: { roleId?: number | null; roleName?: string | null };
      };

      // Dashboard staff sign in through this same owner login form. They carry
      // a scoped permission set, so persist the full staff context
      // (permissions/role) the proxy guard expects.
      const isStaff = user?.role === "staff";

      const uiHints = isStaff
        ? {
            role: "staff",
            permissions: Array.isArray(data.permissions)
              ? data.permissions.filter(
                  (p): p is string => typeof p === "string",
                )
              : [],
            staffRoleId: data.role?.id ?? data.staff?.roleId ?? undefined,
            roleName: data.role?.name ?? data.staff?.roleName ?? undefined,
            menuUuid: getMenuDashboardRef(data.menu ?? {}),
          }
        : {
            role: user?.role ?? "",
          };

      writeAuthUiCookie(uiHints, { expires: rememberMe ? 14 : 3 });
      storeCsrfTokenFromPayload(response.data);

      void syncFcmToken(locale);

      if (user) {
        dispatch(SET_AUTH_SESSION_CACHE({ user }));
      }

      // Staff land on the account dashboard like owners do: orders and staff
      // are account-level now, and the menu list there is already filtered to
      // whatever their grants and role allow.
      window.location.assign(
        resolvePostLoginPath(locale, user?.role, redirectParam),
      );
    } else {
      const payload = response.data as {
        message?: string;
        error?: string;
        errorType?: string;
        emailVerificationRequired?: boolean;
      };
      const errorMessage =
        payload?.error || payload?.message || t("auth.invalidCredentials");
      setApiError(errorMessage);
      setEmailVerificationRequired(Boolean(payload?.emailVerificationRequired));
      setLoading(false);
      recaptchaRef.current?.reset();
      setRecaptchaVerified(false);
    }
  };

  const handleResendVerification = async () => {
    const email = getValues("email");
    if (!email) return;

    setResendingVerification(true);
    const response = await axiosPost<
      { email: string; locale: string },
      unknown
    >("/auth/resend-verification", locale, { email, locale }, false, true);
    setResendingVerification(false);

    if (response.status) {
      setApiError(t("auth.resendVerificationSuccess"));
      return;
    }

    const payload = response.data as { error?: string; message?: string };
    setApiError(
      payload?.error || payload?.message || t("auth.verifyEmailFailed"),
    );
  };

  return (
    <form
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        void handleSubmit(onSubmit)(event);
      }}
      noValidate
    >
      {apiError ? (
        <Alert className="mb-5">
          <p>{apiError}</p>
          {emailVerificationRequired ? (
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendingVerification}
              className="mt-1.5 font-semibold underline underline-offset-4 disabled:opacity-60"
            >
              {resendingVerification
                ? t("auth.recaptchaVerifying")
                : t("auth.resendVerification")}
            </button>
          ) : null}
        </Alert>
      ) : null}

      <div className="space-y-4">
        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange } }) => (
            <Field
              label={messages.email}
              error={errors.email?.message}
              htmlFor="login-email"
            >
              <Input
                id="login-email"
                type="email"
                inputMode="email"
                startIcon={<FiMail className="size-4" />}
                autoComplete="email"
                invalid={Boolean(errors.email)}
                value={value}
                onChange={(e) => {
                  setApiError(null);
                  onChange(e);
                }}
              />
            </Field>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange } }) => (
            <Field
              label={messages.password}
              error={errors.password?.message}
              htmlFor="login-password"
            >
              <PasswordInput
                id="login-password"
                autoComplete="current-password"
                invalid={Boolean(errors.password)}
                showLabel={t("auth.showPassword")}
                hideLabel={t("auth.hidePassword")}
                value={value}
                onChange={(e) => {
                  setApiError(null);
                  onChange(e);
                }}
              />
            </Field>
          )}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Checkbox
          checked={rememberMe}
          onChange={(e) => setRememberOverride(e.target.checked)}
          label={t("auth.rememberMe")}
        />
        <LinkTo
          href="/auth/reset-password"
          className="text-site-sm font-medium text-site-brand underline underline-offset-4 hover:text-site-brand-hover"
        >
          {t("auth.forgotPassword")}
        </LinkTo>
      </div>

      {/* Silent captcha — modal only on submit */}
      <CustomRecaptcha
        ref={recaptchaRef}
        mode="on-demand"
        silent
        onVerifiedChange={setRecaptchaVerified}
      />

      <SiteButton type="submit" loading={loading} block size="lg" className="mt-6">
        {messages.login}
      </SiteButton>

      <AuthSocialButtons dividerLabel="auth.orLoginWith" redirectParam={redirectParam} className="mt-6" />
    </form>
  );
}
