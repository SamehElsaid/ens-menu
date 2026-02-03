import { useTranslations } from "next-intl";
import * as yup from "yup";
import { _checkFileSize, _checkFileType } from "@/shared/_shared";

export const createDashboardSchema = (
  t: ReturnType<typeof useTranslations<"">>,
  type?: "specialist" | "parent"
) => {
  const commonSchema: Record<string, yup.Schema<unknown>> = {
    profileImage: yup
      .mixed<File>()
      .nullable()
      .test(
        "fileSize",
        t("form.sizeMustBeLessThan{size}MB", { size: "2" }),
        (value) => {
          if (!value) return true;
          return _checkFileSize(value as File, 2);
        }
      )
      .test("fileType", t("form.onlyPNGWEBPJPGAllowed"), (value) => {
        if (!value) return true;
        return _checkFileType(value as File);
      }) as yup.Schema<File | null>,
    firstName: yup
      .string()
      .required(t("auth.firstNameRequired"))
      .min(2, t("auth.firstNameMinLength")),
    lastName: yup
      .string()
      .required(t("auth.lastNameRequired"))
      .min(2, t("auth.lastNameMinLength")),
    displayNameEn: yup
      .string()
      .required(t("auth.displayNameRequired"))
      .min(2, t("auth.displayNameMinLength")),
    displayNameAr: yup
      .string()
      .required(t("auth.displayNameRequired"))
      .min(2, t("auth.displayNameMinLength")),
    phone: yup
      .string()
      .required(t("auth.phoneRequired"))
      .matches(/^[0-9+\-\s()]+$/, t("auth.phoneInvalid")),
    email: yup
      .string()
      .required(t("auth.emailRequired"))
      .email(t("auth.emailInvalid")),
    country: yup
      .object()
      .shape({
        label: yup.string().required(t("auth.countryRequired")),
        value: yup.string().required(t("auth.countryRequired")),
      })
      .required(t("auth.countryRequired"))
      .typeError(t("auth.countryInvalid"))
      .nullable(),
    state: yup
      .object()
      .shape({
        label: yup.string().required(t("auth.stateRequired")),
        value: yup.string().required(t("auth.stateRequired")),
      })
      .required(t("auth.stateRequired"))
      .typeError(t("auth.stateInvalid"))
      .nullable(),
    city: yup
      .object()
      .shape({
        label: yup.string().required(t("auth.cityRequired")),
        value: yup.string().required(t("auth.cityRequired")),
      })
      .required(t("auth.cityRequired"))
      .typeError(t("auth.cityInvalid"))
      .nullable(),
    gender: yup
      .object()
      .shape({
        label: yup.string().required(t("auth.genderRequired")),
        value: yup.string().required(t("auth.genderRequired")),
      })
      .required(t("auth.genderRequired"))
      .typeError(t("auth.genderInvalid"))
      .nullable(),
  };

  if (type === "parent") {
    commonSchema.attachments = yup
      .array()
      .of(yup.mixed())
      .min(1, t("auth.attachmentsRequired"));
  }
  return yup.object().shape(commonSchema);
};
