import { useTranslations } from "next-intl";
import * as yup from "yup";

const slugRegex = /^[a-z0-9-]+$/;

export const createMenuSchema = (
  t: ReturnType<typeof useTranslations<"Menus.createModal">>
) =>
  yup.object().shape({
    name: yup.string().required(t("validation.nameEnRequired")),
    nameAr: yup.string().required(t("validation.nameArRequired")),
    description: yup.string(),
    descriptionAr: yup.string(),
    slug: yup
      .string()
      .required(t("validation.slugRequired"))
      .min(3, t("validation.slugMin"))
      .matches(slugRegex, t("validation.slugInvalid")),
    currency: yup.string().required(t("validation.currencyRequired")),
  });

export type CreateMenuSchema = yup.InferType<
  ReturnType<typeof createMenuSchema>
>;
