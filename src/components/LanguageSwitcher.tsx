"use client";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
export default function LanguageSwitcher() {
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams() as URLSearchParams;

  const changeLanguage = (
    locale: string,
    pathname: string,
    link: { locale: string }
  ) => {
    if (locale === link?.locale) return;
    const query = searchParams.toString();

    router.replace(`${pathname}?${query}`, { locale: link?.locale });
  };

  return (
    <div className="flex gap-2 ">
      <button
        onClick={() =>
          changeLanguage(locale || "", pathname, {
            locale: locale === "ar" ? "en" : "ar",
          })
        }
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          locale === "ar"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        }`}
      >
        {locale === "ar" ? "English" : "العربية"}
      </button>
    </div>
  );
}
