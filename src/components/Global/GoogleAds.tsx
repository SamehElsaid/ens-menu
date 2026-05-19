"use client";

import Script from "next/script";

const GADS_ID = process.env.NEXT_PUBLIC_GADS_ID?.trim();

export default function GoogleAds() {
  if (!GADS_ID) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GADS_ID}`}
      />
      <Script id="google-ads" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GADS_ID}');
        `}
      </Script>
    </>
  );
}
