import { getLocale, getTranslations } from "next-intl/server";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { cn } from "@/lib/cn";
import { Magnetic } from "@/motion/Magnetic";
import { Col, Container, Grid } from "./primitives";
import { SiteButtonLink } from "./Button";

/**
 * The closing action, shared by every public page.
 *
 * One band, one destination: create a free account. It is a server component
 * because it holds no state.
 *
 * This is the page's gradient moment — the one band that gets the brand at full
 * strength, placed where the visitor is being asked to act. Everything above it
 * spends the brand in small amounts precisely so this band lands.
 *
 * The layout is split rather than centred: argument on the reading side, actions
 * on the far side. A centred CTA gives the eye no reason to travel to the
 * button, and the split lets the title run at display scale without colliding
 * with the controls.
 */
export async function CtaBand({
  title,
  body,
  rake = true,
  homeMotion = false,
}: {
  title?: string;
  body?: string;
  /**
   * One raking pass of light per page (MOTION-BLUEPRINT.md §9.1). The band
   * claims it by default because it is usually the page's only gradient. Pages
   * that already spend their rake earlier — `/about` on its vision card — opt
   * out here rather than the band quietly becoming a second one.
   */
  rake?: boolean;
  /** Home-only motion hooks for `HomeMotion` — other pages leave this off. */
  homeMotion?: boolean;
}) {
  const t = await getTranslations("site.cta");
  /* Choosing the glyph beats rotating it: the hover nudge translates, and a
     translate composed onto a 180° rotation travels the wrong way. */
  const Arrow = (await getLocale()) === "ar" ? FiArrowLeft : FiArrowRight;

  return (
    /* `s-rake` sends one pass of light across the band as it enters. It gives
       the page's last frame presence without a second gradient — it *is* the
       gradient — and without any motion that delays the button. On an ink band
       the sweep is white: a purple sheen over a purple fill is invisible. */
    <section
      data-home-section={homeMotion ? "cta" : undefined}
      data-home={homeMotion ? "cta-band" : undefined}
      className={cn(
        "s-on-ink s-grad relative isolate overflow-hidden py-(--s-section-y) text-white",
        rake && "s-rake",
      )}
    >
      <div aria-hidden className="s-bloom opacity-45" />

      <Container className="relative">
        <Grid className="items-end gap-y-10">
          <Col span={7}>
            <h2 className="max-w-2xl text-site-h1">{title ?? t("title")}</h2>
            <p className="mt-5 max-w-xl text-site-lead text-white/80">
              {body ?? t("body")}
            </p>
          </Col>

          <Col span={4} start={9}>
            <div
              data-home={homeMotion ? "cta-actions" : undefined}
              className="flex flex-col items-stretch gap-3"
            >
              {homeMotion ? (
                <Magnetic>
                  <SiteButtonLink
                    href="/auth/register"
                    variant="inverse"
                    size="lg"
                  >
                    {t("primary")}
                    <Arrow className="s-cta-arrow size-4" aria-hidden />
                  </SiteButtonLink>
                </Magnetic>
              ) : (
                <SiteButtonLink
                  href="/auth/register"
                  variant="inverse"
                  size="lg"
                >
                  {t("primary")}
                  <Arrow className="s-cta-arrow size-4" aria-hidden />
                </SiteButtonLink>
              )}
              <SiteButtonLink
                href="/contact"
                variant="inverseGhost"
                size="lg"
                prefetch={false}
              >
                {t("secondary")}
              </SiteButtonLink>
            </div>
            <p className="s-ticket mt-5 text-white/70">{t("note")}</p>
          </Col>
        </Grid>
      </Container>
    </section>
  );
}

export default CtaBand;
