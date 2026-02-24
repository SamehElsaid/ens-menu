import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["ar", "en"],

  // Used when no locale matches — Arabic is the default
  defaultLocale: "ar",

  // Don't use browser language; always use default (ar) when no locale in URL
  localeDetection: false,

  localePrefix: "as-needed",
});
