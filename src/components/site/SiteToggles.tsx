"use client";

import { useSyncExternalStore } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { localizeHref } from "@/i18n/routing";
import { cn } from "@/lib/cn";

/**
 * Theme and language controls sized for the public header.
 *
 * The behaviour is copied verbatim from `Global/DarkModeToggle` and
 * `Global/LanguageTogle` — same localStorage key, same class toggle, same
 * locale swap — because those two are also mounted in the dashboard header and
 * must keep rendering at the product's compact size.
 */

const iconButton =
  "flex size-10 items-center justify-center rounded-site-control text-site-fg " +
  "transition-colors duration-(--dur-settle) hover:bg-site-tint hover:text-site-ink " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-site-brand/35";

function useDarkMode() {
  return useSyncExternalStore(
    (callback) => {
      const observer = new MutationObserver(callback);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
      return () => observer.disconnect();
    },
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );
}

export function SiteThemeToggle({ className }: { className?: string }) {
  const isDark = useDarkMode();
  const t = useTranslations("common");

  return (
    <button
      type="button"
      onClick={() => {
        const next = !isDark;
        document.documentElement.classList.toggle("dark", next);
        localStorage.setItem("theme", next ? "dark" : "light");
      }}
      aria-pressed={isDark}
      aria-label={isDark ? t("useLightTheme") : t("useDarkTheme")}
      className={cn(iconButton, className)}
    >
      {isDark ? (
        <FiSun className="size-[18px]" aria-hidden />
      ) : (
        <FiMoon className="size-[18px]" aria-hidden />
      )}
    </button>
  );
}

export function SiteLanguageToggle({
  locale,
  pathname,
  className,
}: {
  /** Optional: the header already knows both, so it passes them rather than
   *  paying for the hooks a second time. Elsewhere they are read here. */
  locale?: string;
  pathname?: string;
  className?: string;
}) {
  const activeLocale = useLocale();
  const activePathname = usePathname();
  const target = (locale ?? activeLocale) === "ar" ? "en" : "ar";
  const currentPathname = pathname ?? activePathname;

  return (
    <button
      type="button"
      onClick={() => {
        const cleanPath = currentPathname.replace(/^\/(ar|en)/, "") || "/";
        const targetPath = localizeHref(cleanPath, target);
        const currentPath = window.location.pathname;
        if (currentPath === targetPath || currentPath === `${targetPath}/`) {
          return;
        }
        window.location.href = targetPath;
      }}
      lang={target}
      aria-label={target === "ar" ? "التبديل إلى العربية" : "Switch to English"}
      className={cn(
        iconButton,
        "font-site-display text-site-xs font-bold tracking-wide",
        className,
      )}
    >
      {target === "ar" ? "ع" : "EN"}
    </button>
  );
}
