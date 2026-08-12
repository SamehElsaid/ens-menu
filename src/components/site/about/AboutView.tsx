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
  Bento,
  BentoCell,
  Card,
  Col,
  Container,
  Grid,
  PageHeader,
  Section,
  SectionHeading,
  Ticket,
} from "@/components/site";
import { MARKETING_TRUST_FEATURE_IDS } from "@/lib/marketingTrustFeatureIds";

/**
 * About.
 *
 * A server component: the page is text and icons, and every reveal is a CSS
 * scroll timeline, so there is nothing to hydrate.
 *
 * The page makes one argument in three numbered movements — what we believe,
 * what is broken, what we built — and the structure states the order rather
 * than leaving the reader to infer it from three near-identical card grids.
 *
 * Two things carry the hierarchy, and neither is decoration:
 *   * The vision and mission are a matched pair, the gradient panel against
 *     the light one. Two unrelated floating cards would read as two claims;
 *     two halves of one shape read as one position stated from two sides.
 *   * The nine symptoms are a numbered ledger, not nine boxes. They are things
 *     the reader recognises in their own venue, and a ledger invites scanning
 *     for the one that stings — a grid of equal cards invites skipping all of
 *     them.
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

/**
 * `span` is the emphasis. AI ordering and the QR system take the widest cells
 * because they are what the product is; "restaurants" closes the grid across
 * the full width because it is the claim a venue owner checks last.
 */
const BENTO: {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  span: 4 | 6 | 8 | 12;
}[] = [
  { key: "aiOrdering", icon: HiOutlineSparkles, span: 8 },
  { key: "qrSystem", icon: HiOutlineQrCode, span: 4 },
  { key: "liveOrders", icon: FiBell, span: 4 },
  { key: "smartRecommendations", icon: HiOutlineSparkles, span: 4 },
  { key: "fasterService", icon: FiZap, span: 4 },
  { key: "customerExperience", icon: FiHeart, span: 6 },
  { key: "mobileDashboard", icon: FiSmartphone, span: 6 },
  { key: "restaurants", icon: FiUsers, span: 12 },
];

const stickyHeading =
  "self-start lg:sticky lg:top-[calc(var(--s-header-h)+3rem)]";

