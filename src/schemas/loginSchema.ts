import { useTranslations } from "next-intl";
import * as yup from "yup";

export const loginSchema = (t: ReturnType<typeof useTranslations<"">>) =>
  yup.object().shape({
    email: yup
      .string()
      .required(t("auth.emailRequired"))
      .email(t("auth.emailInvalid")),
    password: yup
      .string()
      .required(t("auth.passwordRequired"))
      .min(8, t("auth.passwordMinLength"))
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, t("auth.passwordInvalid")),
  });

export type LoginSchema = yup.InferType<ReturnType<typeof loginSchema>>;
