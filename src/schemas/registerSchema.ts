import { useTranslations } from "next-intl";
import * as yup from "yup";

export type RegisterSchemaOptions = {
  checkEmailAvailable?: (email: string) => Promise<boolean>;
  checkPhoneAvailable?: (phone: string) => Promise<boolean>;
};

export const registerSchema = (
  t: ReturnType<typeof useTranslations<"">>,
  options?: RegisterSchemaOptions
) => {
  const baseEmail = yup
    .string()
    .required(t("auth.emailRequired"))
    .email(t("auth.emailInvalid"));

  const emailWithAvailability = options?.checkEmailAvailable
    ? baseEmail.test(
        "email-available",
        t("auth.emailAlreadyInUse"),
        async (value) => {
          if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return true;
          return options.checkEmailAvailable!(value);
        }
      )
    : baseEmail;

  return yup.object().shape({
    fullName: yup
      .string()
      .required(t("auth.fullNameRequired")),
    email: emailWithAvailability,
    phone: (() => {
      const basePhone = yup
        .string()
        .required(t("auth.phoneRequired"))
        .matches(/^\+?[0-9]{8,15}$/, t("auth.phoneInvalid"));
      return options?.checkPhoneAvailable
        ? basePhone.test(
            "phone-available",
            t("auth.phoneAlreadyInUse"),
            async (value) => {
              if (!value || !/^\+?[0-9]{8,15}$/.test(value)) return true;
              return options.checkPhoneAvailable!(value);
            }
          )
        : basePhone;
    })(),
    password: yup
      .string()
      .required(t("auth.passwordRequired"))
      .min(8, t("auth.passwordMinLength"))
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, t("auth.passwordInvalid")),
    confirmPassword: yup
      .string()
      .required(t("auth.confirmPasswordRequired"))
      .oneOf([yup.ref("password")], t("auth.confirmPasswordInvalid")),
  });
};

export type RegisterSchema = yup.InferType<ReturnType<typeof registerSchema>>;

