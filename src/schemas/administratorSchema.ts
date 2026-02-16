import { useTranslations } from "next-intl";
import * as yup from "yup";

export const createAdministratorSchema = (t: ReturnType<typeof useTranslations<"">>) =>
  yup.object().shape({
    name: yup
      .string()
      .required(t("auth.fullNameRequired") || "Name is required")
      .min(2, "Name must be at least 2 characters"),
    email: yup
      .string()
      .required(t("auth.emailRequired") || "Email is required")
      .email(t("auth.emailInvalid") || "Invalid email address"),
    password: yup
      .string()
      .required(t("auth.passwordRequired") || "Password is required")
      .min(8, t("auth.passwordMinLength") || "Password must be at least 8 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, t("auth.passwordInvalid") || "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  });

export type AdministratorFormSchema = yup.InferType<ReturnType<typeof createAdministratorSchema>>;
