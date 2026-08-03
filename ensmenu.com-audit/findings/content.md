# Content Quality & E-E-A-T Analysis — ensmenu.com

**Method:** Word counts and content structure were computed directly from the source-of-truth translation files (`messages/en.json`, `messages/ar.json`, ~248K/318K chars) by extracting and counting every string under each page's actual translation namespaces — a more precise method than scraping rendered HTML, and one that also revealed which written content is or isn't actually wired up to a live page. This was combined with a full component-tree read of every marketing page to confirm what's rendered vs. unused, plus the live-site verification from the earlier technical/full audits (JS-rendering behavior, sitemap coverage).

## Content Quality Score: 44/100

### E-E-A-T Breakdown

| Factor | Score | Key Signals |
|---|---|---|
| Experience | 10/20 | Real product demo video, realistic in-product UI mockups throughout marketing pages, authentic "Built in Egypt" origin note. **Missing:** no quantified case studies/before-after results, no founder/team story or photos. |
| Expertise | 8/25 | Detailed pricing/feature comparison tables and a direct competitor comparison article show real product/category knowledge. **Missing:** zero author bylines or credentials anywhere (including on knowledge-base articles), no team/leadership bios, no editorial-process disclosure. |
| Authoritativeness | 8/25 | Active, real social profiles (Instagram, Facebook, TikTok, YouTube), a genuine customer-logo marquee. **Missing:** no testimonials or customer quotes anywhere on the site, no case studies, no third-party review platform presence (Google Reviews/Trustpilot/Capterra), zero Organization/entity schema. |
| Trustworthiness | 20/30 | Multiple real, working contact channels (UAE + Egypt phone numbers, WhatsApp, email, live chat), a Google Maps embed with real coordinates, thorough Privacy Policy (620 words) and Terms (689 words) both with a dynamic "last updated" date, transparent "100% free, no credit card" pricing claim. **Missing:** the displayed location text is just "Egypt" (no street/city address despite exact coordinates existing internally); no registered legal entity name found anywhere in the footer or legal pages. |

**Total: 46/100** *(this is the E-E-A-T sub-score; the overall Content Quality Score of 44/100 also weighs in the structural/depth issues below.)*

### AI Citation Readiness: 25/100

- The site's best AI-citation material — knowledge-base comparison/how-to articles — is **structurally invisible to AI crawlers** (client-rendered body content; see `technical.md`/`geo.md` for full detail). This alone caps the score heavily.
- No quotable, sourced statistics were found anywhere in the marketing copy (the homepage/about copy makes qualitative claims — "faster orders," "fewer mistakes" — without cited data points, case-study numbers, or attributed sources).
- The FAQ page has 9 well-formed Q&A pairs — good raw material for AI extraction — but carries no `FAQPage`/structured markup (see `schema.md`).
- No `Organization`/`Person` schema exists to establish clear entity identity for AI systems.
- The comparison-article format ("ENSMENU vs GloriaFood") is exactly the shape AI engines prefer to cite — the content strategy is right, the delivery mechanism is broken.

---

## Word Count Analysis (measured from `messages/en.json`, English content)

| Page | Measured word count | Guideline floor | Status |
|---|---|---|---|
| Homepage (hero + features + how-it-works + FAQ teaser) | 689 | 500 | ✓ Pass |
| About (`/about`) | 410 | ~500 (informational page) | ⚠ Slightly thin |
| Pricing (`/pricing`) | 632 | 800 (service page) | ⚠ Below floor, but pricing/comparison tables are inherently structured rather than prose — word count is a weaker signal here per the skill's own guidance |
| FAQ (`/faq`) | 345 (9 Q&A pairs) | n/a | ✓ Reasonable for FAQ format |
| Contact (`/contact`) | 97 | n/a | ✓ Expected — functional page with real contact info, not a content page |
| **Mobile app (`/mobile-app`) — as actually rendered** | **368** | ~500-800 | ✗ **Thin, and avoidably so — see finding below** |
| Owner app (`/ens_owner_app_owner`) | not separately measured; renders Hero + Features + CTA (Features section active) | ~500-800 | Likely adequate — full component set is live |
| Privacy Policy | 620 | n/a | ✓ Thorough |
| Terms and Conditions | 689 | n/a | ✓ Thorough |

