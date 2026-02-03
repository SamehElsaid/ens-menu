"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { FiGlobe } from "react-icons/fi";

const LANGUAGES = [
  { locale: "en", label: "English", subLabel: "EN" },
  { locale: "ar", label: "العربية", subLabel: "AR" },
];

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams() as URLSearchParams;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const changeLanguage = (targetLocale: string) => {
    if (!targetLocale || locale === targetLocale) {
      return;
    }
    const query = searchParams.toString();
    router.replace(`${pathname}?${query}`, { locale: targetLocale });
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  const activeLanguage =
    LANGUAGES.find((item) => item.locale === locale) ?? LANGUAGES[0];

  return (
    <div ref={dropdownRef} className="relative inline-flex w-fit items-center">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-secondary hover:text-secondary"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <FiGlobe className="h-4 w-4" />
      </button>

      <div
        className={`absolute ${
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-2 opacity-0"
        } right-0 top-12 z-30 w-64 rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600 shadow-2xl transition-all duration-200`}
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
            <FiGlobe className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Language
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {activeLanguage.label}
            </p>
          </div>
        </div>

        <ul className="space-y-1" role="listbox">
          {LANGUAGES.map((item) => {
            const isActive = locale === item.locale;
            return (
              <li key={item.locale}>
                <button
                  type="button"
                  onClick={() => changeLanguage(item.locale)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 transition ${
                    isActive
                      ? "bg-secondary/10 text-secondary"
                      : "hover:bg-slate-50"
                  }`}
                  role="option"
                  aria-selected={isActive}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                      {item.subLabel}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-slate-400">
                        {item.locale.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  {isActive && (
                    <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
                      Active
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
