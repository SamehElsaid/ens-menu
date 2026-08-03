import { getSiteOrigin, getSitemapMenuSuffix } from "@/lib/sitemap/data";

export const dynamic = "force-static";

/**
 * llms.txt (https://llmstxt.org/) — a plain-text primer for AI agents/crawlers
 * pointing to the site's key pages. Previously this path fell through to the
 * locale catch-all route and served the full homepage; see
 * ensmenu.com-audit/findings/technical.md and geo.md.
 */
export function GET() {
  const origin = getSiteOrigin();

  const body = `# ENSmenu

> ENSmenu is a bilingual (Arabic/English) SaaS platform for creating digital QR menus and ordering systems for restaurants, cafes, and hotels, with AI-powered menu import from photo or PDF.

ENSmenu lets restaurant, cafe, and hotel owners build a free digital QR-code menu in minutes, manage items/prices/branches from a dashboard, and let guests order directly by scanning a code — no app install required. The product also powers a public menu for every customer at their own \`{slug}${getSitemapMenuSuffix()}\` subdomain.

## Key pages

- [Homepage](${origin}/): product overview, features, and free-plan signup.
- [Pricing](${origin}/pricing): Free / Pro / Custom plans, feature comparison, and payment methods.
- [About](${origin}/about): company background and product differentiators.
- [Knowledge Base](${origin}/knowledge-base): guides, comparisons, and how-tos about QR menus and restaurant ordering.
- [FAQ](${origin}/faq): common questions about the product, plans, and setup.
- [Mobile App](${origin}/mobile-app): the ENSmenu customer-facing mobile app.
- [Contact](${origin}/contact): support channels (phone, WhatsApp, email).

## Notes for crawlers

- Arabic is the default locale (no URL prefix); English is served under \`/en\`.
- Every customer also gets a dedicated public menu subdomain (e.g. \`{slug}.ensmenu.com\`) — these are separate businesses' menus, not ENSmenu's own marketing content.
- See [/sitemap](${origin}/sitemap) (Arabic) and [/en/sitemap](${origin}/en/sitemap) (English) for the full list of indexable URLs.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
