# Technical SEO Audit — ensmenu.com

**Method:** Source-code review of the `ens-menu` Next.js repository + live verification against production (`curl`/`WebFetch`: headers, redirects, TLS, robots.txt, sitemap tree, raw HTML). No DataForSEO MCP or Google API (Search Console/CrUX) credentials were available; the public PageSpeed Insights API returned `429 RESOURCE_EXHAUSTED` (daily quota exhausted for the anonymous/no-key consumer) when queried during this audit, so Core Web Vitals are reported as **unavailable**, per the skill's error-handling guidance, rather than estimated from a failed call.

## Technical Score: 52/100

*(Revised from 56/100 after the `/seo-sitemap` deep dive found a new Critical indexability issue — see below.)*

### Category Breakdown

| Category | Status | Score |
|---|---|---|
| Crawlability | ⚠ warn | 68/100 |
| Indexability | ✗ fail | 58/100 *(revised from 70 — see sitemap findings below)* |
| Security | ✗ fail | 45/100 |
| URL Structure | ⚠ warn | 65/100 |
| Mobile | ⚠ warn | 72/100 |
| Core Web Vitals | ⚠ warn (no data) | N/A |
| Structured Data | ✗ fail | 0/100 |
| JS Rendering | ✗ fail | 40/100 |
| IndexNow | ✗ fail | 0/100 |

*(Overall Technical Score is a weighted blend — Crawlability/Indexability/Security/JS Rendering weighted heaviest — with Core Web Vitals excluded from the weighted average since no real data could be obtained; see note in that section.)*

---

## 1. Crawlability — 68/100 (warn)

**Pass:**
- `robots.txt` exists, is valid, and doesn't block any public/marketing content. It disallows only genuinely private app surfaces: `/dashboard`, `/admin`, `/auth`, `/payment`, `/unauthorized` (and their `/en/` equivalents).
- A valid XML sitemap exists at the documented location (`/sitemap`, `/en/sitemap`) and is correctly referenced from `robots.txt`.
- Main marketing pages are all reachable within 1 click from the homepage (footer/nav links) — good crawl depth.
- No evidence of crawl-budget-wasting parameter URLs or infinite spaces.

**Issues:**
- **Critical content requires JavaScript execution.** The knowledge-base article list and article bodies are fetched client-side after hydration (`KnowledgeBaseInner` in `src/app/[locale]/(main)/knowledge-base/KnowledgeBaseClient.tsx`, a `"use client"` component using `useEffect` + `axiosGet`). A direct `curl` of a live article URL confirms the raw HTML contains only `<head>` metadata — no article text. This is the largest single drag on the Crawlability score; see **JS Rendering** below for full detail.
- **`/llms.txt` is not implemented.** It falls through to the `[...page]` catch-all route and returns a `200 OK` with the full homepage instead of a plain-text file or `404`. This wastes crawl/fetch budget for any agent or crawler checking for it, and is a missed input to Lighthouse's newer Agentic Browsing category (which checks for `llms.txt` presence).
- No AI-crawler-specific `robots.txt` rules exist (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, etc. are all covered only by the blanket `User-agent: * / Allow: /`). This is **not a defect** — it's a legitimate strategic choice to allow all AI crawlers — but it's worth the business explicitly confirming this is intentional given AI training vs. AI citation are different trade-offs (see the `seo-geo` skill for that decision).

## 2. Indexability — 70/100 (warn)

**Pass:**
- Canonical tags are self-referencing and correctly generated per page (`buildSeoMetadata()` / `alternates.canonical`), verified on homepage and `/pricing`.
- Hreflang is reciprocated correctly across locales (`ar ↔ en ↔ x-default`) via HTTP `Link` headers — confirmed by a dedicated `/seo-hreflang` deep dive across 8 page types (marketing pages, KB listing/article, privacy policy, an `/auth` page) *and* the customer-menu subdomain tier (all 172 subdomains inherit correct hreflang from the same shared middleware). Full validation table, and two Medium-severity gaps found, in [`findings/hreflang.md`](hreflang.md).
- No duplicate-content or parameter-URL indexation risk observed on the marketing site.
- The knowledge-base article route correctly returns `robots: { index: false, follow: false }` when an article ID can't be resolved (`[slug]/page.tsx`) — a proper, crawlable noindex rather than a robots.txt block, which is the *correct* pattern (see contrast below).

