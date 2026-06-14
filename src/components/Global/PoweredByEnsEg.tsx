"use client";

import { useLocale, useTranslations } from "next-intl";

function ensEgHref(locale: string): string {
  return locale === "en" ? "https://ens.eg/en" : "https://ens.eg/ar";
}

export default function PoweredByEnsEg() {
  const t = useTranslations("Landing.poweredByEns");
  const locale = useLocale();

  return (
    <div
      className="powered-by-ens-signature mx-auto max-w-sm text-center"
      aria-label={t("ariaLabel")}
    >
      <p className="text-[11px] leading-relaxed text-slate-400/95">
        {t.rich("ecosystemLine", {
          ensEg: (chunks) => (
            <a
              href={ensEgHref(locale)}
              target="_blank"
              rel="noopener noreferrer"
              className="powered-by-ens-word font-medium no-underline transition-opacity hover:opacity-95 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-400/30"
            >
              {chunks}
            </a>
          ),
        })}
      </p>
      <p className="mx-auto mt-2 max-w-[18rem] text-[10px] leading-relaxed text-slate-500/80 sm:max-w-xs">
        {t("tagline")}
      </p>
    </div>
  );
}
