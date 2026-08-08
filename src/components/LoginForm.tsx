"use client";

import { Controller, Resolver, useForm } from "react-hook-form";
import { Field, Input } from "@/components/ui";
import { FaEnvelope } from "react-icons/fa";
import { TbLockPassword } from "react-icons/tb";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocale, useTranslations } from "next-intl";
import { loginSchema, LoginSchema } from "@/schemas/loginSchema";
import { encryptData } from "@/shared/encryption";
import Cookies from "js-cookie";
import { useSearchParams } from "next/navigation";
import { resolvePostLoginPath } from "@/lib/authRedirect";
import { getMenuDashboardRef } from "@/lib/menuDashboardPath";
import LinkTo from "./Global/LinkTo";
import { SET_ACTIVE_USER } from "@/store/authSlice/authSlice";
import { useAppDispatch } from "@/store/hooks";
import { axiosPost } from "@/shared/axiosCall";
import { useEffect, useRef, useState } from "react";
import { LoginResponse } from "@/types/LoginResponse";
import AuthSocialButtons from "@/components/Auth/AuthSocialButtons";
import { syncFcmToken } from "@/shared/syncFcmToken";
import CustomRecaptcha, {
  type RecaptchaGateHandle,
} from "./Auth/CustomRecaptcha";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Alert } from "@/components/ui/Alert";

const REMEMBER_EMAIL_KEY = "ensmenu_remember_email";

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
  const [rememberMe, setRememberMe] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [emailVerificationRequired, setEmailVerificationRequired] =
    useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const recaptchaRef = useRef<RecaptchaGateHandle>(null);

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
      if (savedEmail) {
        setValue("email", savedEmail);
        setRememberMe(true);
      }
    } catch {
      // localStorage unavailable
    }
  }, [setValue]);

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
      const { accessToken, refreshToken, user } = response.data;
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

      const saveTokens = isStaff
        ? {
            token: accessToken ?? "",
            refreshToken: refreshToken ?? "",
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
            token: accessToken ?? "",
            refreshToken: refreshToken ?? "",
            role: user?.role ?? "",
          };

      const encryptedData = encryptData(saveTokens);

      Cookies.set("sub", encryptedData, {
        expires: rememberMe ? 14 : 3,
        sameSite: "Lax",
        secure: true,
        path: "/",
      });

      void syncFcmToken(locale);

      if (user) {
        dispatch(SET_ACTIVE_USER({ user }));
      }

      // Staff land on the account dashboard like owners do: orders and staff
      // are account-level now, and the menu list there is already filtered to
      // whatever their grants and role allow.
      window.location.href = resolvePostLoginPath(
        locale,
        user?.role,
        redirectParam,
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
    const response = await axiosPost<{ email: string; locale: string }, unknown>(
      "/auth/resend-verification",
      locale,
      { email, locale },
      false,
      true,
    );
    setResendingVerification(false);

    if (response.status) {
      setApiError(t("auth.resendVerificationSuccess"));
      return;
    }

    const payload = response.data as { error?: string; message?: string };
    setApiError(payload?.error || payload?.message || t("auth.verifyEmailFailed"));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="login-form">
      <div className="login-form__fields space-y-3">
        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange } }) => (
            <Field label={messages.email} error={errors.email?.message}>
              <Input
                type="email"
                inputSize="md"
                startIcon={<FaEnvelope size={14} />}
                placeholder={messages.email}
                autoComplete="email"
                value={value}
                onChange={(e) => {
                  setApiError(null);
                  onChange(e);
                }}
                className="login-field-input"
              />
            </Field>
          )}
        />

        <div className="login-form__password-group space-y-1.5">
          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange } }) => (
              <Field label={messages.password} error={errors.password?.message}>
                <Input
                  type="password"
                  inputSize="md"
                  startIcon={<TbLockPassword size={15} />}
                  placeholder={messages.password}
                  autoComplete="current-password"
                  value={value}
                  onChange={(e) => {
                    setApiError(null);
                    onChange(e);
                  }}
                  className="login-field-input"
                />
              </Field>
            )}
          />
          <LinkTo
            href="/auth/reset-password"
            className="login-forgot-link inline-block rounded-sm pt-0.5 text-start text-[12px] font-medium text-brand transition-colors hover:text-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {t("auth.forgotPassword")}
          </LinkTo>
        </div>
      </div>

      <Checkbox
        className="mt-3"
        checked={rememberMe}
        onChange={(e) => setRememberMe(e.target.checked)}
        label={t("auth.rememberMe")}
      />

      {/* Silent captcha — modal only on submit */}
      <CustomRecaptcha
        ref={recaptchaRef}
        mode="on-demand"
        silent
        onVerifiedChange={setRecaptchaVerified}
      />

      {apiError && (
        <Alert tone="danger" className="mt-3">
          <span>{apiError}</span>
          {emailVerificationRequired && (
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendingVerification}
              className="mt-1.5 block rounded-sm text-start text-[12px] font-semibold underline underline-offset-2 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {resendingVerification
                ? t("auth.recaptchaVerifying")
                : t("auth.resendVerification")}
            </button>
          )}
        </Alert>
      )}

      <Button
        type="submit"
        loading={loading}
        fullWidth
        size="lg"
        className="mt-4"
      >
        {messages.login}
      </Button>

      <AuthSocialButtons
        dividerLabel="auth.orLoginWith"
        redirectParam={redirectParam}
        className="mt-4 sm:mt-5"
      />

      <p className="mt-3 text-center text-[13px] text-fg-muted sm:mt-4">
        <LinkTo
          href="/auth/register"
          className="rounded-sm font-medium transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {t("auth.dontHaveAccount")}{" "}
          <span className="font-semibold text-brand">{t("auth.register")}</span>
        </LinkTo>
      </p>
    </form>
  );
}
