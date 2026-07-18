import { localizeHref } from "@/i18n/routing";
import { flagIcons } from "@/svg/flags";

interface LanguageToggleProps {
  locale: string;
  pathname: string;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({
  locale,
  pathname,
}) => {
  const toggleLanguage = () => {
    const targetLocale = locale === "ar" ? "en" : "ar";
    const cleanPath = pathname.replace(/^\/(ar|en)/, "") || "/";
    const targetPath = localizeHref(cleanPath, targetLocale);
    const currentPath = window.location.pathname;

    if (currentPath === targetPath || currentPath === `${targetPath}/`) {
      return;
    }

    window.location.href = targetPath;
  };

  return (
    <button
      onClick={toggleLanguage}
      aria-label="Toggle language"
      className="w-9 h-9 flex items-center justify-center rounded-full font-bold text-[14px] text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/20 transition-all"
    >
      <span
        className="w-5 h-5"
        dangerouslySetInnerHTML={{
          __html: locale !== "ar" ? flagIcons.UAE : flagIcons.USA,
        }}
      />
    </button>
  );
};

export default LanguageToggle;
