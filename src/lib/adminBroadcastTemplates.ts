import arMessages from "../../messages/ar.json";
import enMessages from "../../messages/en.json";

export type BroadcastTemplateAudience = "products-no-image";
export type BroadcastEmailLocale = "ar" | "en";

const LOCALE_MESSAGES = {
  ar: arMessages,
  en: enMessages,
} as const;

export function getBroadcastTemplate(
  audience: BroadcastTemplateAudience,
  emailLocale: BroadcastEmailLocale,
): { subject: string; message: string } {
  const template =
    LOCALE_MESSAGES[emailLocale].adminBroadcast.templates[audience];
  return {
    subject: template.subject,
    message: template.message,
  };
}

export function hasBroadcastTemplate(
  audience: string,
): audience is BroadcastTemplateAudience {
  return audience === "products-no-image";
}
