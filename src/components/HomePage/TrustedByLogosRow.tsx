"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import type { HomepageFeaturedLogo } from "@/lib/homepageFeaturedLogos";

type TrustedByLogosRowProps = {
  logos: HomepageFeaturedLogo[];
};

const MARQUEE_MIN_COUNT = 6;
const TILE_SIZE = "h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20";

function LogoTile({ item }: { item: HomepageFeaturedLogo }) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`group relative ${TILE_SIZE} shrink-0 overflow-hidden rounded-[1.35rem] border border-slate-200/90 bg-white shadow-md shadow-slate-200/50 ring-1 ring-slate-100/80 transition-all duration-300 hover:-translate-y-1 hover:border-purple-200/80 hover:shadow-xl hover:shadow-purple-200/30 hover:ring-purple-200/60 dark:border-slate-700/90 dark:bg-slate-800 dark:shadow-slate-950/40 dark:ring-slate-700/60 dark:hover:border-purple-500/40 dark:hover:shadow-purple-900/30 dark:hover:ring-purple-500/30`}
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/0 via-white/0 to-purple-50/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:to-purple-500/10" />

      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.logo}
          alt=""
          width={80}
          height={80}
          className="relative z-10 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-100 to-slate-50 text-lg font-bold text-slate-400 dark:from-slate-700 dark:to-slate-800 dark:text-slate-500">
          •
        </div>
      )}

      {item.countryCode ? (
        <span
          className="absolute end-1.5 top-1.5 z-20 flex h-[1.35rem] w-[1.35rem] items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow-md shadow-slate-300/60 dark:border-slate-900 dark:bg-slate-900 dark:shadow-black/40"
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://flagcdn.com/w40/${item.countryCode.toLowerCase()}.png`}
            alt=""
            width={22}
            height={22}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </span>
      ) : null}
    </div>
  );
}

export default function TrustedByLogosRow({ logos }: TrustedByLogosRowProps) {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const useMarquee = logos.length >= MARQUEE_MIN_COUNT;
  const displayLogos = useMemo(
    () => (useMarquee ? [...logos, ...logos] : logos),
    [logos, useMarquee],
  );

  const track = (
    <div
      className={`flex items-center gap-3 sm:gap-4 ${
        useMarquee
          ? `trusted-by-marquee-track px-1 ${isRTL ? "trusted-by-marquee-track--rtl" : ""}`
          : "min-w-max justify-center"
      }`}
    >
      {displayLogos.map((item, index) => (
        <LogoTile key={`${item.id}-${index}`} item={item} />
      ))}
    </div>
  );

  if (!useMarquee) {
    return (
      <div className="flex justify-center overflow-x-auto px-2 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {track}
      </div>
    );
  }

  return (
    <div className="overflow-hidden py-1 [-ms-overflow-style:none] [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] [scrollbar-width:none] dark:[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] [&::-webkit-scrollbar]:hidden">
      {track}
    </div>
  );
}
