"use client";

import { Controller, Resolver, useForm } from "react-hook-form";
import CustomInput from "@/components/Custom/CustomInput";
import { FiHome, FiMail, FiPhone, FiUser } from "react-icons/fi";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocale, useTranslations } from "next-intl";
import { registerSchema, RegisterSchema } from "@/schemas/registerSchema";
import LinkTo from "./Global/LinkTo";
import CustomRecaptcha, {
  type RecaptchaGateHandle,
} from "@/components/Auth/CustomRecaptcha";
import { useCallback, useRef, useState } from "react";
import { axiosGet, axiosPost } from "@/shared/axiosCall";
import { pushSignUpEvent } from "@/shared/gtmEvents";
import { toast } from "react-toastify";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { TbLockPassword } from "react-icons/tb";
import AuthSocialButtons from "@/components/Auth/AuthSocialButtons";

let emailCheckTimeout: ReturnType<typeof setTimeout> | null = null;
let lastCheckedAvailableEmail: string | null = null;
let phoneCheckTimeout: ReturnType<typeof setTimeout> | null = null;
let lastCheckedAvailablePhone: string | null = null;

type RegisterStep = {
  id: string;
  label: string;
};

type RegisterFormProps = {
  steps?: RegisterStep[];
};

function RegisterStepHeader({
  steps,
  activeIndex,
}: {
  steps: RegisterStep[];
  activeIndex: number;
}) {
  return (
    <div className="register-steps mb-5 flex items-center gap-1.5 sm:mb-6">
      {steps.map((step, index) => {
        const isActive = index === activeIndex;
        const isDone = index < activeIndex;
        return (
          <div key={step.id} className="flex min-w-0 flex-1 items-center gap-1.5">
            <span
              className={cn(
                "register-step-dot flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300",
                isDone &&
                  "bg-purple-600 text-white shadow-sm shadow-purple-600/25 dark:bg-purple-500",
                isActive &&
                  "bg-purple-100 text-purple-700 ring-2 ring-purple-500/30 dark:bg-purple-500/15 dark:text-purple-300 dark:ring-purple-400/30",
                !isActive &&
                  !isDone &&
                  "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
              )}
            >
              {index + 1}
            </span>
            <span
              className={cn(
                "hidden truncate text-[11px] font-semibold sm:block",
                isActive
                  ? "text-purple-700 dark:text-purple-300"
                  : "text-slate-400 dark:text-slate-500",
              )}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "register-step-line mx-0.5 hidden h-px flex-1 sm:block",
                  isDone ? "bg-purple-400/60" : "bg-slate-200 dark:bg-slate-700",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function RegisterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="register-form-section space-y-2.5">
      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {title}
      </h3>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

export default function RegisterForm({ steps = [] }: RegisterFormProps) {
  const t = useTranslations("");
  const locale = useLocale();
  const [checkingField, setCheckingField] = useState({
    email: false,
    phone: false,
  });

  const setFieldChecking = useCallback(
    (field: "email" | "phone", checking: boolean) => {
      setCheckingField((prev) =>
        prev[field] === checking ? prev : { ...prev, [field]: checking },
      );
    },
    [],
  );

  const checkEmailAvailableDebounced = useCallback(
    (email: string): Promise<boolean> =>
      new Promise((resolve) => {
        if (emailCheckTimeout) clearTimeout(emailCheckTimeout);
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          setFieldChecking("email", false);
          resolve(true);
          return;
        }
        if (lastCheckedAvailableEmail === email) {
          setFieldChecking("email", false);
          resolve(true);
          return;
        }
        setFieldChecking("email", true);
        emailCheckTimeout = setTimeout(async () => {
          emailCheckTimeout = null;
          try {
            const res = await axiosGet<{ isAvailable?: boolean }>(
              "/auth/check-availability",
              locale,
              undefined,
              { email },
              true,
            );
            const available =
              res.status === true && res.data?.isAvailable === true;
            if (available) lastCheckedAvailableEmail = email;
            resolve(available);
          } finally {
            setFieldChecking("email", false);
          }
        }, 400);
      }),
    [locale, setFieldChecking],
  );

  const checkPhoneAvailableDebounced = useCallback(
    (phone: string): Promise<boolean> =>
      new Promise((resolve) => {
        if (phoneCheckTimeout) clearTimeout(phoneCheckTimeout);
        if (!phone || !/^\+?[0-9]{8,15}$/.test(phone)) {
          setFieldChecking("phone", false);
          resolve(true);
          return;
        }
        if (lastCheckedAvailablePhone === phone) {
          setFieldChecking("phone", false);
          resolve(true);
          return;
        }
        setFieldChecking("phone", true);
        phoneCheckTimeout = setTimeout(async () => {
          phoneCheckTimeout = null;
          try {
            const res = await axiosGet<{ isAvailable?: boolean }>(
              "/auth/check-availability",
              locale,
              undefined,
              { phoneNumber: phone },
              true,
            );
            const available =
              res.status === true && res.data?.isAvailable === true;
            if (available) lastCheckedAvailablePhone = phone;
            resolve(available);
          } finally {
            setFieldChecking("phone", false);
          }
        }, 400);
      }),
    [locale, setFieldChecking],
  );

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, validatingFields },
  } = useForm<RegisterSchema>({
    defaultValues: {
      fullName: "",
      resturantName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    resolver: yupResolver(
      registerSchema(t, {
        checkEmailAvailable: checkEmailAvailableDebounced,
        checkPhoneAvailable: checkPhoneAvailableDebounced,
      }),
    ) as unknown as Resolver<RegisterSchema>,
    mode: "onChange",
  });

  const watched = watch(["fullName", "email", "phone", "resturantName", "password"]);
  const activeStepIndex =
    !watched[0] || !watched[1] || !watched[2]
      ? 0
      : !watched[3]
        ? 1
        : 2;

  const messages = {
    fullName: t("auth.fullName"),
    resturantName: t("auth.resturantName"),
    email: t("auth.email"),
    phone: t("auth.phone"),
    password: t("auth.password"),
    confirmPassword: t("auth.confirmPassword"),
    register: t("auth.register"),
  };

  const sectionTitles = {
    account: t("registerPage.sections.account"),
    business: t("registerPage.sections.business"),
    launch: t("registerPage.sections.launch"),
  };

  const [loading, setLoading] = useState(false);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const recaptchaRef = useRef<RecaptchaGateHandle>(null);
  const router = useRouter();

  const onSubmit = async (data: RegisterSchema) => {
    setLoading(true);

    if (!recaptchaVerified) {
      const verified = await recaptchaRef.current?.promptVerification();
      if (!verified) {
        setLoading(false);
        return;
      }
    }

    const dataSend = {
      name: data.fullName,
      restaurantName: data.resturantName,
      email: data.email,
      phoneNumber: data.phone,
      password: data.password,
    };
    const response = await axiosPost<typeof dataSend, unknown>(
      "/auth/signup",
      locale,
      dataSend,
      false,
      true,
    );
    if (response.status) {
      pushSignUpEvent();
      toast.success(t("auth.registerSuccess"));
      router.push("/auth/login");
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  const fieldClass = "register-field-input";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="register-form space-y-4 text-slate-800 dark:text-slate-100"
    >
      {steps.length > 0 && (
        <RegisterStepHeader steps={steps} activeIndex={activeStepIndex} />
      )}

      <RegisterSection title={sectionTitles.account}>
        <Controller
          control={control}
          name="fullName"
          render={({ field: { value, onChange } }) => (
            <CustomInput
              type="text"
              placeholder={messages.fullName}
              id="fullName"
              icon={<FiUser size={15} />}
              label={messages.fullName}
              error={errors.fullName?.message}
              value={value}
              onChange={onChange}
              size="small"
              className={fieldClass}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange } }) => (
            <CustomInput
              type="email"
              placeholder={messages.email}
              id="email"
              icon={<FiMail size={15} />}
              label={messages.email}
              error={errors.email?.message}
              loading={checkingField.email || Boolean(validatingFields.email)}
              loadingLabel={t("auth.checkingAvailability")}
              value={value}
              onChange={onChange}
              size="small"
              className={fieldClass}
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { value, onChange } }) => (
            <CustomInput
              type="tel"
              placeholder={messages.phone}
              id="phone"
              icon={<FiPhone size={15} />}
              label={messages.phone}
              error={errors.phone?.message}
              loading={checkingField.phone || Boolean(validatingFields.phone)}
              loadingLabel={t("auth.checkingAvailability")}
              value={value}
              onChange={onChange}
              size="small"
              className={fieldClass}
            />
          )}
        />
      </RegisterSection>

      <RegisterSection title={sectionTitles.business}>
        <Controller
          control={control}
          name="resturantName"
          render={({ field: { value, onChange } }) => (
            <CustomInput
              type="text"
              placeholder={messages.resturantName}
              id="resturantName"
              icon={<FiHome size={15} />}
              label={messages.resturantName}
              error={errors.resturantName?.message}
              value={value}
              onChange={onChange}
              size="small"
              className={fieldClass}
            />
          )}
        />
      </RegisterSection>

      <RegisterSection title={sectionTitles.launch}>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange } }) => (
              <CustomInput
                type="password"
                placeholder={messages.password}
                id="password"
                icon={<TbLockPassword size={16} />}
                label={messages.password}
                error={errors.password?.message}
                value={value}
                onChange={onChange}
                size="small"
                className={fieldClass}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { value, onChange } }) => (
              <CustomInput
                type="password"
                placeholder={messages.confirmPassword}
                id="confirmPassword"
                icon={<TbLockPassword size={16} />}
                label={messages.confirmPassword}
                error={errors.confirmPassword?.message}
                value={value}
                onChange={onChange}
                size="small"
                className={fieldClass}
              />
            )}
          />
        </div>

        <CustomRecaptcha
          ref={recaptchaRef}
          mode="on-demand"
          className="mt-1"
          onVerifiedChange={setRecaptchaVerified}
        />

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "register-submit-btn relative mt-2 flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-[15px] font-semibold text-white transition-all duration-300 enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_16px_40px_-12px_rgba(124,58,237,0.55)] disabled:cursor-not-allowed",
            loading
              ? "register-submit-btn--loading"
              : "disabled:opacity-55",
          )}
        >
          {loading ? (
            <>
              <span className="register-submit-btn__spinner" aria-hidden />
              <span>{t("auth.loading")}</span>
            </>
          ) : (
            messages.register
          )}
        </button>

        <AuthSocialButtons
          dividerLabel="auth.orRegisterWith"
          className="mt-3"
        />
      </RegisterSection>

      <p className="pt-1 text-center text-[13px] text-slate-500 dark:text-slate-400">
        <LinkTo
          href="/auth/login"
          className="font-medium text-slate-600 transition-colors hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400"
        >
          {t("auth.haveAccount")}{" "}
          <span className="font-semibold text-purple-600 dark:text-purple-400">
            {t("auth.login")}
          </span>
        </LinkTo>
      </p>
    </form>
  );
}
