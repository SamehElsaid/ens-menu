# Hreflang & International SEO Audit — ensmenu.com

**Method:** Live header/HTML inspection (`curl.exe`) across both locales on every major page type (homepage, pricing, FAQ, knowledge-base listing + article, privacy policy, an `/auth` page, and a customer-menu subdomain), cross-referenced against the implementation source (`src/proxy.ts`, `src/lib/seo.ts`, `src/i18n/routing.ts`).

## Summary

- **Languages detected:** 2 — Arabic (`ar`, default, no URL prefix) and English (`en`, `/en` prefix) — `next-intl` `localePrefix: "as-needed"`.
- **Delivery method:** HTTP `Link` response header only, site-wide, generated automatically by `next-intl`'s middleware (`createMiddleware(routing)` in `src/proxy.ts`) — not hand-rolled per page.
- **Pages validated:** 10 URL pairs across 8 page types (marketing home/pricing/FAQ, KB listing, KB article, privacy policy, an `/auth` page, and one customer-menu subdomain) — **all 10 pairs pass** self-reference, return-tag reciprocity, and x-default checks.
- **Issues found:** 1 Medium (canonical/hreflang trailing-slash mismatch on the homepage), 1 Medium (customer-menu subdomains additionally render non-compliant relative-URL HTML hreflang tags from a separate deployment), plus the previously-documented single-point-of-failure risk of a header-only implementation.

## Validation Results

| Page | Locale | URL | Self-Ref | Return Tags | x-default | Canonical Match | Status |
|---|---|---|---|---|---|---|---|
| Homepage | ar | `https://www.ensmenu.com/` | ✅ | ✅ | ✅ (→ ar) | ❌ canonical is `https://www.ensmenu.com` (no slash) | ⚠️ |
| Homepage | en | `https://www.ensmenu.com/en` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pricing | ar/en | `/pricing`, `/en/pricing` | ✅ | ✅ | ✅ | ✅ (verified ar) | ✅ |
| FAQ | ar/en | `/faq`, `/en/faq` | ✅ | ✅ | ✅ | ✅ (verified ar) | ✅ |
| Knowledge-base listing | ar/en | `/knowledge-base`, `/en/knowledge-base` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Knowledge-base article | ar/en | `/knowledge-base/{slug}`, `/en/knowledge-base/{slug}` | ✅ | ✅ | ✅ | ✅ (verified en) | ✅ |
| Privacy policy | ar/en | `/privacy-policy`, `/en/privacy-policy` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/auth/login` | ar/en | `/auth/login`, `/en/auth/login` | ✅ | ✅ | ✅ | N/A — page is `noindex` + `robots.txt`-disallowed | ℹ️ moot |
| Customer-menu subdomain (`elwensh.ensmenu.com`) | ar/en | `/`, `/en` (HTTP header) | ✅ | ✅ | ✅ | Not checked (no separate canonical tag found) | ⚠️ see below |

All language codes used are bare, valid ISO 639-1 (`ar`, `en`) with no region subtags — correct, since there's no region-specific content variant to justify `ar-EG`/`en-US` style targeting. All URLs are HTTPS-only; no protocol mismatches found anywhere.

## Findings

### Homepage canonical tag and hreflang self-reference disagree on trailing slash — Medium

Live inspection of the Arabic homepage HTML shows `<link rel="canonical" href="https://www.ensmenu.com"/>` (no trailing slash), while the same page's HTTP `Link` header hreflang self-reference is `<https://www.ensmenu.com/>; rel="alternate"; hreflang="ar"` (**with** a trailing slash) — a real, verified mismatch on the single highest-value page on the site. Per the skill/Google's own guidance, "the canonical URL and hreflang URL must match exactly, including trailing slashes." `src/lib/seo.ts` computes the canonical via `new URL(canonicalPath, baseUrl).href`, which for a root path always yields a trailing slash (`https://www.ensmenu.com/`) — so the mismatch is introduced later, most likely by Next.js's own metadata-canonical serialization normalizing away a lone trailing slash on the site root. Every non-root page checked (`/pricing`, `/faq`, KB article) is unaffected since their canonical/hreflang paths never end in a bare slash. **Fix:** confirm which layer strips the slash (Next.js metadata resolution vs. a build/edge rewrite) and align the two to whichever the team wants as the single canonical form of the homepage URL — most sites standardize on the no-trailing-slash form, in which case the hreflang self-reference (not the canonical tag) should be the one corrected.

### Customer-menu subdomains render an additional, non-compliant relative-URL HTML hreflang tag — Medium

