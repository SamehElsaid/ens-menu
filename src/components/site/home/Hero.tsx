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
      {/* Cinematic light streak — GSAP owns opacity/travel on capable devices. */}
      <div aria-hidden data-home="streak" className="s-home-streak" />

      <Container className="pt-[calc(var(--s-header-h)+2.5rem)] pb-0 lg:pt-[calc(var(--s-header-h)+4.5rem)]">
        <Grid className="items-center gap-y-14">
          <Col span={7}>
            <div data-home="copy">
              <div data-home="eyebrow" className="s-enter-soft w-fit">
                <Pill>{t("eyebrow")}</Pill>
              </div>

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
            </div>
          </Col>

          <Col span={5}>
            <div
              data-home="proof"
              className="s-enter-still s-enter-d2 relative mx-auto w-full max-w-76 sm:w-120 sm:max-w-none lg:w-full"
              style={{ perspective: "1200px" }}
            >
              <div
                data-home="paper"
                className="absolute start-0 top-1/2 hidden w-50 -translate-y-1/2 backface-hidden sm:block lg:w-42"
              >
                <figure className="overflow-hidden rounded-site-card border border-site-line bg-[#f3ebe0] shadow-site">
                  <Image
                    src="/images/demo/paper-menu.jpg"
                    alt={t("paperAlt")}
                    width={520}
                    height={720}
                    sizes="12.5rem"
                    /* Keep the parchment menu in frame — the photo is mostly
                       dark wood around a centred sheet, and default cover crops
                       into the table and reads as a black card. */
                    className="aspect-3/4 w-full object-cover object-[50%_35%]"
                  />
                  <figcaption className="s-ticket border-t border-site-line bg-site-bg/95 px-3 py-2 text-site-muted">
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
                    data-home="pulse"
                    className="s-home-pulse size-1.5 rounded-full bg-site-brand"
                  />
                  {t("afterLabel")}
                </span>
                <div
                  data-home="phone-shell"
                  className="s-home-phone-shell relative"
                >
                  <span
                    aria-hidden
                    data-home="phone-glow"
                    className="s-home-phone-glow"
                  />
                  {/* The slot is the measurement the travelling phone flies to.
                      Its box is always reserved, so the swap costs no layout. */}
                  <div
                    data-story="hero-slot"
                    className="relative z-10 w-70 sm:w-76 lg:w-70"
                  >
                    <PhoneMenu priority className="w-full" />
                  </div>
                </div>
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
