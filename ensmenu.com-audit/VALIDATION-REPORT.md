# Sitemap Validation Report — ensmenu.com

**Date:** 2026-08-03 · **Method:** Live fetch (`curl.exe`) of every declared sitemap + source review of `src/lib/sitemap/`
**Full detail:** [`findings/sitemap.md`](findings/sitemap.md) · **Raw fetched files:** [`raw/`](raw/)

## Summary

| Metric | Value |
|---|---|
| Sitemap architecture | 2 locale indexes → 6 leaf sitemaps (main / knowledge-base / menus, ×2 locales) |
| Total indexed URLs | 381 |
| Largest single file | `sitemap-menus/1` — 173 URLs, 22.5KB (0.04% of the 50,000-URL / 50MB limit) |
| XML validity | ✅ 8/8 files parse cleanly, correct namespace, proper escaping |
| HTTPS-only | ✅ 0 of 381 URLs use `http://` |
| Duplicate URLs found | ✅ 0 |
| Redirected URLs found in sitemap | ✅ 0 |
| **Soft-404 / junk URLs found in sitemap** | ❌ **At least 2 confirmed, 10 suspected (~5.8% of the menu tier)** |
| URLs missing `<lastmod>` | ⚠️ 345 of 381 (100% of the customer-menu tier) |

## Issues Found

| # | Issue | Severity | Fix Location |
|---|---|---|---|
| 1 | Test/placeholder customer subdomains (`test.ensmenu.com`, `testing.ensmenu.com`, `your-slug-ensmenu-com*`, etc.) are indexed in the sitemap and return HTTP 200 soft-404 "menu not found" pages | **Critical** | `/public/menus` API + `fetchPublicMenus()` in `src/lib/sitemap/data.ts` |
| 2 | Sitemap index `<lastmod>` is identical across all 3 child sitemaps per locale, not reflecting each child's real last change | Low | `buildLocaleSitemapIndex()` in `src/lib/sitemap/data.ts` |
| 3 | 100% of customer-menu URLs (345/345) have no `<lastmod>` at all | Low | `/public/menus` API (backend data, not sitemap code) |
| 4 | One-URL locale mismatch observed (`300.ensmenu.com` in EN but not AR) — likely a live-data timing artifact from this audit, not a confirmed bug | Low (needs re-verification) | N/A — re-check only |
| 5 | `<priority>`/`<changefreq>` emitted on every URL despite being fully ignored by Google | Info | `buildUrlset()` in `src/lib/sitemap/xml.ts` |

## What's Already Correct

- Well-architected, index-based, locale-split sitemap that's already built to auto-paginate past 50,000 URLs
- Valid XML, correct namespace, proper entity escaping across all files
- robots.txt correctly declares both sitemaps and excludes all private routes from both crawling and the sitemap
- Legacy `/sitemap.xml` cleanly 308-redirects to `/sitemap`
- Knowledge-base article `<lastmod>` dates are real and varied — trustworthy freshness signal on that tier
- No non-HTTPS, duplicate, or redirected URLs anywhere in the 381 checked

## Recommendations, in priority order

1. **Filter test/internal accounts out of `/public/menus`** before they reach the sitemap — this is the only Critical item and the highest-value fix in this report. Manually audit the full 173/172-URL list beyond the 10 pattern-matched here for other non-customer entries.
2. Fix the sitemap-index `<lastmod>` to use each child's own real newest date instead of one shared value across all three children.
3. Confirm with the backend whether `/public/menus` can expose `updatedAt`/`createdAt` per menu — the sitemap code already supports it, it's just not receiving the data.
4. Re-check the `300.ensmenu.com` EN/AR discrepancy once more before treating it as a real bug.
5. (Optional cleanup) Drop `<priority>`/`<changefreq>` from the sitemap generator — zero functional benefit, Google ignores both.

This report and `findings/sitemap.md` supersede the sitemap-related bullet points in the general `/seo-audit` findings (`findings/technical.md` and `audit-data.json`), which have been updated to cross-reference this deeper analysis and add the newly-discovered Critical test-account issue.
