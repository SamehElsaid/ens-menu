# SEO Audit Report — ensmenu.com

**Date:** August 3, 2026
**Site:** [https://www.ensmenu.com](https://www.ensmenu.com) (Arabic default `/`, English at `/en`)
**Method:** Full source-code review of the `ens-menu` Next.js repository (`src/`) combined with live verification against the production site (HTTP headers, robots.txt, sitemap tree, raw and rendered HTML of a representative page sample).

> **Tooling note:** The `claude-seo` CLI, DataForSEO MCP, and Google API credentials (Search Console/CrUX/GA4) were not available in this session. This audit substitutes direct source-code analysis — a capability a black-box crawl doesn't have — for the portions of the standard pipeline that would normally use those tools (rendering, Lighthouse, live SERP/backlink data). See **Limitations** at the end of this report.

---

## Executive Summary

### SEO Health Score: 52 / 100 — *Needs Improvement*

*(Revised from an initial 59 after four dedicated deep-dive passes — Technical SEO (see below) lowered from 74 to 52 based on additional live verification: a robots.txt/noindex conflict on auth pages, a 2-hop HTTP redirect chain, oversized KB URLs, missing IndexNow support, incomplete HSTS directives, and a `/seo-sitemap` deep dive that found internal/test accounts indexed as soft-404 pages in the live sitemap. Content Quality lowered from 48 to 44 after a full E-E-A-T breakdown — see below — found no testimonials/reviews anywhere and a marketing page shipping less content than already exists, written, in the codebase. Images lowered from 68 to 42 after a `/seo-images` deep dive found ~6.4MB of easily-recoverable raw, unoptimized images on the homepage itself.)*

| Category | Score | Weight |
|---|---|---|
| Technical SEO | 52 | 22% |
| Content Quality | 44 | 23% |
| On-Page SEO | 82 | 20% |
| Schema / Structured Data | 10 | 10% |
| Performance (CWV, estimated) | 78 | 10% |
| AI Search Readiness (GEO) | 35 | 10% |
| Images | 42 | 5% |

**Business type detected:** B2B SaaS — an AI-powered QR digital menu and ordering platform for restaurants, cafés, and hotels, based in Egypt (Arabic-first, bilingual AR/EN), with an explicit "worldwide" positioning. The product also drives a large **programmatic SEO surface**: every customer gets a dedicated public subdomain (e.g. `elwensh.ensmenu.com`) — 172 of these currently exist and are indexed via a dedicated paginated sitemap.

### Top 9 Critical/High Issues

1. **Zero structured data anywhere on the site.** No Organization, WebSite, SoftwareApplication, FAQPage, Article, or BreadcrumbList schema exists in the entire codebase.
2. **Knowledge-base article content is invisible to non-JS crawlers.** The article body is fetched client-side after hydration; the server-rendered HTML contains only the `<head>` metadata, not the actual guide text. This kills both traditional indexing speed/reliability and — more importantly — AI citation eligibility (GPTBot, ClaudeBot, PerplexityBot generally don't execute JS at scale).
3. **Test/placeholder customer subdomains are indexed in the sitemap and return soft-404 content.** *(New — `/seo-sitemap` deep dive.)* ~10 of 173 customer-menu sitemap URLs (`test.ensmenu.com`, `your-slug-ensmenu-com*`, etc.) are internal/QA accounts, not real customers; two spot-checked live both return HTTP 200 but render a "This menu is not found" template with junk titles. See [`findings/sitemap.md`](findings/sitemap.md).
4. **A 1536×1024, 2.19MB JPEG is served raw for a 44×44px homepage thumbnail.** *(New — `/seo-images` deep dive.)* `chicken.jpg` is 35-125x larger than its correctly-sized siblings in the same component; two more raw, unoptimized 2.1MB PNGs were also found live in the homepage's template-showcase carousel, bypassing an already-working Sharp/WebP resize pipeline. ~6.4MB of easily-recoverable homepage payload in total. See [`findings/images.md`](findings/images.md).
5. **No security response headers** on any HTML route (no CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy, X-Content-Type-Options).
6. **`robots.txt` Disallow + meta `noindex` conflict on `/auth/*` pages.** Five auth pages set a `noindex` meta tag that Googlebot can never see, because `robots.txt` already blocks crawling of `/auth` entirely — the noindex currently protects nothing.
7. **`/llms.txt` is not implemented** — it silently falls through to the catch-all route and serves the full homepage instead of a proper file or 404.
8. **~70 historical knowledge-base article URLs appear to be missing** from the sitemap (only ids 71–78 of what looks like a 1–78 range are listed), with no evidence of redirects — likely orphaned equity/soft-404s. Confirmed via `/seo-sitemap`: the sitemap code itself paginates correctly through everything the API returns, so this is an upstream content/API gap.
9. **No testimonials, customer quotes, or third-party reviews exist anywhere on the site**, despite 172 real active customers already on the platform — a significant, easily fixable trust and authority gap.

> **Also newly found (`/seo-images` deep dive):** the homepage's "Trusted by" customer-logo marquee (`TrustedBySection`) is 100% client-rendered via `useEffect`, making it — and every real customer logo in it — invisible to non-JS crawlers and Google Images. This is the same CSR anti-pattern as issue #2, recurring on the homepage's own social-proof section. See [`findings/images.md`](findings/images.md).

### Top 5 Quick Wins

1. Add `Organization` + `WebSite` JSON-LD to the root layout (near-zero effort, populate `sameAs` from existing Footer social links) — see `findings/schema.md` and `generated-schema.json` for ready-to-use code.
2. Add `WebApplication` JSON-LD to the homepage.
3. Remove the leftover `console.log(dynamic)` in `knowledge-base/page.tsx`.
4. Re-export the 2.19MB `chicken.jpg` homepage thumbnail (displayed at 44×44px) to match its properly-sized siblings — single highest-impact, lowest-effort image fix on the whole site.
5. Give real customer logos in the "Trusted by" marquee descriptive `alt` text instead of `alt=""`.
6. Add a baseline `headers()` block to `next.config.ts` for `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`.
7. Re-enable the commented-out `<FeaturesApp />` section on `/mobile-app` — the content is already written and translated in both locales, just switched off.

> **Correction (schema deep-dive, see `findings/schema.md`):** `FAQPage` JSON-LD on `/faq` was previously listed as a quick win. Google retired FAQ rich results for all sites on May 7, 2026, so this no longer carries a confirmed SERP or AI-citation benefit and has been downgraded to an optional, Info-priority item in `ACTION-PLAN.md`.

---

## Technical SEO — 52/100

*(Updated by a dedicated deep-dive technical audit — see [`findings/technical.md`](findings/technical.md) for the full 9-category breakdown: Crawlability, Indexability, Security, URL Structure, Mobile, Core Web Vitals, Structured Data, JS Rendering, IndexNow — and further revised by a dedicated `/seo-sitemap` deep dive, see below.)*

Solid engineering foundation — a well-architected paginated sitemap index (confirmed valid XML, correct namespace, zero non-HTTPS/duplicate/redirected URLs across all 381 live URLs checked), clean `robots.txt`, correct canonical tags, valid wildcard TLS, and site-wide reciprocal hreflang delivered via HTTP `Link` headers (confirmed full mesh across 8 page types plus the entire 172-subdomain customer-menu tier) — undercut by a cluster of real gaps once inspected closely: **test/internal accounts leaking into the live sitemap as indexable soft-404 pages** (new, Critical), **no security headers at all**, a **robots.txt/noindex conflict on auth pages** (the noindex is unreachable and provides no protection), a **2-hop HTTP redirect chain** on the bare apex domain, an **unimplemented `llms.txt`**, **no IndexNow support**, a sizeable chunk of historical blog URLs that appear to have disappeared without redirects, and two newly-found Medium hreflang gaps (a homepage canonical/hreflang trailing-slash mismatch, and relative-URL hreflang tags on the separate customer-menu storefront).

Full detail: [`findings/technical.md`](findings/technical.md) · Sitemap deep-dive: [`findings/sitemap.md`](findings/sitemap.md) · Hreflang deep-dive: [`findings/hreflang.md`](findings/hreflang.md)

## Content Quality — 44/100

*(Updated by a dedicated deep-dive E-E-A-T audit — see [`findings/content.md`](findings/content.md) for the full Experience/Expertise/Authoritativeness/Trustworthiness breakdown, word-count analysis, and AI Citation Readiness score.)*

E-E-A-T breakdown: Experience 10/20, Expertise 8/25, Authoritativeness 8/25, Trustworthiness 20/30 (total 46/100). AI Citation Readiness: 25/100. The knowledge-base strategy is sound on paper (fresh, comparison-driven, long-tail content dated for 2026), but the implementation undermines it: article bodies are 100% client-rendered and invisible in the raw HTML response, roughly 90% of what looks like the historical article catalog (ids 1–70) is no longer reachable, and no author/reviewer bylines exist anywhere. Two further gaps surfaced by measuring actual word counts from the translation source files: the site has **zero testimonials or third-party reviews anywhere**, despite 172 real active customers already on the platform, and the `/mobile-app` page ships ~35% less content than is already written and translated in the codebase (a features section is simply commented out). Trustworthiness is the strongest sub-factor — real multi-channel contact info, a map embed, and substantive legal pages — dragged down only by a country-only address and no visible registered entity name.

Full detail: [`findings/content.md`](findings/content.md)

## On-Page SEO — 82/100

The strongest category. Every main marketing route implements `generateMetadata` with locale-aware, CMS-overridable title/description/keywords, defensive `noindex` fallbacks for missing content, a single clean `<h1>` on the homepage, and title/description lengths within recommended ranges. Minor nit: `og:locale` is hardcoded to `en_GB`, which may not match the site's stated "worldwide" audience.

Full detail: [`findings/technical.md`](findings/technical.md) *(on-page items included in audit-data.json category)*

## Schema & Structured Data — 10/100

A complete gap — no JSON-LD anywhere. This is the highest ROI category to invest in: it's purely additive, carries no risk to existing functionality, and directly supports both classic rich results and AI-engine citation parsing.

Full detail: [`findings/schema.md`](findings/schema.md)

## Performance (Core Web Vitals) — 78/100 *(estimated, unverified)*

Engineering signals are genuinely good: self-hosted fonts, AVIF/WebP image config, explicit LCP image preloading with full responsive `srcset`, and third-party analytics scripts deliberately deferred via `next/script strategy="lazyOnload"` behind a custom delay hook. No field/lab CWV data was available to verify actual scores — treat this number as directional, not measured.

Full detail: [`findings/performance.md`](findings/performance.md)

## Images — 42/100

*(Revised from an initial 68 after a dedicated `/seo-images` deep dive found three raw, unoptimized, multi-megabyte images actually being served on the homepage.)*

`next/image` is used broadly and correctly, and the images that go through it are genuinely well-optimized — but three files that bypass it entirely tell a different story: a 2.19MB, 1536×1024 JPEG displayed at 44×44px in the hero chat demo, and two 2.1MB PNGs in the template-showcase carousel that bypass an already-working Sharp/WebP resize endpoint (`/api/resize`) simply because `width`/`height` props aren't passed. Separately, the "Trusted by" logo marquee turns out to be entirely client-rendered, so its real customer-logo images (already flagged for empty `alt=""`) are invisible to Google Images and non-JS crawlers altogether. All fixes are low-effort and one (the `/api/resize` pipeline) already exists in the codebase.

Full detail: [`findings/images.md`](findings/images.md)

## AI Search Readiness (GEO) — 35/100

Directly downstream of the Content Quality finding: the site's best AI-citation bait (competitor comparisons, how-to guides) is structurally unreadable by the crawlers that would cite it. Combined with a missing `llms.txt` and zero Article/FAQPage schema, this site is currently poorly positioned for AI Overviews, ChatGPT search, and Perplexity — despite having the right raw content ideas.

Full detail: [`findings/geo.md`](findings/geo.md)

---

## Action Plan

See [`ACTION-PLAN.md`](ACTION-PLAN.md) for the full prioritized, phased plan.

## Limitations of this audit

- No `claude-seo` CLI, DataForSEO MCP, or Google API (Search Console/CrUX/GA4) credentials were available; findings come from direct source-code analysis of the `ens-menu` repository plus live `curl`/`WebFetch` verification against production, not a full 500-page crawl or measured Lighthouse/CrUX data.
- The sitemap tree (10 main pages, 8 KB articles, 172 customer menu subdomains) was enumerated and sampled rather than crawled page-by-page.
- The public customer-menu storefront app (the 172 `*.ensmenu.com` subdomains) lives in a separate deployment not present in this repository; it was only spot-checked via its sitemap listing, not source-reviewed. A dedicated programmatic-SEO audit of that surface is recommended as a follow-up once that codebase is accessible.
- Performance/CWV scores are engineering-signal estimates based on code review, not measured PageSpeed Insights/CrUX data.
