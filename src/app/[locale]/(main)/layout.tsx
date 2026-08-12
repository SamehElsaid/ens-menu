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
        The public world — see DESIGN.md §2. Tinted white ground with
        deep-violet inversion bands, a 12-column grid that is never drawn but
        that content is placed asymmetrically against, purple as the single hue,
        and the soft lift on hover. Its token layer is scoped to
        `.public-world`, so the compact 13px product it sits beside is untouched
        by anything a marketing change does here.
      */}
      <div className="public-world flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-100 focus:rounded-site-control focus:bg-site-action focus:px-4 focus:py-2.5 focus:text-site-sm focus:font-semibold focus:text-site-action-fg"
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
