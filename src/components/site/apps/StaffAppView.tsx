import { getTranslations } from "next-intl/server";
import {
  FiBarChart2,
  FiBell,
  FiCheckCircle,
  FiClock,
  FiCoffee,
  FiGlobe,
  FiGrid,
  FiShoppingCart,
  FiZap,
} from "react-icons/fi";
import {
  Accordion,
  Bento,
  BentoCell,
  Card,
  Col,
  Container,
  Grid,
  Section,
  SectionHeading,
  Ticket,
  type FaqItem,
} from "@/components/site";
import {
  AppStoreSoon,
  GooglePlayButton,
  PhoneFrame,
} from "@/components/site/apps/StoreButtons";
import { AppPreviewVideo } from "@/components/site/apps/AppPreviewVideo";

const stickyHeading =
  "self-start lg:sticky lg:top-[calc(var(--s-header-h)+3rem)]";

/**
 * ENSMENU Staff — Android landing.
 *
 * The product ships a real screen recording, so the hero shows the app running
 * rather than a drawn mock-up. The remaining clips in `/public/app` are left
 * out on purpose: four more autoplaying videos would cost about 4.5MB to
 * demonstrate what four sentences already say.
 */

const STAFF_GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.ensmenu.ens_staff_app";

const FEATURE_ICONS = [
  FiZap,
  FiGrid,
  FiClock,
  FiCheckCircle,
  FiGlobe,
  FiBarChart2,
] as const;

const STEP_ICONS = [FiBell, FiShoppingCart, FiCoffee, FiBarChart2] as const;

type Feature = { title: string; desc: string };
type Step = { title: string; desc: string };

