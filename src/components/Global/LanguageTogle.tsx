import { localizeHref } from "@/i18n/routing";
import { Button } from "@/components/ui";

interface LanguageToggleProps {
  locale: string;
  pathname: string;
}

/**
 * Sits beside `DarkModeToggle` in the dashboard header, so it uses the same
 * ghost icon button rather than a shape of its own.
 *
 * It shows the language it switches *to* as type, not a flag: a flag names a
 * country, and there is no flag that means "Arabic" to an Egyptian reader. The
 * label is written in that target language too, so a screen reader announces
 * the destination in the destination's own words.
 */
const LanguageToggle: React.FC<LanguageToggleProps> = ({
  locale,
  pathname,
}) => {
  const target = locale === "ar" ? "en" : "ar";

  const toggleLanguage = () => {
    const cleanPath = pathname.replace(/^\/(ar|en)/, "") || "/";
    const targetPath = localizeHref(cleanPath, target);
    const currentPath = window.location.pathname;

    if (currentPath === targetPath || currentPath === `${targetPath}/`) {
      return;
    }

    window.location.href = targetPath;
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      iconOnly
      onClick={toggleLanguage}
      lang={target}
      aria-label={target === "ar" ? "التبديل إلى العربية" : "Switch to English"}
    >
      <span className="text-[13px] font-bold tracking-wide">
        {target === "ar" ? "ع" : "EN"}
      </span>
    </Button>
  );
};

export default LanguageToggle;