**Issues:**
- **`robots.txt` Disallow + meta `noindex` combined on `/auth/*` pages — conflicting, self-defeating pattern.** `login`, `register`, `reset-password`, `verify-email`, and `staff-login` pages all set `robots: "noindex, nofollow"` in their `generateMetadata()`, **but** `robots.txt` already disallows `/auth` and `/en/auth` entirely. Per Google's own guidance, a robots.txt disallow prevents Googlebot from ever crawling the page to see the noindex tag — so if any `/auth/*` URL is ever discovered via an external link, Google can still show it in search results (as a bare URL with no snippet, "indexed though blocked by robots.txt") because the noindex directive was never seen. The noindex tags on these five pages are currently unreachable and provide zero protection.
  - **Fix:** pick one mechanism per page. Either remove `/auth` from `robots.txt` and rely on the noindex meta tag (correct if the goal is guaranteed de-indexing), or drop the noindex tags and rely solely on the robots.txt block (acceptable if the goal is just to save crawl budget and these pages require auth/have no external backlinks anyway).
- **~70 historical knowledge-base article URLs missing from the sitemap with no redirects.** Article slugs are sequentially numbered; the sitemap currently lists only ids 71–78, with no ids 1–70 anywhere. If any were previously indexed, they're now silently orphaned (soft-404 or hard-404, unconfirmed) rather than redirected — a real indexability/equity-loss risk. Confirmed via `/seo-sitemap` deep dive: `fetchAllKbArticles()` correctly paginates through *everything* the `/searchInformation` API returns — this is an upstream content/API gap, not a sitemap-generation bug.
- **Test/placeholder customer subdomains are indexed in the sitemap and return soft-404 content — Critical.** A `/seo-sitemap` deep dive found ~10 of 173 customer-menu sitemap URLs (`test.ensmenu.com`, `testing.ensmenu.com`, `your-slug-ensmenu-com*` variants, etc.) are internal/placeholder accounts, not real customers. Two spot-checked live (`test.ensmenu.com`, `testing.ensmenu.com`) both return HTTP 200 but render a "This menu is not found" soft-404 template with junk titles (`test`, `sss`). Full detail, evidence, and fix in [`sitemap.md`](sitemap.md).

## 3. Security — 45/100 (fail)

**Pass:**
- HTTPS is enforced site-wide; `http://` requests 308-redirect to `https://`.
- TLS certificate is valid: `CN=*.ensmenu.com` (wildcard — sensibly covers all customer subdomains too), issued by Let's Encrypt, not expiring imminently (auto-renewing).
- `Strict-Transport-Security` header is present with a 2-year `max-age` (63072000s).
- No mixed content found — a codebase search for hardcoded `http://` resource references (`src=`, `href=`, `url()`) returned zero matches.
- No back-button-hijacking risk found — a codebase search for `history.pushState`/`history.replaceState`/`window.history` returned zero matches (relevant given this became a Critical, enforced spam-policy violation as of 2026-06-15).

