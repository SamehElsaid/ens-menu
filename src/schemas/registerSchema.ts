import { useTranslations } from "next-intl";
import * as yup from "yup";

export const registerSchema = (t: ReturnType<typeof useTranslations<"">>) =>
  yup.object().shape({
    fullName: yup
      .string()
      .required(t("auth.fullNameRequired")),
    email: yup
      .string()
      .required(t("auth.emailRequired"))
      .email(t("auth.emailInvalid")),
    phone: yup
      .string()
      .required(t("auth.phoneRequired"))
      .matches(/^\+?[0-9]{8,15}$/, t("auth.phoneInvalid")),
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

export type RegisterSchema = yup.InferType<ReturnType<typeof registerSchema>>;

