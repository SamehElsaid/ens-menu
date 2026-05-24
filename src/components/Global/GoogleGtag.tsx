"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useDelayedLoad } from "@/hooks/useDelayedLoad";

const GA_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ||
  process.env.NEXT_PUBLIC_GADS_ID?.trim();

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim();

const primaryGtagId = GA_ID || GOOGLE_ADS_ID;

export default function GoogleGtag() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const shouldLoad = useDelayedLoad();

  useEffect(() => {
    if (!shouldLoad || !GA_ID || typeof window.gtag !== "function") return;

    const query = searchParams?.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;
    window.gtag("config", GA_ID, { page_path: pagePath });
  }, [pathname, searchParams, shouldLoad]);

  if (!primaryGtagId || !shouldLoad) return null;

  const configLines = [
    GA_ID ? `gtag('config', '${GA_ID}');` : "",
    GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : "",
  ]
    .filter(Boolean)
    .join("\n          ");

  return (
    <>
      <Script
        id="google-gtag-loader"
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${primaryGtagId}`}
      />
      <Script id="google-gtag-init" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          ${configLines}
        `}
      </Script>
    </>
  );
}
