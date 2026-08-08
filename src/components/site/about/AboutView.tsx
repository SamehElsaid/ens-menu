import { getTranslations } from "next-intl/server";
import {
  FiActivity,
  FiAlertCircle,
  FiBell,
  FiCheck,
  FiClock,
  FiEdit3,
  FiFileText,
  FiHeart,
  FiImage,
  FiLayers,
  FiSmartphone,
  FiTrendingDown,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import { HiOutlineQrCode, HiOutlineSparkles } from "react-icons/hi2";
import {
  Badge,
  Card,
  Container,
  Eyebrow,
  Section,
  SectionHeading,
} from "@/components/site";
import { MARKETING_TRUST_FEATURE_IDS } from "@/lib/marketingTrustFeatureIds";
import { cn } from "@/lib/cn";

/**
 * About.
 *
 * A server component: the page is text and icons, and every reveal is a CSS
 * scroll timeline, so there is nothing to hydrate.
 *
 * The old page ran three near-identical card grids — "why", "what makes us
 * different" and a trust row — that restated the same six claims in three
 * shapes. This keeps the richest of them and lets the trust strip carry the
 * rest, so the page argues once instead of three times.
 */

const PROBLEMS = [
  { key: "paper", icon: FiFileText },
  { key: "prices", icon: FiTrendingDown },
  { key: "ordering", icon: FiClock },
  { key: "photos", icon: FiImage },
  { key: "updates", icon: FiEdit3 },
  { key: "waiter", icon: FiUsers },
  { key: "tracking", icon: FiActivity },
  { key: "branches", icon: FiLayers },
  { key: "outdated", icon: FiAlertCircle },
] as const;

const BENTO: {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  wide?: boolean;
}[] = [
  { key: "aiOrdering", icon: HiOutlineSparkles, wide: true },
  { key: "qrSystem", icon: HiOutlineQrCode },
  { key: "liveOrders", icon: FiBell },
  { key: "smartRecommendations", icon: HiOutlineSparkles, wide: true },
  { key: "fasterService", icon: FiZap },
  { key: "customerExperience", icon: FiHeart },
  { key: "mobileDashboard", icon: FiSmartphone, wide: true },
  { key: "restaurants", icon: FiUsers, wide: true },
];

export default async function AboutView() {
  const t = await getTranslations("Landing.aboutPage");
  const tSite = await getTranslations("site.about");
  const tTrust = await getTranslations("marketingTrustFeatures");

  return (
    <>
      {/* ----------------------------------------------------------------- Hero */}
      <Section
        size="lg"
        className="isolate -mt-(--s-header-h) pt-[calc(var(--s-header-h)+4rem)]"
      >
        <div aria-hidden className="s-aurora" />
        <Container>
          <div className="max-w-3xl">
            <Eyebrow>{tSite("eyebrow")}</Eyebrow>
            <h1 className="mt-5 text-site-h1">{tSite("title")}</h1>
            <p className="mt-6 max-w-2xl text-site-lead text-site-fg">
              {tSite("lead")}
            </p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {(["pill1", "pill2", "pill3", "pill4"] as const).map((key) => (
                <li key={key}>
                  <Badge tone="neutral">{t(`hero.${key}`)}</Badge>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* -------------------------------------------------------------- Purpose */}
      <Section tone="tint">
        <Container>
          <Eyebrow>{tSite("purposeEyebrow")}</Eyebrow>
          <div className="s-stagger mt-8 grid gap-5 md:grid-cols-2">
            <div className="s-on-ink s-reveal flex flex-col justify-between gap-8 rounded-site-card bg-site-brand-deep p-8 shadow-site-brand sm:p-10">
              <p className="text-site-xs font-semibold tracking-[0.08em] text-white/60 uppercase">
                {t("vision.label")}
              </p>
              <p className="font-site-display text-site-h3 font-bold text-white">
                {t("vision.text")}
              </p>
            </div>
            <Card className="s-reveal flex flex-col justify-between gap-8 p-8 sm:p-10">
              <p className="text-site-xs font-semibold tracking-[0.08em] text-site-brand uppercase">
                {t("mission.label")}
              </p>
              <p className="font-site-display text-site-h3 font-bold text-site-ink">
                {t("mission.text")}
              </p>
            </Card>
          </div>
          <p className="s-reveal mt-8 text-site-sm text-site-muted">
            {t("builtInEgypt")}
          </p>
        </Container>
      </Section>

      {/* -------------------------------------------------------------- Problem */}
      <Section>
        <Container>
          <SectionHeading
            align="start"
            eyebrow={t("problem.eyebrow")}
            title={
              <>
                {t("problem.title")}{" "}
                <span className="text-site-muted">
                  {t("problem.titleAccent")}
                </span>
              </>
            }
          />
          {/* A plain list rather than nine cards: these are symptoms the reader
              recognises, not features to be sold one box at a time. */}
          <dl className="s-stagger mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {PROBLEMS.map(({ key, icon: Icon }) => (
              <div key={key} className="s-reveal-soft flex gap-4">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-site-sm bg-site-tint text-site-muted">
                  <Icon className="size-[18px]" aria-hidden />
                </span>
                <div>
                  <dt className="text-site-h4 font-semibold text-site-ink">
                    {t(`problem.items.${key}.title`)}
                  </dt>
                  <dd className="mt-1.5 text-site-sm text-site-fg">
                    {t(`problem.items.${key}.hint`)}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      {/* --------------------------------------------------------- What we built */}
      <Section tone="tint">
        <Container>
          <SectionHeading
            eyebrow={t("why.eyebrow")}
            title={t("why.title")}
            lead={t("why.description")}
          />
          <div className="s-stagger mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BENTO.map(({ key, icon: Icon, wide }) => (
              <Card
                key={key}
                interactive
                className={cn(
                  "s-reveal flex flex-col gap-4 p-6",
                  wide && "lg:col-span-2",
                )}
              >
                <span className="flex size-10 items-center justify-center rounded-site-sm bg-site-brand-tint text-site-brand">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <h3 className="text-site-h4 font-semibold text-site-ink">
                    {t(`why.bento.${key}.title`)}
                  </h3>
                  <p className="mt-1.5 text-site-sm text-site-fg">
                    {t(`why.bento.${key}.hint`)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* ---------------------------------------------------------------- Trust */}
      <Section>
        <Container>
          <h2 className="text-center text-site-h2">{t("trust.title")}</h2>
          <ul className="mx-auto mt-10 grid max-w-4xl gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {MARKETING_TRUST_FEATURE_IDS.map((id) => (
              <li
                key={id}
                className="flex items-start gap-2.5 text-site-sm text-site-fg"
              >
                <FiCheck
                  className="mt-0.5 size-4 shrink-0 text-site-positive"
                  aria-hidden
                />
                {tTrust(`${id}.title`)}
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