export default async function StaffAppView() {
  const t = await getTranslations("Landing.Hero");
  const tFeatures = await getTranslations("Landing.FeaturesApp");
  const tWorkflow = await getTranslations("Landing.WorkflowApp");
  const tFaq = await getTranslations("Landing.FaqApp");

  const features = tFeatures.raw("items") as Feature[];
  const steps = tWorkflow.raw("steps") as Step[];
  const faqItems = (tFaq.raw("items") as { q: string; a: string }[]).map(
    (item): FaqItem => ({ question: item.q, answer: item.a }),
  );

  return (
    <>
      {/* ----------------------------------------------------------------- Hero */}
      <section className="relative isolate -mt-(--s-header-h) border-b border-site-line bg-site-ground">
        <div aria-hidden className="s-aurora" />
        <Container className="pt-[calc(var(--s-header-h)+3rem)] pb-14 lg:pt-[calc(var(--s-header-h)+4rem)]">
          <Grid className="items-center gap-y-12">
            <Col span={7}>
              {/* Three stages, matching home's hero grammar so the site's two
                  hero pages read as the same product: mark and headline, then
                  the sentence and the buttons, then the device. */}
              <Ticket index={0} className="s-enter-soft">
                {t("badge")}
              </Ticket>
              <h1 className="s-enter-still mt-6 text-site-h1">
                {t("titleStart")}
                {/* The accent marks the phrase rather than recolouring it: a
                    purple heading spends the light on decoration, and the
                    direction keeps it for what can be acted on. It draws once
                    the heading has settled, so the emphasis lands while the
                    phrase is being read rather than before it exists. */}
                <span className="relative inline-block">
                  <span className="relative z-10">{t("titleHighlight")}</span>
                  <span
                    aria-hidden
                    className="s-enter-line absolute inset-x-0 bottom-[0.02em] z-0 h-[0.14em] bg-site-brand/70"
                  />
                </span>
              </h1>
              <p className="s-enter s-enter-d1 mt-7 max-w-xl text-site-lead text-site-fg">
                {t("description")}
              </p>

              <div className="s-enter s-enter-d1 mt-9 flex flex-wrap items-center gap-3">
                <GooglePlayButton
                  href={STAFF_GOOGLE_PLAY_URL}
                  kicker={t("getItOn")}
                  magnetic
                />
                <AppStoreSoon soonLabel={t("appleComingSoon")} />
              </div>
              {/* Punctuation on the offer, so it lands after the button it
                  qualifies. */}
              <p className="s-enter s-enter-d3 s-ticket mt-5 text-site-muted">
                {t("safeInstall")}
              </p>
            </Col>

            <Col span={4} start={9}>
              <div className="s-enter s-enter-d2 flex flex-col items-center lg:items-end">
                <span className="s-ticket mb-3 flex items-center gap-2 text-site-brand">
                  <span
                    aria-hidden
                    className="size-1.5 rounded-full bg-site-brand"
                  />
                  {t("features.liveAlerts")}
                </span>
                {/* `s-trail` on the frame, not on the column: the label above it
                    belongs to the page's plane, and lagging both would just move
                    a chunk of the layout. */}
                <PhoneFrame className="s-trail w-[16rem] sm:w-[17.5rem]">
                  {/* makeNewOrder.mp4 (~370KB) rather than order.mp4 (~2.3MB):
                      same phone UI, one sixth the weight, so the page stays
                      under a megabyte of transferred media. */}
                  <AppPreviewVideo
                    src="/app/makeNewOrder.mp4"
                    label={t("videoAlt")}
                    pauseLabel={t("videoPause")}
                    playLabel={t("videoPlay")}
                  />
                </PhoneFrame>
              </div>
            </Col>
          </Grid>

          {/* Three facts as a ruled rail. They were pills, which read as
              ornament; stated flatly they read as specification. */}
          <ul className="s-stagger s-stagger-editorial mt-14 grid border-t border-site-line sm:grid-cols-3">
            {(["liveAlerts", "tables", "staffOnly"] as const).map(
              (key, index) => (
                <li
                  key={key}
                  className="s-reveal-soft s-ticket flex items-center gap-3 border-b border-site-line py-4 text-site-fg sm:border-b-0 sm:py-5 sm:not-first:border-s sm:not-first:ps-6"
                >
                  <span className="text-site-brand">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {t(`features.${key}`)}
                </li>
              ),
            )}
          </ul>
        </Container>
      </section>

      {/* ---------------------------------------------------------- 01 Features */}
      <Section tone="tint">
        <Container>
          <SectionHeading
            index={1}
            title={tFeatures("title")}
            lead={tFeatures("subtitle")}
            className="max-w-3xl"
          />
          {/* Bento: the first claim takes two thirds of the opening row, so the
              six features have a reading order instead of six equal weights. */}
          <Bento className="s-stagger mt-14" as="ul">
            {features.map((feature, index) => {
              const Icon = FEATURE_ICONS[index] ?? FiZap;
              const lead = index === 0;
              return (
                <BentoCell key={feature.title} span={lead ? 8 : 4} as="li">
                  <Card
                    interactive
                    className="s-reveal flex h-full flex-col p-7"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <Icon className="size-6 text-site-ink" aria-hidden />
                      <Ticket>{String(index + 1).padStart(2, "0")}</Ticket>
                    </div>
                    <div className={lead ? "mt-auto pt-10" : "mt-5"}>
                      <h3 className={lead ? "text-site-h2" : "text-site-h3"}>
                        {feature.title}
                      </h3>
                      <p
                        className={
                          lead
                            ? "mt-3 max-w-md text-site-lead text-site-fg"
                            : "mt-2.5 text-site-body text-site-fg"
                        }
                      >
                        {feature.desc}
                      </p>
                    </div>
                  </Card>
                </BentoCell>
              );
            })}
          </Bento>
        </Container>
      </Section>

      {/* ---------------------------------------------------------- 02 Workflow */}
      <Section>
        <Container>
          <Grid className="gap-y-12">
            <Col span={4} className={stickyHeading}>
              <SectionHeading
                index={2}
                title={tWorkflow("title")}
                lead={tWorkflow("subtitle")}
              />
            </Col>

            {/* A ledger, not four circles on a connecting line. This is an
                ordered sequence read once, top to bottom, and the old row lost
                its order entirely when it reflowed to a 2×2 grid. */}
            <Col span={7} start={6}>
              <ol className="s-stagger">
                {steps.map((step, index) => {
                  const Icon = STEP_ICONS[index] ?? FiBell;
                  return (
                    <li
                      key={step.title}
                      /* Ruled below rather than above, with the same three rules
                         in the same places, so the separators can be `s-rule-row`
                         — which draws each one as its row arrives instead of
                         having four rules already sitting there. */
                      className="s-reveal s-rule-row grid grid-cols-[2.5rem_1fr] gap-x-5 border-b border-site-line py-7 first:pt-0 last:border-b-0 sm:grid-cols-[4rem_1fr] sm:gap-x-8"
                    >
                      <span className="font-site-mono text-site-h3 leading-none font-semibold text-site-brand tabular-nums">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="flex items-center gap-2.5 text-site-h3">
                          <Icon
                            className="s-step-mark size-[1.1em] shrink-0 text-site-muted"
                            aria-hidden
                          />
                          {step.title}
                        </h3>
                        <p className="mt-2.5 max-w-prose text-site-body text-site-fg">
                          {step.desc}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Col>
          </Grid>
        </Container>
      </Section>

      {/* --------------------------------------------------------------- 03 FAQ */}
      <Section tone="tint">
        <Container>
          <Grid className="gap-y-10">
            <Col span={4} className={stickyHeading}>
              <SectionHeading
                index={3}
                title={tFaq("title")}
                lead={tFaq("subtitle")}
              />
            </Col>
            <Col span={7} start={6}>
              <div className="s-reveal">
                <Accordion items={faqItems} name="app-faq" />
              </div>
            </Col>
          </Grid>
        </Container>
      </Section>
    </>
  );
}
