# Performance & Core Web Vitals Findings — ensmenu.com

Score: **78/100** (lab/engineering-signal estimate — see limitation below)

> **Limitation:** No Google Search Console, CrUX, or PageSpeed Insights API access was available in this session, and no DataForSEO MCP tool was configured. The score below is derived from source-code review (rendering strategy, script loading, image config) rather than measured field/lab data. Re-run with the `seo-google` skill once credentials are available for verified LCP/INP/CLS numbers.

## What works

- **Self-hosted fonts**: `@fontsource/cairo` is used instead of Google Fonts, avoiding a render-blocking third-party font request and its associated connection/DNS overhead.
- **Modern image formats configured**: `next.config.ts` sets `images.formats: ["image/avif", "image/webp"]`.
- **LCP-aware preloading**: the homepage's raw HTML includes a `<link rel="preload" as="image" imageSrcSet="...">` for the hero demo image with a full responsive `srcset` (640w through 3840w) — a deliberate, correctly-implemented LCP optimization.
- **Deferred third-party analytics**: both `GoogleTagManager` and `GoogleGtag` components (`src/components/Global/`) use `next/script` with `strategy="lazyOnload"`, gated behind a custom `useDelayedLoad()` hook. This is exactly the right pattern to keep GTM/GA off the critical rendering path and protect INP/TBT.
- **Bundle monitoring in place**: `@next/bundle-analyzer` is wired into `next.config.ts` (`ANALYZE=true` build flag), showing an existing performance-conscious workflow.

## Findings

### Trusted-by logo marquee bypasses `next/image` — **Low**

`src/components/HomePage/TrustedByLogosRow.tsx` renders raw `<img>` elements (with an `eslint-disable-next-line @next/next/no-img-element` comment acknowledging the tradeoff) for real customer logos and country-flag icons from `flagcdn.com`. This loses automatic AVIF/WebP conversion and responsive sizing for a component that can render 16+ duplicated image tiles to fill the marquee viewport.

**Recommendation:** If logo source domains can be enumerated, add them to `images.remotePatterns` and switch to `next/image`. If logos come from arbitrary customer-controlled URLs (likely, given they're uploaded per-restaurant), consider optimizing/transcoding them server-side at upload time instead, so the runtime cost is paid once rather than per page view.

### No measured Core Web Vitals data — **Info**

See limitation note above. This is a gap in *this audit*, not necessarily a gap in the site.
