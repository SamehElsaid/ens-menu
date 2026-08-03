# Action Plan — ensmenu.com SEO Audit

Priority definitions: **Critical** = blocks indexing/citation or causes real risk (fix immediately) · **High** = significant ranking/visibility impact (within 1 week) · **Medium** = real opportunity (within 1 month) · **Low** = nice to have (backlog).

## Phase 1: Critical Fixes (Week 1)

| # | Item | Severity | File(s) |
|---|---|---|---|
| 1 | Server-render knowledge-base article list + body (stop client-only `useEffect`/axios fetch) | Critical | `src/app/[locale]/(main)/knowledge-base/KnowledgeBaseClient.tsx`, `[slug]/page.tsx`, `page.tsx` |
| 2 | Investigate the ~70 missing knowledge-base article ids (1–70): restore, redirect, or confirm intentional retirement | Critical | KB content API / `src/lib/sitemap/data.ts` (`fetchAllKbArticles`) |
| 2a | **New (`/seo-sitemap` deep dive):** filter test/internal customer-menu accounts (`test.ensmenu.com`, `your-slug-ensmenu-com*`, etc. — ~10 of 173 sampled URLs) out of `/public/menus` so they stop being indexed as soft-404 pages | Critical | `/public/menus` API, `src/lib/sitemap/data.ts` (`fetchPublicMenus`) — see `findings/sitemap.md` |
| 2b | **New (`/seo-images` deep dive):** re-export the 2.19MB, 1536×1024 `chicken.jpg` homepage thumbnail (displayed at 44×44px) to match its properly-sized siblings — single highest-impact, lowest-effort image fix | Critical | `public/images/hero/chicken.jpg`, `src/components/HomePage/HeroProductThumb.tsx` — see `findings/images.md` |
| 3 | Add baseline security headers via `next.config.ts` `headers()` (X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options, scoped CSP) | High | `next.config.ts` |
| 4 | Resolve the `robots.txt` Disallow + meta `noindex` conflict on `/auth/*` pages — pick one mechanism | High | `src/app/robots.ts`, `src/app/[locale]/(main)/auth/**/page.tsx` |
| 5 | Remove leftover `console.log(dynamic)` | Low (do while in the file) | `src/app/[locale]/(main)/knowledge-base/page.tsx:13` |
| 6 | ~~Verify `/sitemap.xml` returns the documented redirect rather than a 500 error~~ — **confirmed fixed**: re-tested live, cleanly returns a single-hop `308` → `/sitemap` | ~~Medium~~ Done | redirects config / hosting |

## Phase 2: High-Impact Improvements (Weeks 2–3)

| # | Item | Severity |
|---|---|---|
| 7 | Add `Organization` + `WebSite` JSON-LD sitewide (root layout), populate `sameAs` from Footer social links | High |
| 8 | Add `SoftwareApplication`/`Service` JSON-LD to the homepage | Medium |
| 9 | ~~Add `FAQPage` JSON-LD to `/faq`~~ — **downgraded, see Phase 3 item 19a.** Google retired FAQ rich results for all sites May 7, 2026; no confirmed SERP/AI-citation benefit remains. | ~~Medium~~ Low |
| 10 | Add `Article` JSON-LD (headline, author, datePublished, dateModified, image) to knowledge-base articles — ship together with #1 | High |
| 11 | Implement `/llms.txt` as a real plain-text route, excluded from the catch-all page matcher | Medium |
| 12 | Fix the 2-hop `http://ensmenu.com` redirect chain to a single hop directly to `https://www.ensmenu.com` | Medium |
| 13 | Implement the IndexNow protocol (key file + publish/update ping) for faster Bing/Yandex indexing | Medium |
| 14 | Give descriptive `alt` text to real customer/partner logos in `TrustedByLogosRow.tsx` | Medium |
| 15 | Add author/reviewer byline + visible "last updated" date to knowledge-base articles | Medium |
| 16 | Add a testimonials/case-studies section sourced from real customers on the 172 existing menu subdomains | High |
| 17 | Re-enable the commented-out `<FeaturesApp />` section on `/mobile-app` (content already written/translated) or confirm intentional removal | Medium |
| 17a | **New (`/seo-hreflang` deep dive):** fix the homepage canonical/hreflang trailing-slash mismatch (`https://www.ensmenu.com` vs. `https://www.ensmenu.com/`) | Medium |
| 17b | **New (`/seo-hreflang` deep dive):** fix relative-URL HTML hreflang tags on customer-menu subdomains (separate storefront deployment) to use absolute URLs | Medium |
| 17c | **New (`/seo-images` deep dive):** pass `width`/`height` to `TemplateShow.tsx`'s `LoadImage` calls so the existing `/api/resize` Sharp+WebP pipeline optimizes the two raw 2.1MB PNGs (`waffle.png`, `vanilla.png`) — zero new infrastructure needed | High |
| 17d | **New (`/seo-images` deep dive):** server-render the `TrustedBySection` logo marquee (currently 100% client-fetched via `useEffect`) — invisible to non-JS crawlers and Google Images, same anti-pattern as the knowledge-base CSR issue | High |
| 17e | **New (`/seo-images` deep dive):** resize/convert the above-the-fold `AiAvatar.png` (357×344, 195KB) to a ~120×120 WebP | Medium |

