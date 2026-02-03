import { useTranslations } from "next-intl";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import * as yup from "yup";

// Parent registration schema
export const parentRegisterSchema = (
  t: ReturnType<typeof useTranslations<"">>
) =>
  yup.object().shape({
    firstName: yup
      .string()
      .required(t("auth.firstNameRequired"))
      .min(2, t("auth.firstNameMinLength")),
    lastName: yup
      .string()
      .required(t("auth.lastNameRequired"))
      .min(2, t("auth.lastNameMinLength")),
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
      .typeError(t("auth.countryInvalid")),
    state: yup
      .object()
      .shape({
        label: yup.string().required(t("auth.stateRequired")),
        value: yup.string().required(t("auth.stateRequired")),
      })
      .required(t("auth.stateRequired"))
      .typeError(t("auth.stateInvalid")),
    city: yup
      .object()
      .shape({
        label: yup.string().required(t("auth.cityRequired")),
        value: yup.string().required(t("auth.cityRequired")),
      })
      .required(t("auth.cityRequired"))
      .typeError(t("auth.cityInvalid")),
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

// Specialist registration schemas
export const specialistStep1Schema = (
  t: ReturnType<typeof useTranslations<"">>
) =>
  yup.object().shape({
    firstName: yup
      .string()
      .required(t("auth.firstNameRequired"))
      .min(2, t("auth.firstNameMinLength")),
    lastName: yup
      .string()
      .required(t("auth.lastNameRequired"))
      .min(2, t("auth.lastNameMinLength")),
    phone: yup
      .string()
      .required(t("auth.phoneRequired"))
      .test("is-possible-phone-number", t("auth.phoneInvalid"), (value) => {
        if (value) {
          return isPossiblePhoneNumber(value);
        }
        return true;
      }),
    email: yup
      .string()
      .required(t("auth.emailRequired"))
      .email(t("auth.emailInvalid")),
    gender: yup
      .object()
      .shape({
        label: yup.string().required(t("auth.genderRequired")),
        value: yup.string().required(t("auth.genderRequired")),
      })
      .required(t("auth.genderRequired"))
      .typeError(t("auth.genderInvalid")),
    country: yup
      .object()
      .shape({
        label: yup.string().required(t("auth.countryRequired")),
        value: yup.string().required(t("auth.countryRequired")),
      })
      .required(t("auth.countryRequired"))
      .typeError(t("auth.countryInvalid")),
    state: yup
      .object()
      .shape({
        label: yup.string().required(t("auth.stateRequired")),
        value: yup.string().required(t("auth.stateRequired")),
      })
      .required(t("auth.stateRequired"))
      .typeError(t("auth.stateInvalid")),
    city: yup
      .object()
      .shape({
        label: yup.string().required(t("auth.cityRequired")),
        value: yup.string().required(t("auth.cityRequired")),
      })
      .required(t("auth.cityRequired"))
      .typeError(t("auth.cityInvalid")),
    birthDate: yup
      .date()
      .required(t("auth.birthDateRequired"))
      .max(
        new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        t("auth.birthDateInvalid")
      )
      .typeError(t("auth.birthDateInvalid")),
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

export const specialistStep2Schema = (
  t: ReturnType<typeof useTranslations<"">>
) =>
  yup.object().shape({
    specialization: yup
      .object()
      .shape({
        label: yup.string().required(t("auth.specializationRequired")),
        value: yup.string().required(t("auth.specializationRequired")),
      })
      .required(t("auth.specializationRequired"))
      .typeError(t("auth.specializationInvalid")),

    fullName: yup
      .string()
      .required(t("auth.fullNameRequired"))
      .min(2, t("auth.fullNameMinLength")),
    nationalID: yup
      .string()
      .required(t("auth.nationalIDRequired"))
      .matches(/^[0-9]+$/, t("auth.nationalIDInvalid")),
    attachments: yup
      .array()
      .of(yup.mixed())
      .min(1, t("auth.attachmentsRequired")),

    ownsCenter: yup.boolean(),
  });

export const specialistStep3Schema = (
  t: ReturnType<typeof useTranslations<"">>
) =>
  yup.object().shape({
    centerName: yup.string().optional().min(2, t("auth.centerNameMinLength")),
    address: yup.string().min(5, t("auth.addressMinLength")),
    centerPhone: yup
      .string()
      .required(t("auth.centerPhoneRequired"))
      .test(
        "is-possible-phone-number",
        t("auth.centerPhoneInvalid"),
        (value) => {
          if (value) {
            return isPossiblePhoneNumber(value);
          }
          return true;
        }
      ),
    centerEmail: yup
      .string()
      .email(t("auth.centerEmailInvalid"))
      .required(t("auth.centerEmailRequired")),
    centerImages: yup
      .array()
      .of(yup.mixed())
      .min(1, t("auth.centerImagesRequired")),
    socialLinks: yup
      .object()
      .shape({
        facebook: yup.string().url(t("auth.facebookInvalid")).nullable(),
        instagram: yup.string().url(t("auth.instagramInvalid")).nullable(),
        whatsapp: yup.string().url(t("auth.whatsappInvalid")).nullable(),
        linkedin: yup.string().url(t("auth.linkedinInvalid")).nullable(),
        twitter: yup.string().url(t("auth.twitterInvalid")).nullable(),
        youtube: yup.string().url(t("auth.youtubeInvalid")).nullable(),
        tiktok: yup.string().url(t("auth.tiktokInvalid")).nullable(),
        telegram: yup.string().url(t("auth.telegramInvalid")).nullable(),
        reddit: yup.string().url(t("auth.redditInvalid")).nullable(),
        pinterest: yup.string().url(t("auth.pinterestInvalid")).nullable(),
        github: yup.string().url(t("auth.githubInvalid")).nullable(),
      })
      .optional()
      .test("at-least-one", t("auth.atLeastOneSocialLinkRequired"), (value) => {
        if (!value) return false;

        // check if any field has a non-empty value
        return Object.values(value).some(
          (v) => v && v.toString().trim() !== ""
        );
      }),
  });

// Combined specialist schema for final validation
