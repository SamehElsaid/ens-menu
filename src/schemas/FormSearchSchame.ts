import { useTranslations } from "next-intl";
import * as yup from "yup";

export const searchFormSchema = (t: ReturnType<typeof useTranslations<"">>) =>
  yup.object().shape({
    speciality: yup
      .object()
      .shape({
        label: yup.string().required(t("auth.specializationRequired")),
        value: yup.string().required(t("auth.specializationRequired")),
      })
      .optional().nullable(),
    state: yup
      .object()
      .shape({
        label: yup.string().required(t("auth.stateRequired")),
        value: yup.string().required(t("auth.stateRequired")),
      })
      .optional().nullable(),
    city: yup
      .object()
      .shape({
        label: yup.string().required(t("auth.cityRequired")),
        value: yup.string().required(t("auth.cityRequired")),
      })
      .optional().nullable(),
    search: yup.string().optional(),
  });