## Phase 3: Content & Authority (Month 2)

| # | Item | Severity |
|---|---|---|
| 18 | Rebuild/restore lost knowledge-base content volume; set an editorial cadence with content-loss monitoring going forward | Medium |
| 19 | Add `BreadcrumbList` JSON-LD to knowledge-base articles | Low |
| 19a | (Optional, near-zero-cost only) Add `FAQPage` JSON-LD to `/faq` — Info-priority, no confirmed Google SERP/AI-citation benefit as of May 2026; do not prioritize over items 7, 8, 10 | Low |
| 20 | Add `alternates.languages` to `buildSeoMetadata()` as a redundant hreflang signal alongside the HTTP header | Low |
| 21 | Add `includeSubDomains` (and consider `preload`) to the HSTS header once all customer subdomains are confirmed HTTPS-ready | Low |
| 22 | Reconsider hardcoded `og:locale: "en_GB"` against actual target English-speaking markets | Low |
| 23 | Migrate `TrustedByLogosRow` logos to `next/image` where source domains can be allowlisted, or optimize at upload time | Low |
| 24 | Cap future knowledge-base slug generation length (sampled URLs run 116–136 characters, over the 100-char guideline) | Low |
| 25 | Audit a sample of the 172 customer menu subdomains (separate codebase) for thin/duplicate content risk | Medium |
| 26 | Display a full city-level address alongside the map embed; confirm a registered legal entity name is present in Terms/Privacy | Low |
| 26a | Fix sitemap-index `<lastmod>` to reflect each child sitemap's own real newest date instead of one shared value across all three (`sitemap-main`/`sitemap-knowledge-base`/`sitemap-menus`) | Low |
| 26b | Confirm whether the `/public/menus` API can return `updatedAt`/`createdAt` per menu — 100% of the 345 customer-menu sitemap URLs currently have no `<lastmod>` at all | Low |
| 26c | Drop `<priority>`/`<changefreq>` from sitemap output (Google ignores both); re-verify the one-off `300.ensmenu.com` EN/AR sitemap count mismatch observed during the `/seo-sitemap` audit | Info/Low |
| 26d | Give the primary (non-decorative) `TrustedByLogosRow` logo tiles descriptive `alt` text instead of `alt=""` (duplicate of item 14 — cross-referenced by the `/seo-images` deep dive) | Medium |
| 26e | Add `width={method.imageWidth} height={method.imageHeight}` to the Etisalat SVG `<img>` in `PricingComparisonPage.tsx` | Low |

## Phase 4: Monitoring & Iteration (Ongoing)

| # | Item |
|---|---|
| 27 | Connect Google Search Console; re-run audit with real indexation + CrUX field data (public PSI API returned a quota error during this audit) |
| 28 | Track knowledge-base sitemap article count over time to catch future silent content drops immediately |
| 29 | Re-test AI-crawler visibility (fetch article HTML with JS disabled) after the SSR fix ships, to confirm the fix worked |
| 30 | Track Core Web Vitals in the field via CrUX once available; validate this report's lab-based performance estimate |
| 31 | Verify touch-target sizing, base font size, and mobile/desktop content parity with a rendering tool (Lighthouse/Playwright) |

---

## Suggested sequencing rationale

Items 1, 2, 7, 8, and 10 are intentionally clustered: fixing the SSR issue (1) and adding `Article` schema (10) touch the same files and should ship in the same change, and doing so unlocks the single biggest AI-visibility improvement available on the site. Item 9 (`FAQPage`) was downgraded to Phase 3/optional after a schema-skill deep dive confirmed Google retired FAQ rich results for all sites in May 2026 — see `findings/schema.md` for the full corrected schema priority order and ready-to-use JSON-LD in `generated-schema.json`. Security headers (3), the auth noindex/robots.txt conflict (4), and the `console.log` removal (5) are independent, zero-risk, same-day fixes that shouldn't wait for the content work. Item 16 (testimonials) is high-severity but naturally a Phase 2 item since it requires reaching out to real customers, not just an engineering change. Item 2a was added after a dedicated `/seo-sitemap` deep dive found internal/test accounts leaking into the live sitemap as indexable soft-404 pages — it's a Critical, low-effort, backend-filter fix and should ship alongside item 2 since both touch the same sitemap-generation data path (`src/lib/sitemap/data.ts`); full evidence in `findings/sitemap.md` and `VALIDATION-REPORT.md`. Item 2b was added after a dedicated `/seo-images` deep dive found a single 2.19MB JPEG masquerading as a 44×44px thumbnail on the homepage — the single highest-value-per-effort fix in this entire action plan (one file re-export recovers ~2.2MB); items 17c–17e cover two more multi-megabyte raw images and a client-rendered logo section found in the same pass, full evidence in `findings/images.md`.
