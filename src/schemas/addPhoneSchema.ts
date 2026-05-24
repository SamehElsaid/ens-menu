import * as yup from "yup";

export type AddPhoneSchema = {
  phone: string;
};

export function addPhoneSchema(t: (key: string) => string) {
  return yup.object({
    phone: yup
      .string()
      .required(t("auth.phoneRequired"))
      .matches(/^\+?[0-9]{8,15}$/, t("auth.phoneInvalid")),
  });
}
