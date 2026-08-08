import { getTranslations } from "next-intl/server";
import { FiArrowRight } from "react-icons/fi";
import { Container } from "./primitives";
import { SiteButtonLink } from "./Button";

/**
 * The closing action, shared by every public page.
 *
 * One band, one destination: create a free account. It is indigo rather than
 * near-black so it stays distinct from the footer that follows it, and it is a
 * server component because it holds no state.
 */
export async function CtaBand({
  title,
  body,
}: {
  title?: string;
  body?: string;
}) {
  const t = await getTranslations("site.cta");

  return (
    <section className="s-on-ink relative isolate overflow-hidden bg-site-brand-deep py-[var(--s-section-y)] text-white">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,rgba(255,255,255,0.22),transparent_70%)]"
      />
      <div aria-hidden className="s-grid-lines opacity-50" />

      <Container className="relative text-center">
        <h2 className="mx-auto max-w-2xl text-site-h2">
          {title ?? t("title")}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-site-lead text-white/75">
          {body ?? t("body")}
        </p>
        <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <SiteButtonLink href="/auth/register" variant="inverse" size="lg">
            {t("primary")}
            <FiArrowRight className="size-4 rtl:rotate-180" aria-hidden />
          </SiteButtonLink>
          <SiteButtonLink
            href="/contact"
            variant="inverseGhost"
            size="lg"
            prefetch={false}
          >
            {t("secondary")}
          </SiteButtonLink>
        </div>
        <p className="mt-6 text-site-xs text-white/55">{t("note")}</p>
      </Container>
    </section>
  );
}

export default CtaBand;
