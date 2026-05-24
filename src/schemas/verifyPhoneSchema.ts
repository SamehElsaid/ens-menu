import * as yup from "yup";

export type VerifyPhoneSchema = {
  code: string;
};

export function verifyPhoneSchema(t: (key: string) => string) {
  return yup.object({
    code: yup
      .string()
      .required(t("auth.verificationCodeRequired"))
      .matches(/^\d{6}$/, t("auth.verificationCodeInvalid")),
  });
}
