# Image Optimization Audit — ensmenu.com

**Method:** Source-code review of every `<img>`/`next/image` usage across the homepage and pricing page, cross-referenced against the actual files in `public/images/` (byte size + pixel dimensions via local inspection) and live delivery (`curl.exe` against production).

## Image Audit Summary

| Metric | Status | Count |
|---|---|---|
| Raw `<img>` usages found (non-`next/image`) | ⚠️ | 6 components (3 public-facing, 3 dashboard-only) |
| Images >200KB actually delivered raw on the homepage | ❌ | 3 (2.19MB, 2.12MB, 2.11MB) |
| Missing/empty `alt` on meaningful content images | ⚠️ | 1 component (real customer logos) |
| Wrong format (JPEG/PNG shipped raw instead of WebP/AVIF) | ⚠️ | 7 files |
| Existing Sharp/WebP resize pipeline (`/api/resize`) not used where available | ⚠️ | 1 component |
| Homepage section entirely invisible to non-JS crawlers (images included) | ❌ | 1 section (`TrustedBySection`) |

## Score: 42/100 *(revised from 68 — see below)*

## Findings

### A 1536×1024, 2.19MB JPEG is served raw for a 44×44px thumbnail — **Critical**

`public/images/hero/chicken.jpg` is **2,246,755 bytes** at its native 1536×1024 resolution. It's used as one of four demo-product thumbnails in the homepage's animated "Lina AI" chat mockup (`HeroProductThumb.tsx`), rendered inside a fixed `h-11 w-11` (**44×44px**) container via a raw `<img>` tag — completely bypassing `next/image` and any resize/format pipeline:

```28:39:src/components/HomePage/HeroProductThumb.tsx
  return (
    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover object-center"
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  );
```

Its three sibling demo images in the exact same component/data set are properly sized: `juice.jpg` (25.3KB, 400×400), `cheesecake.jpg` (17.7KB, 400×267), `wedges.jpg` (60.6KB, 400×600) — `chicken.jpg` is a clear outlier, ~35-125x larger than its siblings for the same 44×44px display context, almost certainly an unresized export that slipped in unnoticed. **Fix:** re-export `chicken.jpg` at ~400px on the long edge to match its siblings (target <50KB per the thumbnail tier) — this alone recovers ~2.2MB.

### The homepage's template-showcase carousel serves two more raw, multi-megabyte PNGs — **High**

`TemplateShow.tsx` (homepage "Choose your template" section) renders its preview image through a custom `LoadImage` wrapper (`src/components/ImageLoad.tsx`, built on `react-lazy-load-image-component`) in a large `aspect-video` showcase frame. Two of the nine live template entries point at raw PNGs with no resizing:

| File | Size (live, confirmed via `curl`) | Dimensions |
|---|---|---|
| `/images/temp/waffle.png` | **2,106,170 bytes (2.1MB)** | — |
| `/images/temp/vanilla.png` | **2,120,732 bytes (2.1MB)** | — |

The other seven active template entries (`1sst.webp`, `2nd.webp`, `4rd.webp` ×2, `default.jpeg`, `coffee.webp`, `neon.webp`, `sky.webp`) are all reasonably-sized WebP/JPEG — these two PNGs are the outliers.

The root cause is directly fixable and doesn't require new infrastructure: `ImageLoad.tsx` already has a built-in resize path — if `width`/`height` props are passed, it routes the request through `/api/resize?url=...&width=...&height=...`, a Sharp-based endpoint that resizes **and converts to WebP at quality 75** with disk caching (`src/app/api/resize/route.ts`). `TemplateShow.tsx` simply never passes `width`/`height` to `LoadImage` (`<LoadImage src={activeTemplate.image} alt={...} className="w-full h-full object-cover" />`), so every template image — including these two 2MB+ files — is served completely raw. **Fix:** pass explicit `width`/`height` (matching the `aspect-video` display box, e.g. 960×540) to every `LoadImage` call in `TemplateShow.tsx`; the existing pipeline will then automatically resize and convert all nine images to WebP with zero new code.

### The animated hero chat avatar is an oversized, unconverted PNG — **Medium**

`public/images/AiAvatar.png` is 357×344px at 199,670 bytes, displayed at 28–44px (`LinaAvatar` component, appears in the header of the hero chat mockup **and** once per chat bubble). It's rendered via a raw `<img>` with no `next/image`, no format conversion (served as `image/png` live), and no `loading="lazy"` (defaults to eager) — and this component sits above the fold on the homepage's hero animation, which autoplays on load.

```263:269:src/components/HomePage/HeroPhoneMockup.tsx
      <img
        src="/images/AiAvatar.png"
        alt=""
        className="h-full w-full object-cover"
      />
```

**Fix:** resize to ~120×120px (2-3x for retina at max display size) and convert to WebP — should easily land under the 50KB thumbnail target. Given it's above-the-fold and repeated, consider migrating to `next/image` for automatic format negotiation, or route it through `/api/resize` like the logos already do.

### `TrustedBySection` (the "Trusted by X restaurants" logo marquee) is 100% client-rendered — invisible to non-JS crawlers and Google Images — **High**

This audit could not find any of the customer-logo `<img>` tags in the raw server-rendered homepage HTML at all — because `TrustedBySection.tsx` fetches the logo list entirely client-side via `useEffect` + `fetchHomepageFeaturedLogosClient()`:

```32:38:src/components/HomePage/TrustedBySection.tsx
  useEffect(() => {
    let cancelled = false;

    fetchHomepageFeaturedLogosClient()
      .then((items) => {
        if (!cancelled) setLogos(items);
```

