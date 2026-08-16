import { getSiteOrigin } from "@/lib/sitemap/data";

/**
 * IndexNow (https://www.indexnow.org/) lets Bing, Yandex, and other
 * participating engines know a URL changed without waiting for a recrawl.
 * The key file at `${key}.txt` must be served at the site root and its
 * contents must exactly equal the key — see /public/[key].txt.
 */
export const INDEXNOW_KEY = "a104e5ebc03d188b8f76f39b9ab68848";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

/**
 * Submits one or more absolute URLs to IndexNow. Best-effort/non-throwing —
 * a failed ping should never break the caller (publish flow, revalidation, etc).
 */
export async function pingIndexNow(urls: string[]): Promise<boolean> {
  const urlList = urls.filter(Boolean);
  if (urlList.length === 0) return false;

  const siteOrigin = getSiteOrigin();
  const host = siteOrigin.replace(/^https?:\/\//, "");

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${siteOrigin}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
