"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { FiArrowLeft, FiArrowRight, FiCheck } from "react-icons/fi";
import { Magnetic } from "@/motion/Magnetic";
import { SiteButtonLink } from "../Button";
import { Col, Container, Grid, Pill } from "../primitives";
import PhoneMenu from "./PhoneMenu";
import PrismSlot from "./PrismSlot";

/**
 * First viewport — the cinematic opening of the home motion story.
 *
 * GSAP (`HomeMotion`) owns the entrance and the pinned paper→phone scrub on
 * capable desktops. Data attributes below are the choreography hooks; CSS
 * `s-enter*` remains as the no-JS / reduced-motion progressive path.
 */
export function Hero({ locale }: { locale: string }) {
  const t = useTranslations("site.hero");
  const isRtl = locale === "ar";
  const Arrow = isRtl ? FiArrowLeft : FiArrowRight;

  return (
    <section
      id="hero"
      data-home-section="hero"
      className="relative isolate -mt-(--s-header-h) overflow-hidden bg-site-ground"
    >
      <div aria-hidden className="s-aurora" />
      <PrismSlot locale={locale} />

      <Container className="pt-[calc(var(--s-header-h)+2.5rem)] pb-0 lg:pt-[calc(var(--s-header-h)+4.5rem)]">
        <Grid className="items-center gap-y-14">
          <Col span={7}>
            <div data-home="eyebrow" className="s-enter-soft w-fit">
              <Pill>{t("eyebrow")}</Pill>
            </div>

            {/* Title starts invisible under HomeMotion; without JS the CSS
                fallback keeps it painted for LCP (see public.css). */}
            <h1
              data-home="title"
              className="s-home-title mt-6 text-site-display"
            >
              {t("titleLead")}{" "}
              <span
                data-home="title-accent"
                className="s-grad-text whitespace-nowrap"
              >
                {t("titleAccent")}
              </span>
            </h1>

            <p
              data-home="lead"
              className="s-enter s-enter-d1 mt-7 max-w-xl text-site-lead text-site-fg"
            >
              {t("lead")}
            </p>

            <div
              data-home="ctas"
              className="s-enter s-enter-d1 mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
            >
              <Magnetic>
                <SiteButtonLink href="/auth/register" size="lg">
                  {t("primaryCta")}
                  <Arrow className="s-cta-arrow size-4" aria-hidden />
                </SiteButtonLink>
              </Magnetic>
              <SiteButtonLink
                href="/#how-it-works"
                variant="secondary"
                size="lg"
                prefetch={false}
              >
                {t("secondaryCta")}
              </SiteButtonLink>
            </div>
          </Col>

          <Col span={5}>
            <div
              data-home="proof"
              className="s-enter-still s-enter-d2 relative mx-auto w-full max-w-[19rem] sm:w-[30rem] sm:max-w-none lg:w-full"
            >
              <div
                data-home="paper"
                className="absolute start-0 top-1/2 hidden w-[12.5rem] -translate-y-1/2 sm:block lg:w-[10.5rem]"
              >
                <figure className="overflow-hidden rounded-site-card border border-site-line bg-site-bg shadow-site">
                  <Image
                    src="/images/demo/paper-menu.jpg"
                    alt={t("paperAlt")}
                    width={520}
                    height={720}
                    sizes="12.5rem"
                    className="aspect-3/4 w-full object-cover"
                  />
                  <figcaption className="s-ticket border-t border-site-line px-3 py-2 text-site-muted">
                    {t("beforeLabel")}
                  </figcaption>
                </figure>

                <span
                  data-home="badge"
                  aria-hidden
                  className="s-enter-badge s-enter-d3 absolute top-1/2 -me-4 end-0 z-20 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-site-brand text-white shadow-site-brand"
                >
                  <Arrow className="size-4" />
                </span>
              </div>

              <div
                data-home="phone"
                className="relative z-10 flex flex-col items-center sm:items-end"
                style={{ transformStyle: "preserve-3d" }}
              >
                <span
                  data-home="after-label"
                  className="s-ticket s-enter-soft s-enter-d2 mb-3 flex items-center gap-2 text-site-brand-text"
                >
                  <span
                    aria-hidden
                    className="size-1.5 rounded-full bg-site-brand"
                  />
                  {t("afterLabel")}
                </span>
                <PhoneMenu
                  priority
                  className="w-[17.5rem] sm:w-[19rem] lg:w-[17.5rem]"
                />
              </div>
            </div>
          </Col>
        </Grid>

        <ul className="s-stagger mt-14 grid gap-3 sm:grid-cols-3">
          {(["freePlan", "noGuestApp", "bilingual"] as const).map((key) => (
            <li
              key={key}
              data-home="assurance"
              className="s-reveal-soft s-depth-card flex items-center gap-3 rounded-site-card border border-site-line bg-site-bg/80 px-4 py-3.5 text-site-sm font-medium text-site-fg shadow-site-sm backdrop-blur-sm"
            >
              <span
                aria-hidden
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-site-brand-tint text-site-brand-text"
              >
                <FiCheck className="size-3.5" />
              </span>
              {t(`assurances.${key}`)}
            </li>
          ))}
        </ul>
      </Container>

      {/* Continuity seam into LogoStrip — the light's residue. */}
      <div aria-hidden className="s-home-seam" />
    </section>
  );
}

export default Hero;
