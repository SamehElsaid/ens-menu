"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useDelayedLoad } from "@/hooks/useDelayedLoad";

const GA_ID = process.env.NEXT_PUBLIC_GADS_ID?.trim();
const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID?.trim();

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const shouldLoad = useDelayedLoad();

  useEffect(() => {
    if (!GA_ID || !shouldLoad || typeof window.gtag !== "function") return;

    const query = searchParams?.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    window.gtag("config", GA_ID, { page_path: pagePath });
  }, [pathname, searchParams, shouldLoad]);

  if (!GA_ID || !googleAdsId || !shouldLoad) return null;

  return (
    <>
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
          gtag('config', '${googleAdsId}');
        `}
      </Script>
    </>
  );
}
