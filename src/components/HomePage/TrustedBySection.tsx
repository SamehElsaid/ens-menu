"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { HomepageFeaturedLogo } from "@/lib/homepageFeaturedLogos";
import { fetchHomepageFeaturedLogosClient } from "@/lib/homepageFeaturedLogos";
import TrustedByLogosRow from "@/components/HomePage/TrustedByLogosRow";

function TrustedBySkeleton() {
  return (
    <div
      className="flex justify-center gap-3 overflow-hidden px-2 sm:gap-4"
      aria-hidden
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="h-18 w-18 shrink-0 animate-pulse rounded-[1.35rem] bg-slate-200/80 sm:h-20 sm:w-20 dark:bg-slate-700/60"
        />
      ))}
    </div>
  );
}

export default function TrustedBySection() {
  const t = useTranslations("trustedBySection");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const [logos, setLogos] = useState<HomepageFeaturedLogo[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchHomepageFeaturedLogosClient()
      .then((items) => {
        if (!cancelled) setLogos(items);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loaded && logos.length === 0) return null;

  return (
    <section
      className="relative overflow-hidden border-y border-slate-100/90 bg-linear-to-b from-slate-50/80 via-white to-purple-50/20 py-14 sm:py-16 dark:border-slate-800/80 dark:from-[#0d1117] dark:via-[#0d1117] dark:to-purple-950/20"
      aria-labelledby="trusted-by-heading"
    >
      <div
        className="pointer-events-none absolute -top-24 end-0 h-48 w-48 rounded-full bg-purple-200/30 blur-3xl dark:bg-purple-600/10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 start-0 h-40 w-40 rounded-full bg-indigo-200/25 blur-3xl dark:bg-indigo-600/10"
        aria-hidden
      />

      <div className="container relative z-10 mx-auto px-6">
        <div
          className={`mx-auto mb-10 max-w-3xl text-center ${isRTL ? "text-right sm:text-center" : ""}`}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-100 bg-purple-50/90 px-4 py-1.5 text-xs font-bold tracking-wide text-purple-700 shadow-sm dark:border-purple-500/25 dark:bg-purple-500/15 dark:text-purple-300">
            <span aria-hidden>🌍</span>
            <span>{t("badge")}</span>
          </div>

          <h2
            id="trusted-by-heading"
            className="text-xl font-extrabold leading-snug tracking-tight text-slate-900 sm:text-2xl lg:text-[1.65rem] dark:text-white"
          >
            {t("title")}
          </h2>

          <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
            {t("subtitle")}
          </p>
        </div>

        <div aria-label={t("logosAriaLabel")} role="list">
          {!loaded ? (
            <TrustedBySkeleton />
          ) : (
            <TrustedByLogosRow logos={logos} />
          )}
        </div>
      </div>
    </section>
  );
}
