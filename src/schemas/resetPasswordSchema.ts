import { useTranslations } from "next-intl";
import * as yup from "yup";

export const forgotPasswordSchema = (t: ReturnType<typeof useTranslations<"">>) =>
  yup.object().shape({
    email: yup
      .string()
      .required(t("auth.emailRequired"))
      .email(t("auth.emailInvalid")),
  });

export const resetPasswordSchema = (t: ReturnType<typeof useTranslations<"">>) =>
  yup.object().shape({
    newPassword: yup
      .string()
      .required(t("auth.passwordRequired"))
      .min(8, t("auth.passwordMinLength"))
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, t("auth.passwordInvalid")),
    confirmNewPassword: yup
      .string()
      .required(t("auth.confirmPasswordRequired"))
      .oneOf([yup.ref("newPassword")], t("auth.confirmPasswordInvalid")),
  });

export type ForgotPasswordSchema = yup.InferType<
  ReturnType<typeof forgotPasswordSchema>
>;
export type ResetPasswordSchema = yup.InferType<
  ReturnType<typeof resetPasswordSchema>
>;