**Issues:**
- **No `Content-Security-Policy` header** on any HTML route.
- **No `X-Frame-Options` header** — pages can be framed by any third-party site (clickjacking exposure).
- **No `X-Content-Type-Options` header** on HTML routes (the sitemap route sets `nosniff` correctly, showing the pattern exists in the codebase — `src/lib/sitemap/response.ts` — it's just not applied app-wide via `next.config.ts`).
- **No `Referrer-Policy` header.**
- **No `Permissions-Policy` header.**
- **HSTS header lacks `includeSubDomains` and `preload` directives.** Given the product architecture depends on numerous customer subdomains (`*.ensmenu.com`), adding `includeSubDomains` would extend HTTPS enforcement to all of them (verify all customer subdomains are HTTPS-capable first, since the wildcard cert already covers this). Without it, the site is also not eligible for the HSTS preload list even if desired later.

**Fix (all of the above):** add a single `headers()` function in `next.config.ts` applying to `/(.*)`:
```ts
async headers() {
  return [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        // Content-Security-Policy: scope to Vercel, GTM/GA, Chatwoot, Firebase, image CDNs already in use
      ],
    },
  ];
},
```

## 4. URL Structure — 65/100 (warn)

**Pass:**
- URLs are clean, descriptive, hyphenated, with no query parameters used for content (`/pricing`, `/knowledge-base/{slug}`).
- Trailing-slash handling is consistent: `/pricing/` 308-redirects to the canonical `/pricing` (single hop).
- Legacy `.xml` sitemap URLs cleanly 308-redirect to their new routes, single hop (re-verified live during the `/seo-sitemap` deep dive), and the team explicitly avoided case-only redirects to prevent redirect loops (documented in `next.config.ts` comments).

**Issues:**
- **2-hop redirect chain on the bare-apex HTTP entry point.** `http://ensmenu.com/` → `https://ensmenu.com/` (308) → `https://www.ensmenu.com/` (308) is two hops, exceeding the "max 1 hop" guideline. `http://www.ensmenu.com/` correctly single-hops to `https://www.ensmenu.com/`. Low real-world traffic impact (few users type the bare HTTP apex directly), but crawlers and auditing tools that start from the bare domain pay the extra hop, and it's a one-line config fix.
  - **Fix:** redirect `http://ensmenu.com/*` directly to `https://www.ensmenu.com/*` in one hop.
- **Knowledge-base URLs exceed the 100-character guideline.** Sampled live URLs measured 116–136 characters (e.g. `.../knowledge-base/ai-menu-for-restaurants-how-artificial-intelligence-improves-menu-management-and-sales-in-2026-77` = 136 chars), because slugs are generated from the full article title plus a numeric ID suffix (`kbSlug()` in `src/lib/sitemap/data.ts`).
  - **Fix:** not urgent to change existing URLs (would require redirects to avoid breaking them), but consider capping future slug generation to the first ~8-10 significant words.

## 5. Mobile Optimization & Page Experience — 72/100 (warn)

**Pass:**
- Viewport meta tag present and correct: `<meta name="viewport" content="width=device-width, initial-scale=1"/>`.
- Full RTL layout support for Arabic (`dir="rtl"` on `<html>`, RTL-aware component variants observed e.g. in `TrustedByLogosRow`) — a real mobile-first bilingual consideration most audits wouldn't need to check.
- No full-page interstitials or consent-redirect pages observed; persistent widgets (`ContactFab`, `SupportChatwoot`) are small and non-blocking, consistent with acceptable page-experience patterns.

**Unverified (flagged, not failed):**
- Touch target sizing (48×48px minimum), base font size (16px minimum), and mobile/desktop content parity could not be independently verified without a rendering/visual-diff tool in this session. Given the KB content is entirely client-rendered, **mobile/desktop parity is a real open question for that section specifically** — if Googlebot Smartphone (the primary mobile-first crawler) fails to execute the client fetch for any reason (timeout, budget), it would see a blank article on both mobile and desktop equally, so parity itself isn't broken, but the underlying content-visibility problem is shared with the JS Rendering finding.

## 6. Core Web Vitals — data unavailable

No Search Console/CrUX credentials were available, and the public PageSpeed Insights API call made during this audit failed with `429 quotaExceeded` (daily quota for the anonymous consumer is 0). Per the skill's error-handling guidance, this is reported as unavailable rather than guessed.

**What the code review shows (informational, not a substitute for real field data):**
- Self-hosted fonts (`@fontsource/cairo`) avoid a render-blocking Google Fonts request.
- `next.config.ts` configures AVIF/WebP image formats; the homepage's LCP image has an explicit `<link rel="preload">` with a full responsive `srcset`.
- GTM/GA scripts use `next/script strategy="lazyOnload"` gated behind a custom `useDelayedLoad()` hook, deliberately kept off the critical path (protects INP/TBT).

**Recommendation:** run `claude-seo run pagespeed_check.py https://www.ensmenu.com --json` with a valid Google API key, or manually check PageSpeed Insights / Search Console's Core Web Vitals report for real 75th-percentile field data.

## 7. Structured Data — 0/100 (fail)

Zero JSON-LD anywhere in the codebase — no Organization, WebSite, SoftwareApplication, FAQPage, Article, or BreadcrumbList schema. See [`schema.md`](schema.md) for the full breakdown and recommended additions; not re-detailed here to avoid duplication.

## 8. JS Rendering — 40/100 (fail)

- **Marketing pages (home, about, pricing, contact, faq, etc.): server-rendered.** Confirmed via raw `curl` — title, meta description, H1, and body content are all present in the initial HTML response.
- **Knowledge-base list + article bodies: entirely client-rendered.** `KnowledgeBaseInner` fetches both the article list and the selected article's HTML body via `axiosGet` inside `useEffect`. The server component (`page.tsx` / `[slug]/page.tsx`) fetches the article server-side but discards the body, using it only to build `<head>` metadata.
- **Partial mitigation already in place:** because metadata (title, description, and the noindex fallback for missing articles) is resolved server-side independent of the client fetch, per Google's Dec-2025 JS-SEO guidance ("serve canonical/noindex/title/description in the initial HTML"), the *metadata* layer is safe even though the *content* layer is not. This is a half-finished implementation — the harder problem (rendering the actual body) is that the rest wasn't done.
- No canonical-tag conflicts between raw HTML and JS-rendered output were found (there's only one canonical source — the server component — since the client component doesn't touch `<head>`).

**Fix:** render the article list and body server-side, passing the data already fetched in `page.tsx` down as props; keep only interactive elements (search, pagination controls) as client components.

## 9. IndexNow Protocol — 0/100 (fail)

No IndexNow key file or ping implementation was found in the codebase (`Glob` for `indexnow*` returned no results). IndexNow allows instant push-notification of new/updated URLs to Bing, Yandex, and other participating engines (not Google) without waiting for a crawl.

**Recommendation:** implement IndexNow given this site publishes real update volume (knowledge-base articles, 172+ customer menu subdomains updating "weekly" per their own sitemap `changefreq`). This is a low-effort, purely additive win: generate a key file, host it at the domain root, and ping the IndexNow API whenever a page is published/updated (a good hook point: wherever `revalidate`/sitemap regeneration already happens for KB articles and menu pages).

---

## Critical Issues (fix immediately)

1. Knowledge-base article list and body content require JavaScript to render — invisible in raw HTML to non-JS crawlers (see JS Rendering, Crawlability).
2. Zero structured data anywhere on the site (see Structured Data, and `schema.md`).
3. **New (`/seo-sitemap` deep dive): ~10 of 173 customer-menu sitemap URLs are internal/test accounts returning soft-404 "menu not found" content under HTTP 200** — see `sitemap.md` for evidence and fix.

## High Priority (fix within 1 week)

3. No security response headers at all on HTML routes (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) — one `next.config.ts` change fixes all of these at once.
4. `robots.txt` Disallow + meta `noindex` both applied to `/auth/*` pages — the noindex directive is currently unreachable by crawlers and provides no protection; pick one mechanism.

## Medium Priority (fix within 1 month)

5. `/llms.txt` returns the homepage (200 OK) instead of a real file or 404.
6. ~70 historical knowledge-base article URLs (ids 1–70) missing from the sitemap with no evidence of redirects.
7. 2-hop redirect chain on `http://ensmenu.com/` (bare apex, HTTP) — should be a single hop to `https://www.ensmenu.com/`.
8. Knowledge-base URLs exceed 100 characters (116–136 chars sampled).
9. IndexNow protocol not implemented.
10. HSTS header missing `includeSubDomains`/`preload` directives.
11. Hreflang delivered only via HTTP header with no HTML `<link>` or sitemap-annotation fallback — single point of failure.
11a. **New (`/seo-hreflang` deep dive):** the homepage's canonical tag (`https://www.ensmenu.com`, no trailing slash) doesn't exactly match its own hreflang self-reference (`https://www.ensmenu.com/`, with trailing slash) — every other page checked is unaffected. See `findings/hreflang.md`.
11b. **New (`/seo-hreflang` deep dive):** customer-menu subdomains render an additional in-HTML hreflang `<link>` tag with **relative** hrefs (`href="/"`, `href="/en"`) instead of the absolute URLs Google requires — this comes from the separate customer-menu storefront deployment, not this repository. See `findings/hreflang.md`.

## Low Priority (backlog)

12. ~~Re-verify `/sitemap.xml` (literal, with extension) returns the documented 301 → `/sitemap`~~ — **confirmed fixed.** Re-tested live during the `/seo-sitemap` deep dive: `/sitemap.xml` now cleanly returns a `308` to `/sitemap`. The earlier 500 was transient.
13. Touch-target sizing, base font size, and full mobile/desktop content parity should be verified with a rendering tool (Lighthouse/Playwright) once available — not independently confirmed in this source-code-based audit.
14. Confirm the current blanket `Allow: /` stance toward AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) is an intentional GEO strategy decision rather than an oversight.
15. Sitemap-index `<lastmod>` values are uniform across all 3 child sitemaps per locale rather than each reflecting its own real last-change date; 345 of 381 total sitemap URLs (100% of the customer-menu tier) have no `<lastmod>` at all. See `sitemap.md` for full detail.
