# AI Search Readiness (GEO) Findings — ensmenu.com

Score: **35/100**

## What works

- `robots.txt` uses a blanket `Allow: /` with no rules specifically disallowing AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot, etc.), so AI crawlers are not being actively blocked.
- Knowledge-base content topics — direct competitor comparisons ("ENSMENU vs GloriaFood"), numbered listicles ("15 QR menu ideas"), and how-to guides — are exactly the content shape AI answer engines favor for citation, *if they can read it*.

## Findings

### Best AI-citation content is invisible to non-JS crawlers — **Critical**

This is the single highest-impact GEO issue on the site, and it's the same root cause documented in `content.md` finding #1: knowledge-base article bodies are fetched entirely client-side after hydration. Most AI/LLM crawlers used for training and live-citation retrieval (GPTBot, ClaudeBot, PerplexityBot, and similar) do not execute JavaScript at crawl scale — they will see an essentially empty article page where the comparison/how-to content should be.

In other words: the content strategically built to win AI Overview, ChatGPT-search, and Perplexity citations is currently structurally unable to be cited by those systems.

**Fix:** Same as `content.md` #1 — server-render the article body.

### `/llms.txt` not implemented — **Medium**

`https://www.ensmenu.com/llms.txt` returns the full homepage (200 OK) instead of a proper plain-text `llms.txt` file or a 404. See `technical.md` finding #2 for the fix.

### No Article schema — **Medium**

AI engines increasingly use structured data as a parsing and trust signal when selecting citation sources (unconfirmed uplift — no primary source to cite). None exists currently. See `schema.md` for the full deep-dive and ready-to-use JSON-LD (`generated-schema.json`). Note: FAQPage schema was previously grouped with Article here, but Google retired FAQ rich results for all sites May 7, 2026, and any AI-citation benefit specific to FAQPage is unconfirmed — it's now an optional, Info-priority item rather than part of this recommendation.

## Recommended sequencing

1. Fix SSR for knowledge-base articles (this alone unlocks AI-crawler visibility for the site's most citation-worthy content).
2. Add Article schema alongside the SSR fix.
3. Ship `/llms.txt` as a cheap, independent win.
4. Re-test by fetching article URLs with a plain HTTP client (no JS execution) — exactly as this audit did — to confirm the content is now present in the raw response.