`elwensh.ensmenu.com` (and every other `*.ensmenu.com` customer menu checked, including the soft-404 test accounts flagged in the sitemap audit) correctly receives the same reciprocal, absolute-URL HTTP `Link` header hreflang as the main site — confirming the shared `next-intl` middleware in this repo (`src/proxy.ts`) does extend correct hreflang to all 172 customer subdomains, not just the marketing site (this refines/corrects the assumption in `src/lib/sitemap/data.ts`'s comment "treated as separate sites" — that comment is accurate for *sitemap* purposes only, not for the live HTTP-header hreflang, which does apply per-subdomain).

However, the actual rendered page HTML on these subdomains *also* includes its own `<link rel="alternate" hrefLang="ar" href="/">` and `<link rel="alternate" hrefLang="en" href="/en">` tags with **relative** hrefs, not absolute URLs. Google explicitly documents that hreflang href values should be "the full, absolute URL, including the transport method (https)" — a relative URL is a listed common mistake pattern, and having two hreflang implementations on the same page that disagree in format (absolute via header, relative via HTML) is an inconsistency worth resolving even though same-origin relative URLs would typically resolve correctly. This HTML output comes from the customer-menu storefront template, which — per this audit's existing Limitations note — **is a separate deployment not present in this repository**, so the fix must be made in that codebase, not here.

### Header-only implementation remains a single point of failure — Low *(cross-reference, not new)*

Already documented in `findings/technical.md` (item 11): hreflang is delivered exclusively via the HTTP `Link` header, generated implicitly by `next-intl` middleware rather than declared explicitly in HTML `<link>` tags or a sitemap. This audit's live testing reconfirms the header is applied consistently and correctly across every page type checked, so it is not currently broken — but it means a single CDN/edge misconfiguration, a middleware matcher change, or a header-stripping proxy could silently remove all international targeting sitewide with no HTML-level fallback to catch it. Given the site's real internationalization surface (2 locales × marketing pages × KB articles × 172+ customer subdomains, growing), adding a redundant `alternates.languages` entry in `buildSeoMetadata()` (Next.js will render this as an HTML `<link>` tag) costs one field and removes the single point of failure — this recommendation already exists in `ACTION-PLAN.md` item 20.

## What Works

- **Full mesh, reciprocal hreflang confirmed on every page type tested** (8 page types × 2 locales = correct self-reference and return tags in all cases) — no missing alternates, no one-directional relationships found.
- **`x-default` is present and correctly points to the Arabic version** (the site's actual `defaultLocale`) on every page — the technically correct choice per Google's own guidance, not the more common (but here incorrect) "default to English" pattern.
- **Valid ISO 639-1 language codes** (`ar`, `en`) with no invalid codes, no ISO 639-2 mistakes, no bogus region codes anywhere.
- **Protocol-consistent** — 100% HTTPS across every hreflang URL checked.
- **`html lang`/`dir` attributes correctly flip per locale** (`lang="ar" dir="rtl"` vs. `lang="en" dir="ltr"`), independently confirming the locale-routing logic is sound at the HTML level too, not just in headers.
- **The shared middleware correctly extends hreflang to the entire 172-subdomain customer-menu tier automatically**, at zero incremental engineering cost — a good architectural side-effect of centralizing locale routing in one middleware.

## Cultural Adaptation (light-touch note)

A full cultural-profile pass wasn't run as a separate exercise since it would duplicate the existing E-E-A-T/content audit (`findings/content.md`), but one relevant carry-over: Open Graph's `og:locale` is hardcoded to `en_GB` for all English pages (`src/lib/seo.ts`) regardless of the actual target English-speaking market (the business is Egypt-based with "worldwide" ambitions, not UK-specific) — already flagged in `audit-data.json`/`ACTION-PLAN.md` item 22. This is an Open Graph locale tag, not hreflang, so it doesn't affect the validation above, but it's worth fixing in the same pass since both live in `buildSeoMetadata()`.

## Recommendations, in priority order

1. Resolve the homepage canonical/hreflang trailing-slash mismatch — pick one canonical form for the site root and make both match exactly.
2. Fix the customer-menu storefront template's HTML hreflang tags to use absolute URLs (separate deployment — flag to whichever team owns that codebase).
3. Add `alternates.languages` to `buildSeoMetadata()` as a redundant HTML-level hreflang signal, removing the header-only single point of failure (already tracked as `ACTION-PLAN.md` item 20).
4. (Optional, low value) Reconsider `og:locale: "en_GB"` against the actual target English-speaking markets (already tracked as item 22).
