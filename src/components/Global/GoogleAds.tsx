"use client";

import Script from "next/script";
import { useDelayedLoad } from "@/hooks/useDelayedLoad";

const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim();

export default function GoogleAds() {
  const shouldLoad = useDelayedLoad();

  if (!googleAdsId || !shouldLoad) return null;

  return (
    <>
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
      />
      <Script id="google-ads" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${googleAdsId}');
        `}
      </Script>
    </>
  );
}
