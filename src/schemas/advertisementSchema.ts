import {
  isValidExternalUrl,
  normalizeExternalUrl,
} from "@/lib/normalizeExternalUrl";
import { useTranslations } from "next-intl";
import * as yup from "yup";

export const createAdvertisementSchema = (
  t: ReturnType<typeof useTranslations<"Advertisements.addModal">>
) =>
  yup.object().shape({
    title: yup
      .string()
      .trim()
      .required(t("titleEnRequired")),
    titleAr: yup
      .string()
      .trim()
      .required(t("titleArRequired")),
    content: yup
      .string()
      .trim()
      .required(t("contentEnRequired")),
    contentAr: yup
      .string()
      .trim()
      .required(t("contentArRequired")),
    imageUrl: yup
      .string()
      .trim()
      .required(t("imageRequired")),
    linkUrl: yup
      .string()
      .trim()
      .nullable()
      .notRequired()
      .transform((val, originalValue) => {
        if (originalValue === "" || originalValue == null) return null;
        return normalizeExternalUrl(String(originalValue));
      })
      .test("is-valid-url", t("linkUrlInvalid"), (value) => {
        if (value == null || value === "") return true;
        return isValidExternalUrl(value);
      }),
  });

export type AdvertisementFormSchema = yup.InferType<
  ReturnType<typeof createAdvertisementSchema>
>;

