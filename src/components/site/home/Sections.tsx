"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  FiBarChart2,
  FiCheck,
  FiGlobe,
  FiGrid,
  FiPlus,
  FiSmartphone,
  FiTruck,
  FiUsers,
} from "react-icons/fi";
import { templatesInfo } from "@/modules/TemplateShow/data";
import {
  Accordion,
  Badge,
  Bento,
  BentoCell,
  Card,
  Col,
  Container,
  Grid,
  Section,
  SectionHeading,
} from "../index";
import { SiteButtonLink } from "../Button";

/**
 * The homepage argument, after the phone story has made its case.
 *
 * Motion hooks (`data-home-section`, `data-home=*`) are consumed by
 * `HomeMotion` — the tint wipe, the depth cascade on card grids, the showcase
 * frame opening, the plan comparison. CSS `s-reveal*` remains the progressive
 * path when GSAP never arrives.
 *
 * Chapter one (hero) lives in `Hero.tsx` and chapter two in `story/`.
 */

/** Shared by every side heading: stays put under the fixed header. */
const stickyHeading =
  "self-start lg:sticky lg:top-[calc(var(--s-header-h)+3rem)]";

/* -------------------------------------------------------------------------- */
/* 02 — Features                                                               */
/* -------------------------------------------------------------------------- */

const FEATURES = [
  { id: "qr", icon: FiGrid, span: 8 },
  { id: "tableOrders", icon: FiSmartphone, span: 4 },
  { id: "delivery", icon: FiTruck, span: 4 },
  { id: "analytics", icon: FiBarChart2, span: 4 },
  { id: "staff", icon: FiUsers, span: 4 },
  { id: "bilingual", icon: FiGlobe, span: 12 },
] as const;