This is the same client-side-rendering anti-pattern already flagged as this site's #1 Critical technical finding for the knowledge-base (`findings/technical.md`) — here it recurs on the homepage itself, for the site's primary social-proof section. Practical impact for images specifically: none of these real restaurant/café logos are discoverable via Google Images, none contribute their `alt` text to the page's initial indexable content, and any crawler that doesn't execute JavaScript (most traditional image-indexing crawlers, many AI crawlers) never sees this section exists. **Fix:** fetch the featured-logos list server-side (the data is already available via the same API used client-side) and pass it into `TrustedByLogosRow` as an SSR prop, falling back to the client fetch only for live updates if needed.

### Real customer/partner logos given empty `alt=""` — **Medium** *(carried over, reconfirmed)*

`TrustedByLogosRow.tsx` sets `alt=""` on the actual restaurant/café logos in the marquee (and on the small country-flag badge overlay). Empty `alt` is correct only for the intentionally-duplicated decorative second marquee set (already `aria-hidden`) — the primary, non-duplicated logo set is meaningful content. Width/height (80×80) are correctly set here, so this component has no CLS risk — the only issue is the missing descriptive alt text.

```48:57:src/components/HomePage/TrustedByLogosRow.tsx
        <img
          src={item.logo}
          alt=""
          width={80}
          height={80}
```

**Fix:** set `alt={item.name}` (or `"{Restaurant name} logo"`) on the primary tile set only.

### Payment-method SVG icon skips the width/height it already has available — **Low**

`PricingComparisonPage.tsx` renders payment-method logos via `next/image` for raster formats but falls back to a raw `<img>` for the one SVG (Etisalat Cash) — a reasonable choice since `next/image` doesn't optimize SVGs anyway. However, the SVG branch omits `width`/`height` even though `method.imageWidth`/`method.imageHeight` (120×40) are already defined in the same data array and used one branch over:

```566:587:src/components/Pricing/PricingComparisonPage.tsx
                {method.imageSrc.endsWith(".svg") ? (
                  <img
                    src={method.imageSrc}
                    alt={label}
                    className="h-8 max-w-28 object-contain sm:h-9 sm:max-w-32"
                  />
                ) : (
                  <Image
                    src={method.imageSrc}
                    alt={label}
                    width={method.imageWidth}
                    height={method.imageHeight}
```

Alt text here is correctly descriptive (translated payment-method label) — this is purely a one-line CLS-prevention gap. **Fix:** add `width={method.imageWidth} height={method.imageHeight}` to the `<img>` branch too.

### Raw `<img>` usage in dashboard components — Info, out of scope

`ReviewItemRow.tsx`, `AddItemModal.tsx`, and `CreateMenuModal.tsx` also use raw `<img>` tags, but these are all behind `/dashboard` (authenticated, `robots.txt`-disallowed, non-indexable) — not reviewed further as part of this SEO-focused audit.

## What Works

- `next/image` is used broadly across ~40+ components for responsive, format-optimized delivery, and `next.config.ts` correctly configures `formats: ["image/avif", "image/webp"]`.
- The demo/hero images that **do** go through `next/image` (e.g. the paper-menu transformation image) get full responsive `srcset` generation (7 width variants) and are genuinely well-optimized at the point of delivery.
- A capable Sharp-based resize+WebP pipeline (`/api/resize`) already exists and is correctly used for customer-uploaded logos on menu subdomains — it's simply under-applied on the marketing site's own template-showcase images (see finding above).
- `loading="lazy"` + `decoding="async"` are used consistently on every below-the-fold raw `<img>` found, including the oversized ones — mitigating (but not eliminating) their impact, since they still cost real bandwidth once triggered.
- Alt text is present and descriptive on every image except the one `alt=""` case already flagged; no keyword-stuffed or filename-as-alt patterns found anywhere.
- No broken image handling gaps — every raw `<img>` usage found includes an `onError` fallback (`LogoTile`, `HeroProductThumb`) rather than showing a broken-image icon.

## Prioritized Optimization List

| Image | Current Size | Format | Issue | Est. Savings |
|---|---|---|---|---|
| `public/images/temp/vanilla.png` | 2,120,732 bytes | PNG | No resize, no WebP | ~2.05MB |
| `public/images/temp/waffle.png` | 2,106,170 bytes | PNG | No resize, no WebP | ~2.05MB |
| `public/images/hero/chicken.jpg` | 2,246,755 bytes | JPEG | 35-125x oversized for 44px display | ~2.2MB |
| `public/images/AiAvatar.png` | 199,670 bytes | PNG | 8-12x oversized, no WebP | ~150KB |
| `TrustedBySection` logo marquee | N/A | N/A | Entirely client-rendered — invisible to crawlers | N/A (indexability, not bytes) |

**Total easily-recoverable payload on the homepage: ~6.4MB**, almost entirely from three files that already have a working fix pattern elsewhere in the same codebase (either a properly-sized sibling image or an unused resize API).

## Recommendations, in priority order

1. Re-export `chicken.jpg` to match its sibling images (~50KB target) — single highest-impact, lowest-effort fix.
2. Pass `width`/`height` to `TemplateShow.tsx`'s `LoadImage` calls so the existing `/api/resize` pipeline optimizes `waffle.png`/`vanilla.png` (and audit the other 7 template images while there).
3. Server-render the `TrustedBySection` logo list instead of client-fetching it, restoring both crawlability and Google Images eligibility for real customer logos.
4. Resize/convert `AiAvatar.png` to WebP at display resolution.
5. Set descriptive `alt` text on the primary (non-decorative) `TrustedByLogosRow` logo tiles.
6. Add the missing `width`/`height` to the Etisalat SVG `<img>` in `PricingComparisonPage.tsx`.
