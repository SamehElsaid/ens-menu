import { getTranslations } from "next-intl/server";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = await getTranslations("Landing.header");

  return (
    <>
      {/*
        THESIS: the SaaS marketing page, played straight and built to Stripe's
        finish — one continuous reading column, one accent, real product
        surfaces instead of decoration. It refuses the sales-deck landing page
        that stacks unrelated claim cards until the scrollbar looks impressive.
        OWN-WORLD: warm-white ground with deep indigo-black bands, one indigo
        accent for every action and one amber note for hospitality, Alexandria
        display over Readex Pro body, 16px cards, layered low-opacity light.
        Its own token layer, scoped to `.public-world`, so the compact 13px
        product it sits beside is untouched.
        STORY: a venue owner learns in one viewport that the paper menu they
        already own becomes a live QR menu, sees it happen, and creates a free
        account.
        FIRST VIEWPORT: full-width aurora ground, headline left at display
        scale with the primary action directly beneath it, and the product's
        real guest menu on a phone at the inline end, already scrolling.
        FORM: the category standard, played straight (canon; the roll's
        grounded candidate 6, Mashrabiya Screen, declined by the user); seed
        key 8de12cf2.
        FINISH: unreviewed and undocumented is unfinished; this build ends with
        the finish review, the verdict, and DESIGN.md
      */}
      <div className="public-world flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-100 focus:rounded-site-control focus:bg-site-brand focus:px-4 focus:py-2.5 focus:text-site-sm focus:font-semibold focus:text-white"
        >
          {t("skipToContent")}
        </a>
        <SiteHeader />
        {/* The header is fixed, so the document reserves its height here once
            rather than every page remembering to. A hero that wants to run
            under the transparent header pulls itself back up with
            `-mt-(--s-header-h)`. */}
        <main
          id="main"
          className="flex w-full flex-1 flex-col pt-(--s-header-h)"
        >
          {children}
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
