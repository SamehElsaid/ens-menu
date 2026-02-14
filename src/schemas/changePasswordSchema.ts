import { useTranslations } from "next-intl";
import * as yup from "yup";

export const changePasswordSchema = (t: ReturnType<typeof useTranslations<"">>) =>
  yup.object().shape({
    currentPassword: yup
      .string()
      .required(t("auth.passwordRequired")),
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

export type ChangePasswordSchema = yup.InferType<ReturnType<typeof changePasswordSchema>>;
