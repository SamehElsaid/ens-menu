"use client";

import { Controller, Resolver, useForm } from "react-hook-form";
import CustomInput from "@/components/Custom/CustomInput";
import { FaEnvelope } from "react-icons/fa";
import { TbLockPassword } from "react-icons/tb";
import { FiCheck, FiLoader } from "react-icons/fi";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocale, useTranslations } from "next-intl";
import { loginSchema, LoginSchema } from "@/schemas/loginSchema";
import { encryptData } from "@/shared/encryption";
import Cookies from "js-cookie";
import { useSearchParams } from "next/navigation";
import { resolvePostLoginPath } from "@/lib/authRedirect";
import LinkTo from "./Global/LinkTo";
import { SET_ACTIVE_USER } from "@/store/authSlice/authSlice";
import { useAppDispatch } from "@/store/hooks";
import { axiosPost } from "@/shared/axiosCall";
import { useEffect, useRef, useState } from "react";
import { LoginResponse } from "@/types/LoginResponse";
import GoogleSignInButton from "@/components/Auth/GoogleSignInButton";
import { syncFcmToken } from "@/shared/syncFcmToken";
import CustomRecaptcha, {
  type RecaptchaGateHandle,
} from "./Auth/CustomRecaptcha";
import { cn } from "@/lib/cn";

const REMEMBER_EMAIL_KEY = "ensmenu_remember_email";

export default function LoginForm() {
  const t = useTranslations("");
  const dispatch = useAppDispatch();
  const {
    control,
    handleSubmit,
    setValue,
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

      const saveTokens = {
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

      window.location.href = resolvePostLoginPath(
        locale,
        user?.role,
        redirectParam,
      );
      if (user) {
        dispatch(SET_ACTIVE_USER({ user }));
      }
    } else {
      const payload = response.data as {
        message?: string;
        error?: string;
        errorType?: string;
      };
      const errorMessage =
        payload?.error ||
        payload?.message ||
        t("auth.invalidCredentials");
      setApiError(errorMessage);
      setLoading(false);
      recaptchaRef.current?.reset();
      setRecaptchaVerified(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="login-form">
      <div className="login-form__fields space-y-3">
        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange } }) => (
            <CustomInput
              type="email"
              placeholder={messages.email}
              id="login-email"
              icon={<FaEnvelope size={14} />}
              label={messages.email}
              error={errors.email?.message}
              value={value}
              onChange={(e) => {
                setApiError(null);
                onChange(e);
              }}
              size="small"
              className="login-field-input"
            />
          )}
        />

        <div className="login-form__password-group space-y-1.5">
          <label
            htmlFor="login-password"
            className="block text-[12px] font-medium text-slate-600 dark:text-slate-400"
          >
            {messages.password}
          </label>
          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange } }) => (
              <CustomInput
                type="password"
                placeholder={messages.password}
                id="login-password"
                icon={<TbLockPassword size={15} />}
                error={errors.password?.message}
                value={value}
                onChange={(e) => {
                  setApiError(null);
                  onChange(e);
                }}
                size="small"
                className="login-field-input"
              />
            )}
          />
          <LinkTo
            href="/auth/reset-password"
            className="login-forgot-link inline-block pt-0.5 text-start text-[12px] font-medium text-purple-600 transition-colors hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
          >
            {t("auth.forgotPassword")}
          </LinkTo>
        </div>
      </div>

      <label className="login-remember-me mt-3 flex cursor-pointer items-center gap-2.5 text-start">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="login-remember-me__input sr-only"
        />
        <span
          aria-hidden
          className={cn(
            "login-remember-me__box flex size-[18px] shrink-0 items-center justify-center rounded-[6px] border-2 transition-all duration-200",
            rememberMe
              ? "border-purple-600 bg-purple-600 shadow-[0_0_0_3px_rgba(124,58,237,0.2)] dark:border-purple-500 dark:bg-purple-500"
              : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900",
          )}
        >
          <FiCheck
            className={cn(
              "size-3 text-white transition-all duration-200",
              rememberMe ? "scale-100 opacity-100" : "scale-75 opacity-0",
            )}
          />
        </span>
        <span className="text-[13px] font-medium text-slate-600 dark:text-slate-400">
          {t("auth.rememberMe")}
        </span>
      </label>

      {/* Silent captcha — modal only on submit */}
      <CustomRecaptcha
        ref={recaptchaRef}
        mode="on-demand"
        silent
        onVerifiedChange={setRecaptchaVerified}
      />

      {apiError && (
        <div
          role="alert"
          className="login-form__error mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] font-medium text-red-800 dark:border-red-500/35 dark:bg-red-950/40 dark:text-red-300"
        >
          {apiError}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="login-submit-btn mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className={cn("relative z-1", loading && "opacity-0")}>
          {messages.login}
        </span>
        {loading && (
          <FiLoader className="absolute size-5 animate-spin" aria-hidden />
        )}
      </button>

      <GoogleSignInButton
        dividerLabel="auth.orLoginWith"
        redirectParam={redirectParam}
        variant="full"
        className="mt-4 sm:mt-5"
      />

      <p className="mt-3 text-center text-[13px] text-slate-500 sm:mt-4 dark:text-slate-400">
        <LinkTo
          href="/auth/register"
          className="font-medium text-slate-600 transition-colors hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400"
        >
          {t("auth.dontHaveAccount")}{" "}
          <span className="font-semibold text-purple-600 dark:text-purple-400">
            {t("auth.register")}
          </span>
        </LinkTo>
      </p>
    </form>
  );
}