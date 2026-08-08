"use client";

import { Controller, Resolver, useForm } from "react-hook-form";
import { FiHome, FiMail, FiPhone, FiUser } from "react-icons/fi";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocale, useTranslations } from "next-intl";
import { registerSchema, RegisterSchema } from "@/schemas/registerSchema";
import CustomRecaptcha, {
  type RecaptchaGateHandle,
} from "@/components/Auth/CustomRecaptcha";
import { useCallback, useRef, useState } from "react";
import { axiosGet, axiosPost } from "@/shared/axiosCall";
import { pushSignUpEvent } from "@/shared/gtmEvents";
import { toast } from "react-toastify";
import { useRouter } from "@/i18n/navigation";
import AuthSocialButtons from "@/components/Auth/AuthSocialButtons";
import { Field, Input, PasswordInput } from "@/components/site/Form";
import { SiteButton, SiteSpinner } from "@/components/site/Button";

let emailCheckTimeout: ReturnType<typeof setTimeout> | null = null;
let lastCheckedAvailableEmail: string | null = null;
let phoneCheckTimeout: ReturnType<typeof setTimeout> | null = null;
let lastCheckedAvailablePhone: string | null = null;

export default function RegisterForm() {
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

  const messages = {
    fullName: t("auth.fullName"),
    resturantName: t("auth.resturantName"),
    email: t("auth.email"),
    phone: t("auth.phone"),
    password: t("auth.password"),
    confirmPassword: t("auth.confirmPassword"),
    register: t("auth.register"),
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

  /** Availability is checked as you type; the spinner says so rather than
   *  leaving the field looking idle while a request is in flight. */
  const availabilitySlot = (checking: boolean) =>
    checking ? (
      <span className="pe-2">
        <SiteSpinner label={t("auth.checkingAvailability")} />
      </span>
    ) : undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-4">
        <Controller
          control={control}
          name="fullName"
          render={({ field: { value, onChange } }) => (
            <Field
              label={messages.fullName}
              error={errors.fullName?.message}
              htmlFor="register-name"
            >
              <Input
                id="register-name"
                type="text"
                startIcon={<FiUser className="size-4" />}
                autoComplete="name"
                invalid={Boolean(errors.fullName)}
                value={value}
                onChange={onChange}
              />
            </Field>
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange } }) => (
            <Field
              label={messages.email}
              error={errors.email?.message}
              htmlFor="register-email"
            >
              <Input
                id="register-email"
                type="email"
                inputMode="email"
                startIcon={<FiMail className="size-4" />}
                endSlot={availabilitySlot(
                  checkingField.email || Boolean(validatingFields.email),
                )}
                autoComplete="email"
                invalid={Boolean(errors.email)}
                value={value}
                onChange={onChange}
              />
            </Field>
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { value, onChange } }) => (
            <Field
              label={messages.phone}
              error={errors.phone?.message}
              htmlFor="register-phone"
            >
              <Input
                id="register-phone"
                type="tel"
                inputMode="tel"
                dir="ltr"
                startIcon={<FiPhone className="size-4" />}
                endSlot={availabilitySlot(
                  checkingField.phone || Boolean(validatingFields.phone),
                )}
                autoComplete="tel"
                invalid={Boolean(errors.phone)}
                value={value}
                onChange={onChange}
              />
            </Field>
          )}
        />

        <Controller
          control={control}
          name="resturantName"
          render={({ field: { value, onChange } }) => (
            <Field
              label={messages.resturantName}
              error={errors.resturantName?.message}
              htmlFor="register-venue"
            >
              <Input
                id="register-venue"
                type="text"
                startIcon={<FiHome className="size-4" />}
                autoComplete="organization"
                invalid={Boolean(errors.resturantName)}
                value={value}
                onChange={onChange}
              />
            </Field>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange } }) => (
              <Field
                label={messages.password}
                error={errors.password?.message}
                hint={t("site.auth.register.passwordHint")}
                htmlFor="register-password"
              >
                <PasswordInput
                  id="register-password"
                  autoComplete="new-password"
                  invalid={Boolean(errors.password)}
                  showLabel={t("auth.showPassword")}
                  hideLabel={t("auth.hidePassword")}
                  value={value}
                  onChange={onChange}
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
                htmlFor="register-confirm"
              >
                <PasswordInput
                  id="register-confirm"
                  autoComplete="new-password"
                  invalid={Boolean(errors.confirmPassword)}
                  showLabel={t("auth.showPassword")}
                  hideLabel={t("auth.hidePassword")}
                  value={value}
                  onChange={onChange}
                />
              </Field>
            )}
          />
        </div>
      </div>

      <CustomRecaptcha
        ref={recaptchaRef}
        mode="on-demand"
        className="mt-5"
        onVerifiedChange={setRecaptchaVerified}
      />

      <SiteButton type="submit" loading={loading} block size="lg" className="mt-6">
        {messages.register}
      </SiteButton>

      <AuthSocialButtons dividerLabel="auth.orRegisterWith" className="mt-6" />
    </form>
  );
}
