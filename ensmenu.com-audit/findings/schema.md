# Schema & Structured Data — Deep-Dive Audit (`/seo-schema`)

Score: **10/100** (unchanged from the general audit — this is the detailed follow-up)

> **Correction to earlier guidance:** the general audit's "quick win" to add `FAQPage` JSON-LD to `/faq` is now **downgraded from a priority recommendation**. Google retired FAQ rich results for **all** sites on **May 7, 2026** (this supersedes the 2023 gov/health-only restriction). Adding `FAQPage` today provides **no Google SERP benefit** — see the Recommendations table below for what replaces it in priority order. This file, `audit-data.json`, `ACTION-PLAN.md`, and `FULL-AUDIT-REPORT.md` have been updated to reflect this.

---

## Detection

A codebase-wide search across `src/` for `"@type"`, `"@context"`, `application/ld+json`, and common helper names (`JsonLd`, `StructuredData`, `structuredData`, `schema.org`) returned **zero matches**. No Microdata (`itemscope`/`itemprop`) or RDFa (`typeof`/`property`) was found either. No page — homepage, about, pricing, contact, faq, mobile-app, owner-app, knowledge-base, or knowledge-base articles — emits any structured data of any kind.

## Validation Results

| Schema | Page(s) | Status | Issues |
|---|---|---|---|
| Organization | Site-wide (root layout) | ❌ Missing | No entity markup exists to establish brand identity for Google Knowledge Panel or AI systems |
| WebSite | Site-wide (root layout) | ❌ Missing | No site-level markup |
| WebApplication / SoftwareApplication | Homepage | ❌ Missing | Product is fully undescribed to structured-data consumers |
| Service | Homepage / about | ❌ Missing | Optional alternative/companion to WebApplication — not currently required |
| FAQPage | `/faq` | ❌ Missing | **Downgraded priority** — Google retired FAQ rich results for all sites May 7, 2026. 9 well-formed Q&A pairs exist as raw content but adding this schema yields no confirmed SERP or AI-citation benefit. Not recommended as a priority item. |
| Article | `/knowledge-base/[slug]` (8 live articles) | ❌ Missing | `datePublished`/`dateModified` are technically available (`createdAt`/`updatedAt` already exist on the `ArticleDetail` type used by the **client** component) but are not currently fetched by the **server** component that would need to emit this schema — see dependency note below |
| BreadcrumbList | `/knowledge-base/[slug]` | ❌ Missing | No breadcrumb trail markup anywhere |
| Person (author) | `/knowledge-base/[slug]` | ❌ Missing | No author field exists in the article data model at all — this is a content-model gap, not just a markup gap (see `content.md` finding on missing bylines) |
| ImageObject | Homepage / KB articles | ❌ Missing | Not currently needed as standalone markup; feeds into `Article.image` once articles have per-article hero images |
| AggregateRating / Review | Homepage | ❌ Not applicable | **Do not add.** No genuine third-party reviews or testimonials exist yet (see `content.md`). Adding `AggregateRating` without real backing reviews risks a Google manual action for structured-data spam. Revisit once the testimonials/reviews gap in `content.md` is fixed. |
| Microdata / RDFa | Any | ❌ None found | N/A — JSON-LD is the correct target format regardless |

## Recommended schema additions, in priority order

1. **Organization + WebSite** (root layout, `src/app/[locale]/layout.tsx`) — `name`, `url`, `logo`, `sameAs` (populate from real social links already defined in `src/modules/Footer/data.ts`: Instagram, Facebook, TikTok, YouTube), plus `contactPoint` entries for the three real phone lines already in `Footer/data.ts`. Zero content work required — every value already exists in the codebase except the logo URL (see caveat below) and legal entity name.
2. **WebApplication** (homepage) — `applicationCategory: "BusinessApplication"`, `offers` (maps to the homepage's "100% free" claim), `featureList` (QR menu creation, AI menu import, bilingual support, multi-branch management). Using `WebApplication` rather than `SoftwareApplication` because ENSmenu is a browser-based SaaS product, not an installable app — see `schema-types.md` distinction.
3. **Article** (every knowledge-base article) — `headline`, `datePublished`, `dateModified`, `author`, `publisher`, `image`. **Dependency:** this should ship together with the SSR fix already flagged in `content.md` finding #1, for two reasons: (a) the article body needs to be server-rendered for the schema to describe real, crawlable content rather than markup describing an empty page, and (b) `createdAt`/`updatedAt` need to be added to the `ArticleDetail` interface in `src/app/[locale]/(main)/knowledge-base/[slug]/page.tsx` (currently only `titleAr/En` and `descriptionAr/En` are fetched server-side — the dates exist in the same API response and are already used by the **client** component, so no backend change is needed, only passing the existing fields through).
4. **BreadcrumbList** (knowledge-base articles) — `Home > Knowledge Base > {Article Title}`.
5. **FAQPage** (`/faq`) — **optional, Info-priority only.** No Google SERP rich-result benefit exists as of May 7, 2026, and any AI-citation benefit is unconfirmed. Only add this if there's near-zero engineering cost to spare; do not prioritize it over items 1–4. If genuine user-submitted Q&A is ever introduced (not the case today — this is static marketing FAQ content), use `QAPage` instead, which remains fully supported.
6. **BreadcrumbList** (marketing pages: about, pricing, contact) — lower priority, nice-to-have consistency pass once the KB breadcrumbs ship.

## Caveats on the generated schema (see `../generated-schema.json`)

- **Logo URL is a placeholder.** The two logo-shaped assets found in `public/` (`ENSd.png`, used inside generated QR code overlays per `src/lib/styledQr.ts`; `email-logo.png`, unreferenced in this repo) do not appear to be the canonical site-wide brand logo. Confirm the real, hosted brand logo URL (ideally a square PNG/JPG ≥112×112px) before publishing the `Organization.logo` value.
- **Legal entity name is a placeholder.** `content.md` already flagged that no registered legal entity name appears anywhere on the site. `Organization.legalName` is left as a clearly-marked placeholder — do not publish a guessed value.
- **No `AggregateRating`/`Review` was generated,** deliberately, per the Validation Results table above.
- **Article `author` defaults to the Organization,** not a `Person`, because no author field exists in the current content model. Once real bylines are introduced (see `content.md` recommendation), switch to a `Person` type with `worksFor` pointing back to the Organization `@id`.
- **`WebApplication.offers.price` is templated as `"0"`** to match the homepage's "100% free" claim for the entry tier — confirm this still matches the live pricing plan before publishing, since pricing is fetched dynamically (`ProPlanPriceSelector.tsx`) and not hardcoded in the repo.

## Why this matters

- Schema is a prerequisite for most rich results (article rich results, sitelinks search box via `WebSite`/`SearchAction` — though note `SearchAction` itself carries no confirmed Google sitelinks benefit per current guidance) and for a Google Knowledge Panel.
- AI answer engines (Google AI Overviews, Perplexity, ChatGPT search) increasingly use structured data as a parsing/trust signal when deciding what to cite — this compounds with the GEO findings in `geo.md`, though no confirmed uplift number should be claimed without a primary source.
- Zero implementation-risk here: this is purely additive markup with no existing behavior to break, aside from the Article schema's dependency on the SSR fix already planned.
