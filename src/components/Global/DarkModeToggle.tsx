"use client";

import { useSyncExternalStore } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";

function useDarkMode() {
  const subscribe = (callback: () => void) => {
    const observer = new MutationObserver(callback);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  };

  const getSnapshot = () => document.documentElement.classList.contains("dark");

  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const DarkModeToggle: React.FC = () => {
  const isDarkMode = useDarkMode();
  const t = useTranslations("common");

  const toggleDarkMode = () => {
    const newTheme = !isDarkMode;
    document.documentElement.classList.toggle("dark", newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      iconOnly
      onClick={toggleDarkMode}
      aria-pressed={isDarkMode}
      aria-label={isDarkMode ? t("useLightTheme") : t("useDarkTheme")}
    >
      {isDarkMode ? (
        <FiSun className="size-4" />
      ) : (
        <FiMoon className="size-4" />
      )}
    </Button>
  );
};

export default DarkModeToggle;
