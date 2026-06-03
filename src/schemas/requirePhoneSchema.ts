import { useTranslations } from "next-intl";
import * as yup from "yup";

export type RequirePhoneSchemaOptions = {
  checkPhoneAvailable?: (phone: string) => Promise<boolean>;
  requirePhone?: boolean;
  requireRestaurantName?: boolean;
};

export const requirePhoneSchema = (
  t: ReturnType<typeof useTranslations<"">>,
  options?: RequirePhoneSchemaOptions,
) => {
  const shape: Record<string, yup.StringSchema> = {};

  if (options?.requireRestaurantName) {
    shape.restaurantName = yup
      .string()
      .required(t("auth.resturantNameRequired"));
  }

  if (options?.requirePhone) {
    const basePhone = yup
      .string()
      .required(t("auth.phoneRequired"))
      .matches(/^\+?[0-9]{8,15}$/, t("auth.phoneInvalid"));

    shape.phone = options.checkPhoneAvailable
      ? basePhone.test(
          "phone-available",
          t("auth.phoneAlreadyInUse"),
          async (value) => {
            if (!value || !/^\+?[0-9]{8,15}$/.test(value)) return true;
            return options.checkPhoneAvailable!(value);
          },
        )
      : basePhone;
  }

  return yup.object().shape(shape);
};

export type RequirePhoneSchema = yup.InferType<
  ReturnType<typeof requirePhoneSchema>
>;
