# Sitemap Analysis — Deep-Dive Audit (`/seo-sitemap`)

**Method:** Live fetch of every sitemap file (`curl.exe`) + source review of the sitemap-generation code (`src/lib/sitemap/`, 4 route handlers). `claude-seo`'s `sitemap_discovery.py` was not available in this environment; robots.txt was read directly instead, and every declared sitemap was fetched and parsed.

## Architecture (confirmed live)

```
robots.txt
 ├─ Sitemap: https://www.ensmenu.com/sitemap        (Arabic, default locale)
 └─ Sitemap: https://www.ensmenu.com/en/sitemap      (English)

/sitemap (index)                       /en/sitemap (index)
 ├─ /sitemap-main            (10 URLs)  ├─ /en/sitemap-main            (10 URLs)
 ├─ /sitemap-knowledge-base   (8 URLs)  ├─ /en/sitemap-knowledge-base   (8 URLs)
 └─ /sitemap-menus/1        (172 URLs) └─ /en/sitemap-menus/1        (173 URLs)
```

**Total indexed URLs: 381** (well under the 50,000-URL / 50MB per-file limit — no splitting needed for a long time at current growth rates).

## Validation Checks

| Check | Result |
|---|---|
| Valid XML format | ✅ Pass — all 8 files (2 indexes + 6 leaves) parsed cleanly, correct `http://www.sitemaps.org/schemas/sitemap/0.9` namespace, proper entity escaping (`escapeXml()` in `src/lib/sitemap/xml.ts`) |
| Per-file limit (≤50,000 URLs / ≤50MB) | ✅ Pass — largest file is `sitemap-menus/1` at 173 URLs / 22.5KB, ~0.04% of the URL limit |
| All URLs return HTTP 200 | ⚠️ **Technically pass, semantically fail** — every sampled URL (including the 10 flagged below) returns raw HTTP 200. But several return **soft-404** content (200 status, "menu not found" body) — see Critical finding below. A plain status-code check alone would have missed this. |
| `<lastmod>` accuracy | ⚠️ **Partial fail** — see High and Low findings below (uniform index-level dates; zero coverage on 345 menu URLs) |
| No deprecated tags (`<priority>`, `<changefreq>`) | ❌ Fail (Info) — both are emitted on every single URL across all leaf sitemaps; Google ignores both entirely |
| Sitemap referenced in robots.txt | ✅ Pass — both locale indexes correctly declared |
| Crawled pages vs. sitemap coverage | ✅ Pass for marketing pages (all 10 expected routes present, private routes correctly excluded) — see programmatic-content finding for the menu tier |
| Quality: sitemap index used for >50k URLs | ✅ N/A yet, but architecture is already index-based and ready to scale (per-page `/sitemap-menus/{page}` pagination already implemented) |
| Quality: split by content type | ✅ Pass — pages / knowledge-base / menus are already cleanly separated |
| Quality: no non-canonical/noindexed/redirected URLs | ⚠️ **Partial fail** — see Critical finding (soft-404 junk is not "noindexed" but shouldn't be crawlable at all); no redirects or non-canonical URLs found otherwise |
| HTTPS only | ✅ Pass — 0 of 381 URLs use `http://` |

## Findings

### Test/placeholder customer subdomains are indexed and return soft-404 content — **Critical**

Pattern-matching the 173 English-locale menu URLs for placeholder-looking slugs found **10 matches (~5.8% of all menu URLs)**:

```
test.ensmenu.com          testing.ensmenu.com        test1.ensmenu.com
test5.ensmenu.com         tester.ensmenu.com
your-slug-ensmenu-com.ensmenu.com
your-slug-ensmenu-com-1.ensmenu.com
your-slug-ensmenu-com-1-1.ensmenu.com
your-slug-ensmenu-com-1-1-1.ensmenu.com
your-slug-ensmenu-com-2.ensmenu.com
```

Spot-checking two of them live confirms this is not just a cosmetic naming issue — the pages are genuine soft-404s:

- `https://test.ensmenu.com/en` → HTTP 200, but renders "**This menu is not found** — We could not find a menu at this link" with `<title>test</title>` and `<meta name="description" content="test">`.
- `https://testing.ensmenu.com/en` → HTTP 200, same soft-404 template, `<title>sss</title>`.

(One `your-slug-ensmenu-com-*` variant, by contrast, resolved to a real, live menu titled "Lio" with a real uploaded logo — so not every matched slug is empty; the account holder just never customized their subdomain away from the auto-generated default. That one is a UX/onboarding issue rather than a crawl-budget issue, but it's still a poor, unprofessional-looking indexed URL.)

**Why this matters:** these are almost certainly internal test/QA accounts from the ENSmenu team, never intended for public discovery, that are nonetheless coming back from the same `/public/menus` API endpoint `fetchPublicMenus()` reads to build the sitemap — with no filter for test/unpublished/placeholder accounts. Google is being handed thin, duplicate-template "not found" pages to crawl and index under the `*.ensmenu.com` domain family, which:
1. Wastes crawl budget across a real, converting production domain.
2. Risks a soft-404 / thin-content quality signal bleeding into how Google evaluates the domain as a whole (the same root domain that also hosts the marketing site and knowledge base).
3. Is embarrassing if a prospect or journalist finds `test.ensmenu.com` indexed in Google.

**Fix:** filter the `/public/menus` backend response (or `fetchPublicMenus()` in `src/lib/sitemap/data.ts`) to exclude accounts flagged as test/internal/unpublished, and to exclude any account whose menu genuinely has zero items (the direct cause of the "menu not found" soft-404 template). As a quick mitigation while the backend filter ships, also block the known test-account hostnames at the edge/CDN with a real `404`/`410` and a `noindex` header. Given this pattern was found from only a keyword-match scan, **manually review the full 173/172-URL list for other non-customer accounts** beyond the 10 caught here.

### Sitemap index `<lastmod>` is suspiciously uniform across all 3 child sitemaps per locale — **Low**

`/sitemap` and `/en/sitemap` both apply a single computed "newest date across every source" value identically to all three child `<sitemap>` entries (`sitemap-main`, `sitemap-knowledge-base`, `sitemap-menus/1`) — both currently show `2026-07-26` for all three children. But `sitemap-main`'s own individual page URLs show their real last-modified date as `2026-07-04` (three weeks earlier) — meaning the index is telling Google "this child sitemap changed on 2026-07-26" when the content it actually points to hasn't changed since `2026-07-04`. Per Google's own guidance, `<lastmod>` must reflect the last significant content change of what it labels, and repeated/uniform values that don't match the underlying content's real modification date can cause Google to stop trusting the signal.

**Fix:** `src/app/[locale]/sitemap/route.ts` already computes `newestFromMenus`, `newestFromKb`, and `newestFromMeta` as three separate values before collapsing them into one shared `lastmod` — route each value to its correct child entry in `buildLocaleSitemapIndex()` instead of passing a single merged date to all three.

### 345 customer-menu URLs (100% of the menu tier) have zero `<lastmod>` value — **Low**

Every single URL in both `sitemap-menus-1-*.xml` files omits `<lastmod>` entirely. `buildMenuEntries()` already contains the logic to emit it (`lastmodFromApi(menu.updatedAt, menu.createdAt)`), so this means the `/public/menus` API is not currently returning `updatedAt`/`createdAt` for any of the 173 sampled menus. Combined with `changefreq: weekly` being hardcoded for all of them (which Google ignores anyway), this leaves **zero real freshness signal** for the single largest and most frequently-changing content tier on the whole site — exactly the URLs a "recrawl me, I changed" signal would help most.

**Fix:** confirm with the backend team whether `/public/menus` can include `updatedAt`/`createdAt` per menu (likely already tracked in the database for the dashboard's own "last edited" UI) — this is a data-plumbing fix, not a sitemap-code fix, since the sitemap side already handles the field correctly when present.

### One-URL locale mismatch observed: `300.ensmenu.com` — **Low / needs re-verification**

`https://300.ensmenu.com/en` appears in the English menu sitemap (173 URLs) but `https://300.ensmenu.com/` does **not** appear in the Arabic menu sitemap (172 URLs), even though the Arabic-locale page itself resolves fine (`200 OK`, verified live). Both locale routes call the identical `fetchPublicMenus()` function, so this is most likely a live-data timing artifact — e.g., a new customer account was created in the ~60 seconds between the two sitemap fetches performed during this audit — rather than a code defect. **Recommend one follow-up check**: re-fetch both `/sitemap-menus/1` and `/en/sitemap-menus/1` a few minutes apart and confirm the counts converge; if the same slug is reproducibly missing from one locale on a later check, that indicates a real bug rather than a timing race.

### `<priority>` and `<changefreq>` emitted on every URL — **Info**

Both tags are written on every `<url>` entry in every leaf sitemap (confirmed in `buildUrlset()`, `src/lib/sitemap/xml.ts`). Google has confirmed it ignores both entirely. Not harmful, but removable dead weight — every byte saved compounds slightly at 381+ URLs and growing.

## What Works

- **Correctly architected sitemap index.** Locale-based indexes (`/sitemap`, `/en/sitemap`) each cleanly delegate to content-type-specific children (main pages, knowledge base, paginated customer menus) — this is exactly the "split by content type" + "index for scale" pattern the sitemap skill recommends, and it's already built to paginate automatically once menu count crosses 50,000 (`menuSitemapPageCount()`).
- **Valid, well-formed XML throughout** — correct namespace, proper `escapeXml()` entity escaping, verified by parsing all 8 fetched files without error.
- **Zero non-HTTPS URLs**, **zero duplicate URLs** within any single file checked, **zero redirects** encountered on any sampled URL (all direct 200s, both with and without `-L`).
- **robots.txt correctly declares both locale sitemap indexes** and cleanly excludes all private routes (`/dashboard`, `/admin`, `/auth`, `/payment`, `/unauthorized`, and their `/en/*` equivalents) from both crawling and the sitemap simultaneously.
- **Legacy `/sitemap.xml` cleanly 308-redirects** to the new `/sitemap` route (single hop, verified live) — no broken legacy links.
- **Knowledge-base article `<lastmod>` values are real and varied** (`2026-07-04`, `2026-07-23`, `2026-07-26` across the 8 articles), not the identical-lastmod anti-pattern — this tier's freshness signal is trustworthy, in contrast to the menu tier.
- **381 total URLs is nowhere near the 50,000/50MB per-file limit** — no splitting concerns for the foreseeable future even accounting for significant customer growth.

## Extension Sitemaps (Image / Video / News)

Not applicable — no `image:`, `video:`, or `news:` namespaced sitemap exists or appears needed for this business (no news publishing, and product/menu photos are better served by standard `next/image` + the existing `<url>` entries rather than a dedicated image sitemap at this scale).
