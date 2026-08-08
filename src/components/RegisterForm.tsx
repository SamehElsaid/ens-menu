"use client";

import { Controller, Resolver, useForm } from "react-hook-form";
import CustomInput from "@/components/Custom/CustomInput";
import { FiCheck, FiHome, FiMail, FiPhone, FiUser } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Field, Input, Spinner } from "@/components/ui";
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
    <ol className="register-steps mb-5 flex items-center gap-1.5 sm:mb-6">
      {steps.map((step, index) => {
        const isActive = index === activeIndex;
        const isDone = index < activeIndex;
        return (
          <li
            key={step.id}
            aria-current={isActive ? "step" : undefined}
            className="flex min-w-0 flex-1 items-center gap-1.5"
          >
            <span
              className={cn(
                "register-step-dot flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors duration-200",
                isDone && "bg-brand text-on-brand",
                isActive && "bg-brand-soft text-brand-soft-fg ring-2 ring-brand-line",
                !isActive && !isDone && "bg-surface-3 text-fg-subtle",
              )}
            >
              {/* State is carried by the glyph too, not colour alone. */}
              {isDone ? <FiCheck className="size-3.5 stroke-3" aria-hidden /> : index + 1}
            </span>
            <span
              className={cn(
                "hidden truncate text-[11px] font-semibold sm:block",
                isActive ? "text-brand-soft-fg" : "text-fg-subtle",
              )}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "register-step-line mx-0.5 hidden h-px flex-1 sm:block",
                  isDone ? "bg-brand-line" : "bg-line",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
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
      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-fg-subtle">
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
      className="register-form space-y-4 text-fg"
    >
      {steps.length > 0 && (
        <RegisterStepHeader steps={steps} activeIndex={activeStepIndex} />
      )}

      <RegisterSection title={sectionTitles.account}>
        <Controller
          control={control}
          name="fullName"
          render={({ field: { value, onChange } }) => (
            <Field label={messages.fullName} error={errors.fullName?.message}>
              <Input
                type="text"
                inputSize="md"
                startIcon={<FiUser size={15} />}
                placeholder={messages.fullName}
                autoComplete="name"
                value={value}
                onChange={onChange}
                className={fieldClass}
              />
            </Field>
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange } }) => {
            const checking =
              checkingField.email || Boolean(validatingFields.email);
            return (
              <Field label={messages.email} error={errors.email?.message}>
                <Input
                  type="email"
                  inputSize="md"
                  startIcon={<FiMail size={15} />}
                  endIcon={
                    checking ? (
                      <Spinner
                        size="xs"
                        label={t("auth.checkingAvailability")}
                      />
                    ) : undefined
                  }
                  placeholder={messages.email}
                  autoComplete="email"
                  value={value}
                  onChange={onChange}
                  className={fieldClass}
                />
              </Field>
            );
          }}
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
            <Field
              label={messages.resturantName}
              error={errors.resturantName?.message}
            >
              <Input
                type="text"
                inputSize="md"
                startIcon={<FiHome size={15} />}
                placeholder={messages.resturantName}
                autoComplete="organization"
                value={value}
                onChange={onChange}
                className={fieldClass}
              />
            </Field>
          )}
        />
      </RegisterSection>

      <RegisterSection title={sectionTitles.launch}>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange } }) => (
              <Field label={messages.password} error={errors.password?.message}>
                <Input
                  type="password"
                  inputSize="md"
                  startIcon={<TbLockPassword size={16} />}
                  placeholder={messages.password}
                  autoComplete="new-password"
                  value={value}
                  onChange={onChange}
                  className={fieldClass}
                />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { value, onChange } }) => (
              <Field
                label={messages.confirmPassword}
                error={errors.confirmPassword?.message}
              >
                <Input
                  type="password"
                  inputSize="md"
                  startIcon={<TbLockPassword size={16} />}
                  placeholder={messages.confirmPassword}
                  autoComplete="new-password"
                  value={value}
                  onChange={onChange}
                  className={fieldClass}
                />
              </Field>
            )}
          />
        </div>

        <CustomRecaptcha
          ref={recaptchaRef}
          mode="on-demand"
          className="mt-1"
          onVerifiedChange={setRecaptchaVerified}
        />

        <Button
          type="submit"
          loading={loading}
          fullWidth
          size="lg"
          className="mt-2"
        >
          {loading ? t("auth.loading") : messages.register}
        </Button>

        <AuthSocialButtons
          dividerLabel="auth.orRegisterWith"
          className="mt-3"
        />
      </RegisterSection>

      <p className="pt-1 text-center text-[13px] text-fg-muted">
        <LinkTo
          href="/auth/login"
          className="rounded-sm font-medium transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {t("auth.haveAccount")}{" "}
          <span className="font-semibold text-brand">{t("auth.login")}</span>
        </LinkTo>
      </p>
    </form>
  );
}