export function Features() {
  const t = useTranslations("site.features");

  return (
    <Section id="features" tone="default" data-home-section="features">
      {/* The tint is a layer, not the section's background, so the band can
          arrive as a wipe from the seam above it instead of as a hard edge.
          Untransformed — which is what a no-JS visitor gets — it is exactly the
          `tone="tint"` band it replaces. */}
      <span
        aria-hidden
        data-home="wipe"
        className="absolute inset-0 -z-10 origin-top bg-site-tint"
      />
      <Container>
        <div data-home="section-heading">
          <SectionHeading
            index={2}
            eyebrow={t("eyebrow")}
            title={t("title")}
            lead={t("lead")}
            className="max-w-3xl"
          />
        </div>

        <Bento className="s-stagger mt-14">
          {FEATURES.map(({ id, icon: Icon, span }, index) => {
            const head = (
              <span className="flex size-11 items-center justify-center rounded-site-control border border-site-brand-line bg-site-brand-tint text-site-brand-text">
                <Icon className="size-5" aria-hidden />
              </span>
            );

            if (span === 12) {
              return (
                <BentoCell key={id} span={span}>
                  <Card
                    interactive
                    data-home="card"
                    className="s-reveal s-depth-card flex h-full flex-col gap-5 p-7 sm:flex-row sm:items-center sm:gap-12"
                  >
                    <div className="sm:w-2/5">
                      {head}
                      <h3 className="mt-5 text-site-h3">{t(`${id}.title`)}</h3>
                    </div>
                    <p className="text-site-body text-site-fg sm:flex-1">
                      {t(`${id}.body`)}
                    </p>
                  </Card>
                </BentoCell>
              );
            }

            const lead = index === 0;
            return (
              <BentoCell key={id} span={span}>
                <Card
                  interactive
                  data-home="card"
                  className="s-reveal s-depth-card flex h-full flex-col p-7"
                >
                  {head}
                  <div className={lead ? "mt-auto pt-12" : "mt-5"}>
                    <h3 className={lead ? "text-site-h2" : "text-site-h3"}>
                      {t(`${id}.title`)}
                    </h3>
                    <p
                      className={
                        lead
                          ? "mt-3 max-w-md text-site-lead text-site-fg"
                          : "mt-2.5 text-site-body text-site-fg"
                      }
                    >
                      {t(`${id}.body`)}
                    </p>
                  </div>
                </Card>
              </BentoCell>
            );
          })}
        </Bento>
      </Container>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* 03 — Templates showcase                                                     */
/* -------------------------------------------------------------------------- */

export function Showcase() {
  const t = useTranslations("site.showcase");
  const locale = useLocale();
  const isAr = locale === "ar";

  const templates = templatesInfo
    .filter((tpl) => !tpl.hidePreviewImage && !tpl.isUnderConstruction)
    .slice(0, 5);

  if (templates.length === 0) return null;

  return (
    <Section tone="default" data-home-section="showcase">
      <Container>
        <div data-home="section-heading">
          <SectionHeading
            index={3}
            eyebrow={t("eyebrow")}
            title={t("title")}
            lead={t("lead")}
            className="max-w-3xl"
          />
        </div>

        <Bento className="s-stagger mt-14" as="ul">
          {templates.map((tpl, index) => {
            const lead = index === 0;
            return (
              <BentoCell key={tpl.id} span={lead ? 8 : 4} as="li">
                <Card
                  interactive
                  data-home="card"
                  className="s-reveal s-depth-card group flex h-full flex-col overflow-hidden p-0"
                >
                  <div
                    data-home="media"
                    className={`relative overflow-hidden bg-site-tint ${
                      lead ? "aspect-16/9" : "min-h-44 flex-1"
                    }`}
                  >
                    {/* Two owners, two elements: the scroll parallax is written
                        to this wrapper and the hover breathe stays on the image
                        itself, so a GSAP transform and a CSS transition never
                        land on the same property. */}
                    <div data-home="media-inner" className="absolute inset-0">
                      <Image
                        src={tpl.image}
                        alt={t("previewAlt", {
                          name: isAr ? tpl.nameAr : tpl.name,
                        })}
                        fill
                        loading="lazy"
                        sizes={
                          lead
                            ? "(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 46rem"
                            : "(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 22rem"
                        }
                        className="s-media-breathe object-cover object-top will-change-transform"
                      />
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-4 border-t border-site-line p-5">
                    <div className="min-w-0">
                      <h3 className={lead ? "text-site-h3" : "text-site-h4"}>
                        {isAr ? tpl.nameAr : tpl.name}
                      </h3>
                      <p className="mt-2 text-site-sm text-site-fg">
                        {isAr ? tpl.descriptionAr : tpl.description}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <Badge tone={tpl.isFree ? "positive" : "brand"}>
                        {tpl.isFree ? t("freeBadge") : t("proBadge")}
                      </Badge>
                      {tpl.isNew ? (
                        <Badge tone="neutral">{t("newBadge")}</Badge>
                      ) : null}
                    </div>
                  </div>
                </Card>
              </BentoCell>
            );
          })}
        </Bento>

        <div className="mt-10" data-home="showcase-cta">
          <SiteButtonLink href="/auth/register" variant="secondary" size="md">
            {t("cta")}
          </SiteButtonLink>
        </div>
      </Container>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* 04 — Plans                                                                  */
/* -------------------------------------------------------------------------- */

const FREE_ITEMS = ["menu", "qr", "items", "bilingual"] as const;
const PRO_ITEMS = [
  "tables",
  "orders",
  "delivery",
  "staff",
  "analytics",
  "domain",
] as const;

export function Plans() {
  const t = useTranslations("site.plans");

  return (
    <Section tone="default" data-home-section="plans">
      <Container>
        <Grid className="gap-y-12">
          <Col span={4} className={stickyHeading}>
            <div data-home="section-heading">
              <SectionHeading
                index={4}
                eyebrow={t("eyebrow")}
                title={t("title")}
                lead={t("lead")}
              />
            </div>
          </Col>

          <Col span={8} start={5}>
            <div className="s-reveal grid gap-4 sm:grid-cols-2">
              <div
                data-home="plan-free"
                className="flex flex-col rounded-site-card border border-site-line bg-site-bg p-7 shadow-site-sm"
              >
                <h3 className="text-site-h3">{t("free.name")}</h3>
                <p className="mt-3 text-site-sm text-site-fg">
                  {t("free.body")}
                </p>
                <ul className="mt-6 flex-1 space-y-3 border-t border-site-line pt-6">
                  {FREE_ITEMS.map((key) => (
                    <li
                      key={key}
                      className="flex items-start gap-2.5 text-site-sm"
                    >
                      <FiCheck
                        className="mt-0.5 size-4 shrink-0 text-site-positive"
                        aria-hidden
                      />
                      {t(`free.items.${key}`)}
                    </li>
                  ))}
                </ul>
                <SiteButtonLink
                  href="/auth/register"
                  variant="secondary"
                  size="md"
                  block
                  className="mt-7"
                >
                  {t("free.cta")}
                </SiteButtonLink>
              </div>

              <div
                data-home="plan-pro"
                className="s-rake relative flex flex-col rounded-site-card border border-site-brand bg-site-brand-tint p-7 shadow-site-lg"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-site-h3">{t("pro.name")}</h3>
                  <Badge tone="brand">{t("pro.badge")}</Badge>
                </div>
                <p className="mt-3 text-site-sm text-site-fg">
                  {t("pro.body")}
                </p>
                <ul className="mt-6 flex-1 space-y-3 border-t border-site-brand-line pt-6">
                  {PRO_ITEMS.map((key) => (
                    <li
                      key={key}
                      className="flex items-start gap-2.5 text-site-sm"
                    >
                      <FiPlus
                        className="mt-0.5 size-4 shrink-0 text-site-brand-text"
                        aria-hidden
                      />
                      {t(`pro.items.${key}`)}
                    </li>
                  ))}
                </ul>
                <SiteButtonLink
                  href="/pricing"
                  size="md"
                  block
                  className="mt-7"
                >
                  {t("pro.cta")}
                </SiteButtonLink>
              </div>
            </div>
          </Col>
        </Grid>
      </Container>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* 05 — FAQ                                                                    */
/* -------------------------------------------------------------------------- */

const FAQ_KEYS = [
  "howLong",
  "needApp",
  "arabic",
  "existingMenu",
  "cost",
  "orders",
] as const;

export function HomeFaq() {
  const t = useTranslations("site.faq");

  return (
    <Section tone="default" data-home-section="faq">
      <Container>
        <Grid className="gap-y-10">
          <Col span={4} className={stickyHeading}>
            <div data-home="section-heading">
              <SectionHeading
                index={5}
                eyebrow={t("eyebrow")}
                title={t("title")}
                lead={t("lead")}
              >
                <p className="mt-2 text-site-sm text-site-muted">
                  {t("more")}{" "}
                  <Link
                    href="/faq"
                    className="font-semibold text-site-brand-text underline underline-offset-4 hover:text-site-brand-deep"
                  >
                    {t("moreLink")}
                  </Link>
                </p>
              </SectionHeading>
            </div>
          </Col>

          <Col span={7} start={6}>
            <div data-home="faq-panel">
              <Accordion
                name="home-faq"
                items={FAQ_KEYS.map((key) => ({
                  question: t(`${key}.q`),
                  answer: t(`${key}.a`),
                }))}
              />
            </div>
          </Col>
        </Grid>
      </Container>
    </Section>
  );
}
