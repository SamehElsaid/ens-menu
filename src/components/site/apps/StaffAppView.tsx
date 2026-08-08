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
  Badge,
  Card,
  Container,
  Eyebrow,
  Section,
  SectionHeading,
  type FaqItem,
} from "@/components/site";
import {
  AppStoreSoon,
  GooglePlayButton,
  PhoneFrame,
} from "@/components/site/apps/StoreButtons";

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
      <Section
        size="lg"
        className="isolate -mt-(--s-header-h) pt-[calc(var(--s-header-h)+3.5rem)]"
      >
        <div aria-hidden className="s-aurora" />
        <Container>
          <div className="grid items-center gap-14 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <Eyebrow>{t("badge")}</Eyebrow>
              <h1 className="mt-5 text-site-h1">
                {t("titleStart")}
                <span className="text-site-brand">{t("titleHighlight")}</span>
              </h1>
              <p className="mt-6 text-site-lead text-site-fg">
                {t("description")}
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <GooglePlayButton
                  href={STAFF_GOOGLE_PLAY_URL}
                  kicker={t("getItOn")}
                />
                <AppStoreSoon soonLabel={t("appleComingSoon")} />
              </div>
              <p className="mt-4 text-site-xs text-site-muted">
                {t("safeInstall")}
              </p>

              <ul className="mt-8 flex flex-wrap gap-2">
                {(["liveAlerts", "tables", "staffOnly"] as const).map((key) => (
                  <li key={key}>
                    <Badge tone="neutral">{t(`features.${key}`)}</Badge>
                  </li>
                ))}
              </ul>
            </div>

            <PhoneFrame className="mx-auto w-[16rem] sm:w-[17.5rem] lg:mx-0">
              {/* makeNewOrder.mp4 (~370KB) rather than order.mp4 (~2.3MB): same
                  phone UI, one sixth the weight, so the page stays under a
                  megabyte of transferred media. */}
              <video
                src="/app/makeNewOrder.mp4"
                className="size-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                aria-label={t("videoAlt")}
              />
            </PhoneFrame>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------- Features */}
      <Section tone="tint">
        <Container>
          <SectionHeading
            title={tFeatures("title")}
            lead={tFeatures("subtitle")}
          />
          <div className="s-stagger mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = FEATURE_ICONS[index] ?? FiZap;
              return (
                <Card
                  key={feature.title}
                  interactive
                  className="s-reveal flex flex-col gap-4 p-6"
                >
                  <span className="flex size-10 items-center justify-center rounded-site-sm bg-site-brand-tint text-site-brand">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-site-h4 font-semibold text-site-ink">
                      {feature.title}
                    </h3>
                    <p className="mt-1.5 text-site-sm text-site-fg">
                      {feature.desc}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------- Workflow */}
      <Section>
        <Container>
          <SectionHeading
            title={tWorkflow("title")}
            lead={tWorkflow("subtitle")}
          />
          {/* A hairline joins each marker to the next on wide screens, so the
              four steps read as one sequence rather than four unrelated
              claims. Drawn per step and stopped at the last one, so the line
              never runs off into empty space. */}
          <ol className="s-stagger mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {steps.map((step, index) => {
              const Icon = STEP_ICONS[index] ?? FiBell;
              return (
                <li key={step.title} className="s-reveal relative">
                  {index < steps.length - 1 ? (
                    <span
                      aria-hidden
                      className="absolute top-6 -end-8 start-14 hidden h-px bg-site-line lg:block"
                    />
                  ) : null}
                  <span className="flex size-12 items-center justify-center rounded-full border border-site-brand-line bg-site-bg text-site-brand">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <p className="mt-5 text-site-xs font-semibold tracking-[0.08em] text-site-muted uppercase tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-1.5 text-site-h4 font-semibold text-site-ink">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-site-sm text-site-fg">
                    {step.desc}
                  </p>
                </li>
              );
            })}
          </ol>
        </Container>
      </Section>

      {/* ------------------------------------------------------------------ FAQ */}
      <Section tone="tint">
        <Container width="narrow">
          <SectionHeading title={tFaq("title")} lead={tFaq("subtitle")} />
          <div className="s-reveal mt-10">
            <Accordion items={faqItems} />
          </div>
        </Container>
      </Section>
    </>
  );
}