*(Per the skill's own guidance, these are topical-coverage floors, not hard requirements — a page that fully answers its query at 400 words beats a padded 1,500-word page. The findings below focus on cases where thinness reflects a real content gap, not just a low number.)*

## Findings

### 1. `/mobile-app` page ships ~35% less content than already exists in the codebase — **Medium**

`src/app/[locale]/(main)/mobile-app/page.tsx` renders `HeroApp`, `WorkflowApp`, `FaqApp`, and `CtaApp` — but the import for `FeaturesApp` is commented out:

```45:src/app/[locale]/(main)/mobile-app/page.tsx
      {/* <FeaturesApp /> */}
```

`FeaturesApp.tsx` and its backing translations (`Landing.FeaturesApp` + `Landing.mobileApp`, ~132 words) are fully written and translated in both `en.json` and `ar.json` — they're just not rendered. The live page currently ships only ~368 words of content across Hero/Workflow/FAQ/CTA. Re-enabling one line of code would restore a ready-made features section with zero content-creation cost.

**Fix:** Uncomment `<FeaturesApp />` in `mobile-app/page.tsx` (verify the design still fits current page layout first), or confirm removal was intentional and delete the dead import/translations if so.

### 2. No testimonials, customer quotes, or third-party reviews anywhere on the site — **High**

A search across `src/components/HomePage` for testimonial/review-related components found nothing. The only social-proof element is the `TrustedByLogosRow` logo marquee (logos only, no attributed quotes, no ratings). For a B2B SaaS selling to restaurant/café/hotel owners — a purchase decision that benefits heavily from peer validation — this is a significant, addressable Authoritativeness and Trust gap. It's also directly actionable: 172 real customer subdomains already exist, meaning there's a ready pool of actual users to source quotes/case studies from.

**Fix:** Add a testimonials section to the homepage and/or a dedicated case-studies page, ideally with named businesses (with permission), specific outcomes ("cut order errors by X%," "table turnover up Y minutes"), and — where available — links to their live `*.ensmenu.com` menu as proof.

### 3. No author/expertise signals on knowledge-base content — **Medium**

Already flagged from a technical/schema angle in the earlier audit; from a pure content-quality lens, this fails Google's "Who created it?" test outright — there is no visible byline, author bio, or credential anywhere in the article data model or rendered content. Combined with zero editorial-process disclosure, the knowledge-base content can't currently demonstrate first-hand expertise even though the topics (QR menu ROI, competitor comparisons) are exactly where expertise should be visible.

**Fix:** Add an author/reviewer field to the CMS, display it on articles, and add a short bio page linked from the byline.

### 4. Location is disclosed only as "Egypt," not a full address — **Low**

`Footer/data.ts` defines real map coordinates (`ENSMENU_MAP_COORDS`, embedded via Google Maps) but the displayed `location` label (`messages/en.json` → `"location": "Egypt"`) is just the country name. For NAP (Name-Address-Phone) consistency and local-trust signals, a specific city/address (even if it's an office rather than a public storefront) reads as more trustworthy than a bare country name next to an interactive map pin.

**Fix:** Display a real city-level (or full, if appropriate) address alongside the map embed.

### 5. No visible registered legal entity name — **Low / needs verification**

Privacy Policy and Terms content (read from `messages/en.json`) refer to "ENSMENU" throughout but no formal registered company name (e.g., "ENSMENU LLC" / "ENSMENU for Software Solutions") was found in the legal copy or footer. This is common for early-stage products but is a standard trust expectation in ToS/Privacy documents, especially once handling payments (the product includes a payment/subscription flow).

**Fix:** Confirm with the legal/business team whether a registered entity name should be added to the Terms and Privacy Policy.

## What works well

- **Multimedia:** a real product demo video (`DemoVideoModal`) plus interactive phone-mockup visualizations throughout the funnel — genuine, non-stock demonstration of the actual product, which is a real Experience signal.
- **Internal linking / navigation:** the header nav (`src/modules/Header/data.ts`) correctly links to all main pages including a "Mobile Apps" dropdown for `/mobile-app` and `/ens_owner_app_owner` — these pages are *not* orphaned from site navigation (verified directly in the header data source, correcting an initial suspicion raised by a separate, seemingly-unused link list in `Footer/data.ts`).
- **Content structure:** FAQ page has 9 well-formed Q&A pairs; pricing page has a genuinely comprehensive comparison table (feature-by-feature Free vs. Pro vs. Custom); About page follows a clear problem → solution → differentiators → vision structure.
- **Legal/trust pages:** Privacy Policy and Terms are both substantive (600-700 words) with a dynamically rendered "last updated" date — better than the common thin/boilerplate legal page.
- **Freshness:** knowledge-base articles carry real `updatedAt` timestamps reflected in the sitemap (`lastmod` as recent as 2026-07-26).
- **Readability (qualitative estimate):** marketing copy across Hero/About/FAQ sections is written in short, punchy sentences and simple vocabulary consistent with a Flesch Reading Ease in the target 60-70 range for a general audience — not independently computed with a scoring tool in this session, so treat as directional. (Flesch scoring is also a weaker signal for the Arabic-language version, where standard English readability formulas don't apply; Arabic copy was not separately assessed for readability.)

## Recommendations (priority order)

1. **Critical (shared with Technical/GEO):** server-render knowledge-base article bodies — this single fix unlocks E-E-A-T signals (freshness, depth) actually being seen by crawlers at all.
2. **High:** add a testimonials/case-studies section using real customers from the 172 existing menu subdomains.
3. **Medium:** re-enable the disabled `FeaturesApp` section on `/mobile-app`, or confirm its removal was deliberate.
4. **Medium:** add author/reviewer bylines to knowledge-base content.
5. **Low:** disclose a fuller business address; confirm the registered legal entity name is present in legal documents.