export default async function AboutView() {
  const t = await getTranslations("Landing.aboutPage");
  const tSite = await getTranslations("site.about");
  const tTrust = await getTranslations("marketingTrustFeatures");

  return (
    <>
      <PageHeader
        ticket={tSite("eyebrow")}
        title={tSite("title")}
        lead={tSite("lead")}
      >
        {/* Four claims, four surfaces. Stated as separate facts they read as
            terms; strung along one rule they read as a table of contents. */}
        <ul className="s-enter-group mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(["pill1", "pill2", "pill3", "pill4"] as const).map((key, index) => (
            <li
              key={key}
              className="s-ticket flex items-center gap-3 rounded-site-card border border-site-line bg-site-bg px-4 py-3.5 text-site-fg shadow-site-sm"
            >
              <span className="text-site-brand-text">
                {String(index + 1).padStart(2, "0")}
              </span>
              {t(`hero.${key}`)}
            </li>
          ))}
        </ul>
      </PageHeader>

      {/* ---------------------------------------------------------- 01 Purpose */}
      <Section tone="tint">
        <Container>
          <Ticket index={1}>{tSite("purposeEyebrow")}</Ticket>

          {/* Editorial spacing between the two halves: they are one position
              stated from two sides, and a wide beat between them makes the
              vision land first and the mission read as its consequence. */}
          <div className="s-stagger s-stagger-editorial mt-8 grid gap-4 md:grid-cols-2">
            {/* The vision takes the gradient — this page's one brand moment —
                and the mission sits beside it on paper. Two claims of equal
                length read as a pair; giving both the gradient would make
                neither of them the point. */}
            {/* The rake goes here and nowhere else on this page. It is spent on
                the vision because that is the page's argument at its highest
                point; the closing `CtaBand` therefore opts out of its own rake
                rather than the page quietly acquiring two. */}
            <div className="s-reveal s-rake s-on-ink s-grad flex flex-col justify-between gap-10 rounded-site-card p-8 text-white shadow-site-brand sm:p-10">
              <p className="s-ticket text-white/75">{t("vision.label")}</p>
              <p className="text-site-h3 font-bold text-white">
                {t("vision.text")}
              </p>
            </div>
            <div className="s-reveal flex flex-col justify-between gap-10 rounded-site-card border border-site-line bg-site-bg p-8 shadow-site-sm sm:p-10">
              <p className="s-ticket text-site-brand-text">
                {t("mission.label")}
              </p>
              <p className="text-site-h3 font-bold text-site-ink">
                {t("mission.text")}
              </p>
            </div>
          </div>

          <p className="s-reveal mt-6 text-site-sm text-site-muted">
            {t("builtInEgypt")}
          </p>
        </Container>
      </Section>

      {/* ---------------------------------------------------------- 02 Problem */}
      <Section>
        <Container>
          <Grid className="gap-y-12">
            <Col span={4} className={stickyHeading}>
              <SectionHeading
                index={2}
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
            </Col>

            <Col span={7} start={6}>
              {/* The page's signature, and it is an accumulation rather than a
                  transformation: nine things wrong with a paper menu arriving
                  one at a time, so the list builds into a weight that a wall of
                  nine visible rows does not. Tightened because nine is past the
                  point where the default step still reads as one gesture.

                  The blueprint pictured a drawn rule under each row; these are
                  bordered cards rather than a ruled list, so there is no rule to
                  draw and the stagger carries the effect alone. */}
              <dl className="s-stagger s-stagger-tight flex flex-col gap-3">
                {PROBLEMS.map(({ key, icon: Icon }) => (
                  <div
                    key={key}
                    className="s-reveal-soft flex gap-4 rounded-site-card border border-site-line bg-site-bg p-5 shadow-site-sm"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-site-control border border-site-brand-line bg-site-brand-tint text-site-brand-text">
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
            </Col>
          </Grid>
        </Container>
      </Section>

      {/* ----------------------------------------------------- 03 What we built */}
      <Section tone="tint">
        <Container>
          <SectionHeading
            index={3}
            eyebrow={t("why.eyebrow")}
            title={t("why.title")}
            lead={t("why.description")}
            className="max-w-3xl"
          />

          <Bento className="s-stagger mt-14" as="ul">
            {BENTO.map(({ key, icon: Icon, span }) => (
              <BentoCell key={key} span={span} as="li">
                <Card
                  interactive
                  className="s-reveal flex h-full flex-col p-7"
                  tone="default"
                >
                  <span className="flex size-11 items-center justify-center rounded-site-control border border-site-brand-line bg-site-brand-tint text-site-brand-text">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div className="mt-5">
                    <h3 className="text-site-h3">
                      {t(`why.bento.${key}.title`)}
                    </h3>
                    <p className="mt-2.5 text-site-body text-site-fg">
                      {t(`why.bento.${key}.hint`)}
                    </p>
                  </div>
                </Card>
              </BentoCell>
            ))}
          </Bento>
        </Container>
      </Section>

      {/* ------------------------------------------------------------ 04 Trust */}
      <Section>
        <Container>
          <Grid className="gap-y-10">
            <Col span={4} className={stickyHeading}>
              <SectionHeading index={4} title={t("trust.title")} />
            </Col>

            {/* Twelve short facts in two columns, each with a lit tick. Every
                item on this list is included, so the tick is the fact: what
                would be misleading is a mixed list where some are not. */}
            <Col span={7} start={6}>
              <ul className="s-stagger s-stagger-tight grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {MARKETING_TRUST_FEATURE_IDS.map((id) => (
                  <li
                    key={id}
                    className="s-reveal-soft flex items-start gap-2.5 text-site-sm text-site-fg"
                  >
                    {/* A tick that settles reads as a claim being confirmed
                        rather than a decoration that was already there. */}
                    <span
                      aria-hidden
                      className="s-tick mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-site-brand-tint text-site-brand-text"
                    >
                      <FiCheck className="size-3" />
                    </span>
                    {tTrust(`${id}.title`)}
                  </li>
                ))}
              </ul>
            </Col>
          </Grid>
        </Container>
      </Section>
    </>
  );
}
