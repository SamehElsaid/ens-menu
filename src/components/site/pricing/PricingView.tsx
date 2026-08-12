"use client";

import { Fragment, useState, type CSSProperties } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { FiCheck, FiMessageCircle, FiMinus, FiShield } from "react-icons/fi";
import {
  Accordion,
  Badge,
  Col,
  Container,
  Grid,
  PageHeader,
  Section,
  SectionHeading,
  Ticket,
} from "@/components/site";
import { SiteAnchorButton, SiteButtonLink } from "@/components/site/Button";
import {
  BillingSwitch,
  formatEgpPrice,
  PriceBlock,
  PriceFigure,
  type BillingCycle,
} from "@/components/site/pricing/PriceBlock";
import { Magnetic } from "@/motion/Magnetic";
import type {
  CellVal,
  ComparisonRow,
  PlanId,
} from "@/components/Pricing/pricingComparisonTypes";
import { useStuck } from "@/components/site/pricing/useStuck";
import { usePlans } from "@/hooks/usePlans";
import { buildPricingComparisonRows } from "@/lib/pricingComparison";
import useSubscriptionUpgradeHref from "@/hooks/useSubscriptionUpgradeHref";
import { ENSMENU_WHATSAPP_URL } from "@/lib/contactConstants";
import { cn } from "@/lib/cn";

/** Fallbacks for the first paint, before `usePlans` resolves the live figures. */
const STATIC_PRO_MONTHLY_EGP = 499;
const STATIC_PRO_YEARLY_EGP = 5988;

const PAYMENT_METHODS = [
  { id: "visa", src: "/payment/VISA-logo-768x432.png", w: 160, h: 90 },
  { id: "vodafoneCash", src: "/payment/clipart1517832.png", w: 96, h: 96 },
  { id: "orangeMoney", src: "/payment/Orange_Money_29.webp", w: 140, h: 48 },
  { id: "etisalatCash", src: "/payment/etisalat-logo.svg", w: 120, h: 40 },
] as const;

const MOBILE_PLANS = ["free", "pro", "custom"] as const;

/**
 * A `box-shadow` on each sticky cell rather than one on the header row: a `<tr>`
 * with `border-collapse` has no box of its own to cast a shadow from, so the row
 * is the cells or it is nothing.
 */
const stuckHeaderCell =
  "transition-shadow duration-(--dur-settle) ease-(--ease-settle) " +
  "group-data-[stuck]/table:shadow-[0_1px_0_var(--s-line-strong),0_6px_16px_-8px_rgb(0_0_0_/_0.18)]";

/** Section headings are keyed to the row that opens each group. */
const SECTION_STARTS: { startId: string; titleKey: string }[] = [
  { startId: "rowBillingCycle", titleKey: "sectionCoreFeatures" },
  { startId: "rowAiMenuImport", titleKey: "sectionAiFeatures" },
  { startId: "rowTableOrderingQr", titleKey: "sectionLiveOrdering" },
  { startId: "rowDesign", titleKey: "sectionPremiumFeatures" },
  {
    startId: "customFeature.waiterRequest",
    titleKey: "sectionAdvancedBusiness",
  },
];

/* -------------------------------------------------------------------------- */

/**
 * One plan.
 *
 * `grid-rows-subgrid` is what keeps three cards comparable now that they no
 * longer share edges: name, price, list and action land on the same four
 * baselines across all three, so the eye can cross the gap without
 * re-measuring.
 *
 * Pro is marked by a brand border, a faint brand ground and one step up the
 * elevation ladder — all three survive dark mode, forced colours and a
 * reduced-transparency pass, which a floating "recommended" ribbon does not.
 */
function PlanColumn({
  featured,
  children,
}: {
  featured?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "s-reveal relative flex flex-col rounded-site-card border p-7 lg:row-span-5 lg:grid lg:grid-rows-subgrid",
        /* One raking pass as the recommended column arrives, and this is the
           page's only one — the closing band gives its up, since a rake on both
           would make neither of them the point. */
        featured && "s-rake",
        featured
          ? "border-site-brand bg-site-brand-tint shadow-site-lg"
          : "border-site-line bg-site-bg shadow-site-sm",
      )}
    >
      {children}
    </div>
  );
}

function Cell({ value, yes, no }: { value: CellVal; yes: string; no: string }) {
  if (typeof value === "boolean") {
    return (
      <span className="inline-flex items-center justify-center">
        {value ? (
          <FiCheck
            className="size-[18px] text-site-positive stroke-[2.5]"
            aria-hidden
          />
        ) : (
          <FiMinus className="size-4 text-site-muted/60" aria-hidden />
        )}
        <span className="sr-only">{value ? yes : no}</span>
      </span>
    );
  }
  /* Values in this table are counts, limits and short phrases. Mono keeps the
     numeric ones aligned down the column, which is the only way a limit like
     "3" and a limit like "10" can be compared at a glance. */
  return (
    <span className="font-site-mono text-site-sm text-site-fg tabular-nums">
      {value}
    </span>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Mobile comparison. A four-column table at 390px is unreadable, so the visitor
 * picks one plan and reads that plan's column as a list. Same data, same
 * grouping, one column at a time.
 */
function MobileComparison({
  rows,
  yes,
  no,
  label,
  planLabels,
  sectionTitleFor,
}: {
  rows: ComparisonRow[];
  yes: string;
  no: string;
  /** Names the tab list for a screen reader — the section's own heading. */
  label: string;
  planLabels: Record<PlanId, string>;
  sectionTitleFor: (rowId: string) => string | undefined;
}) {
  const [plan, setPlan] = useState<PlanId>("pro");

  const move = (offset: number) =>
    setPlan(
      MOBILE_PLANS[
        (MOBILE_PLANS.indexOf(plan) + offset + MOBILE_PLANS.length) %
          MOBILE_PLANS.length
      ],
    );

  return (
    <div className="md:hidden">
      {/* A pill segmented control, the selected segment in brand. The plan tabs
          are sticky: this list is ~40 rows long, and a visitor deep in "advanced
          business" has no way back to the switch otherwise.

          Real tabs, with arrow keys and a single tab stop — the list below is
          genuinely the panel for the selected tab, so saying so costs nothing and
          makes the control operable without a pointer. */}
      <div className="sticky top-(--s-header-h) z-10 -mx-(--s-gutter) bg-site-tint px-(--s-gutter) py-3">
        <div
          role="tablist"
          aria-label={label}
          onKeyDown={(event) => {
            const rtl =
              getComputedStyle(event.currentTarget).direction === "rtl";
            if (event.key === "ArrowRight") move(rtl ? -1 : 1);
            else if (event.key === "ArrowLeft") move(rtl ? 1 : -1);
            else return;
            event.preventDefault();
          }}
          /* Equal tracks, so the brand fill below can be slid by whole segments
             in CSS instead of measured per tab. Three plan names of three
             different lengths would otherwise be three different widths. */
          className="relative isolate grid grid-cols-3 gap-1"
        >
          {/* The fill travels to the chosen plan rather than appearing there, so
              at this width — where the tabs are the only thing that says which
              column is being read — the eye follows the change. */}
          <span
            aria-hidden
            className="s-seg-pill rounded-full bg-site-brand shadow-site-brand"
            style={
              {
                "--s-seg-count": MOBILE_PLANS.length,
                "--s-seg-index": MOBILE_PLANS.indexOf(plan),
                "--s-seg-gap": "0.25rem",
              } as CSSProperties
            }
          />
          {MOBILE_PLANS.map((id) => {
            const selected = plan === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={`plan-tab-${id}`}
                aria-selected={selected}
                aria-controls="plan-comparison-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setPlan(id)}
                className={cn(
                  "s-ticket relative z-10 rounded-full border px-3 py-2.5",
                  "transition-[color,border-color,transform] duration-(--dur-tint) ease-(--ease-settle)",
                  "motion-safe:active:scale-[0.98]",
                  selected
                    ? "border-transparent text-white"
                    : "border-site-line bg-site-bg text-site-fg",
                )}
              >
                {planLabels[id]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Keyed on the plan, so the whole list crossfades rather than forty rows
          each announcing themselves. What changed is the meaning of every value
          at once, and a stagger here would take longer to finish than the list
          takes to read.

          Deliberately CSS: `.s-phase-swap` is `@starting-style` plus one opacity
          transition, and it is indistinguishable from the same thing done in
          JavaScript. Motion is spent on the two effects that need it. */}
      <dl
        key={plan}
        id="plan-comparison-panel"
        role="tabpanel"
        aria-labelledby={`plan-tab-${plan}`}
        className="s-phase-swap mt-4"
      >
        {rows.map((row) => {
          const sectionTitle = sectionTitleFor(row.id);
          return (
            <Fragment key={row.id}>
              {sectionTitle ? (
                <p className="s-ticket mt-8 rounded-site-sm bg-site-brand-tint px-3 py-2 text-site-brand-deep">
                  {sectionTitle}
                </p>
              ) : null}
              <div className="flex items-start justify-between gap-5 border-b border-site-line py-3">
                <dt className="min-w-0 flex-1 text-site-sm text-site-ink">
                  {row.label}
                </dt>
                <dd className="min-w-0 text-end">
                  <Cell value={row[plan]} yes={yes} no={no} />
                </dd>
              </div>
            </Fragment>
          );
        })}
      </dl>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export default function PricingView() {
  const t = useTranslations("PricingPage");
  const tSite = useTranslations("site.pricing");
  const tLanding = useTranslations("Landing.pricing");
  const tProfile = useTranslations("personalProfile");

  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const { proPlan, freePlan, customDisplay } = usePlans();
  const upgradeHref = useSubscriptionUpgradeHref();
  const { sentinelRef, stuck } = useStuck("var(--s-header-h)");

  const rows = buildPricingComparisonRows({
    t,
    tLanding,
    freePlan: freePlan
      ? {
          maxMenus: freePlan.maxMenus,
          allowCustomDomain: freePlan.allowCustomDomain,
          capabilities: freePlan.capabilities,
        }
      : null,
    proPlan: proPlan
      ? {
          maxMenus: proPlan.maxMenus,
          allowCustomDomain: proPlan.allowCustomDomain,
          capabilities: proPlan.capabilities,
        }
      : null,
    customDisplay,
  });

  const sectionTitleById = new Map(
    SECTION_STARTS.map(({ startId, titleKey }) => [startId, t(titleKey)]),
  );

  const yes = t("yes");
  const no = t("no");

  const planLabels: Record<PlanId, string> = {
    free: tLanding("planFree"),
    pro: t("planProName"),
    custom: tLanding("planCustom"),
  };

  /* The card bullets are pulled from the same comparison rows the table uses,
     so the summary can never drift from the detail. */
  const highlightIds = [
    "rowMenus",
    "rowSmartQr",
    "rowAiMenuImport",
    "rowTableOrderingQr",
    "rowStaffTables",
    "rowMultiLanguage",
    "rowSupport",
  ];
  const highlights = (plan: PlanId) =>
    highlightIds
      .map((id) => rows.find((row) => row.id === id))
      .filter((row): row is ComparisonRow => Boolean(row))
      .map((row) => ({
        label: row.label,
        value: row[plan],
      }));

  /* One line per claim, in the same order in every plan: the same seven claims
     appear in all three cards, so they have to land on the same seven lines or
     the cards cannot be read across. */
  const bulletList = (plan: PlanId) => (
    <ul className="mt-7 flex-1 space-y-2.5">
      {highlights(plan).map(({ label, value }) => {
        const included = value !== false;
        return (
          <li
            key={label}
            className={cn(
              "flex items-start gap-2.5 text-site-sm",
              included ? "text-site-fg" : "text-site-muted",
            )}
          >
            {included ? (
              <FiCheck
                className="mt-0.5 size-4 shrink-0 text-site-positive"
                aria-hidden
              />
            ) : (
              <FiMinus className="mt-0.5 size-4 shrink-0" aria-hidden />
            )}
            <span>
              {label}
              {typeof value !== "boolean" ? (
                <span className="font-site-mono text-site-muted tabular-nums">
                  {" "}
                  — {value}
                </span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ul>
  );

  const faqItems = [1, 2, 3].map((n) => ({
    question: t(`faq${n}q`),
    answer: t(`faq${n}a`),
  }));

  return (
    /* No motion library on this route. Both effects that looked like they needed
       one — the travelling segment fill and the rolling price — are CSS; see
       `.s-seg-pill` and `.s-odo`. The page ships 0 KB of animation JavaScript. */
    <>
      <PageHeader
        ticket={tSite("eyebrow")}
        title={tSite("title")}
        lead={tSite("lead")}
        meta={[
          { label: planLabels.free, value: tProfile("freePrice") },
          {
            label: planLabels.pro,
            value: `${formatEgpPrice(
              cycle === "monthly"
                ? (proPlan?.priceMonthly ?? STATIC_PRO_MONTHLY_EGP)
                : (proPlan?.priceYearly ?? STATIC_PRO_YEARLY_EGP),
            )} ${tLanding("currencyEgp")}`,
          },
          { label: planLabels.custom, value: tLanding("customPrice") },
        ]}
      >
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-site-line pt-6">
          <BillingSwitch value={cycle} onChange={setCycle} />
          <p className="text-site-sm text-site-muted">{t("noteLimits")}</p>
        </div>
      </PageHeader>

      {/* ------------------------------------------------------------- 01 Plans */}
      <Section>
        <Container>
          <Ticket index={1}>{tSite("eyebrow")}</Ticket>

          {/* Subgrid: the name, blurb, price, feature list and button each get
              their own row shared across all three cards, so the prices sit on
              one line and the buttons on another however the copy wraps. */}
          <div className="s-stagger s-stagger-editorial mt-8 grid gap-4 lg:grid-cols-3 lg:grid-rows-[auto_auto_auto_1fr_auto]">
            {/* Free */}
            <PlanColumn>
              <h2 className="text-site-h3">{planLabels.free}</h2>
              <p className="mt-2 text-site-sm text-site-fg">
                {t("staticFreeDescription")}
              </p>
              <div className="mt-7">
                <PriceFigure>{tProfile("freePrice")}</PriceFigure>
                <p className="mt-2 text-site-sm text-site-muted">
                  {t("billingFree")}
                </p>
              </div>
              {bulletList("free")}
              <SiteButtonLink
                href="/auth/register"
                variant="secondary"
                size="lg"
                block
                className="mt-8"
              >
                {t("ctaRegister")}
              </SiteButtonLink>
            </PlanColumn>

            {/* Pro — the recommended path. The badge sits inside the card beside
                the name rather than straddling its top edge, where it would be
                the one element in the section that cannot be given a
                background-independent contrast guarantee. */}
            <PlanColumn featured>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-site-h3">{planLabels.pro}</h2>
                <Badge>{tLanding("popular")}</Badge>
              </div>
              <p className="mt-2 text-site-sm text-site-fg">
                {t("staticProDescription")}
              </p>
              <div className="mt-7">
                <PriceBlock
                  cycle={cycle}
                  priceMonthly={proPlan?.priceMonthly ?? STATIC_PRO_MONTHLY_EGP}
                  priceYearly={proPlan?.priceYearly ?? STATIC_PRO_YEARLY_EGP}
                  firstMonthlyPrice={proPlan?.firstMonthlyPrice}
                  firstYearlyPrice={proPlan?.firstYearlyPrice}
                  note={t("billingProShort")}
                />
              </div>
              {bulletList("pro")}
              <Magnetic className="mt-8 w-full">
                <SiteButtonLink
                  href={upgradeHref}
                  size="lg"
                  block
                  className="w-full"
                >
                  {t("ctaUpgrade")}
                </SiteButtonLink>
              </Magnetic>
            </PlanColumn>

            {/* Custom */}
            <PlanColumn>
              <h2 className="text-site-h3">{planLabels.custom}</h2>
              <p className="mt-2 text-site-sm text-site-fg">
                {t("noteCustom")}
              </p>
              <div className="mt-7">
                <PriceFigure className="text-[1.75rem]">
                  {tLanding("customPrice")}
                </PriceFigure>
                <p className="mt-2 text-site-sm text-site-muted">
                  {t("billingCustom")}
                </p>
              </div>
              {bulletList("custom")}
              <SiteAnchorButton
                href={ENSMENU_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
                size="lg"
                block
                className="mt-8"
              >
                <FiMessageCircle className="size-4" aria-hidden />
                {t("ctaContact")}
              </SiteAnchorButton>
            </PlanColumn>
          </div>
        </Container>
      </Section>

      {/* -------------------------------------------------------- 02 Comparison */}
      <Section tone="tint" id="compare">
        <Container>
          <SectionHeading
            index={2}
            eyebrow={t("columnFeature")}
            title={t("compareTitle")}
          />

          <div className="mt-10">
            <MobileComparison
              rows={rows}
              yes={yes}
              no={no}
              label={t("compareTitle")}
              planLabels={planLabels}
              sectionTitleFor={(id) => sectionTitleById.get(id)}
            />

            {/* No `overflow-hidden` on this wrapper: the header row is sticky,
                and an overflow ancestor would clip it out of existence. Forty
                rows is far too many to scroll without the plan names in
                view. */}
            {/* The sentinel is what makes "stuck" knowable: there is no selector
                for it, and once this has passed under the fixed header the row
                below must be pinned. */}
            <div ref={sentinelRef} aria-hidden className="hidden md:block" />

            <div
              data-stuck={stuck || undefined}
              className="group/table hidden rounded-site-card border border-site-line bg-site-bg shadow-site-sm md:block"
            >
              <table className="w-full table-fixed border-collapse">
                <caption className="sr-only">{t("compareTitle")}</caption>
                <colgroup>
                  <col className="w-[34%]" />
                  <col className="w-[22%]" />
                  <col className="w-[22%]" />
                  <col className="w-[22%]" />
                </colgroup>
                <thead>
                  <tr>
                    {/* Elevation only once detached. Stuck and unstuck looking
                        identical is what makes a pinned header read as the row
                        you happen to be on, which on a four-column table means
                        losing track of which plan a column belongs to. */}
                    <th
                      scope="col"
                      className={cn(
                        "s-ticket sticky top-(--s-header-h) z-10 border-b border-site-line-strong bg-site-bg px-5 py-4 text-start text-site-muted",
                        stuckHeaderCell,
                      )}
                    >
                      {t("columnFeature")}
                    </th>
                    {(["free", "pro", "custom"] as const).map((id) => (
                      <th
                        key={id}
                        scope="col"
                        className={cn(
                          "sticky top-(--s-header-h) z-10 border-b border-site-line-strong px-4 py-4 text-center text-site-h4",
                          stuckHeaderCell,
                          id === "pro"
                            ? "bg-site-brand-tint text-site-brand-deep"
                            : "bg-site-bg",
                        )}
                      >
                        {planLabels[id]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const sectionTitle = sectionTitleById.get(row.id);
                    return (
                      <Fragment key={row.id}>
                        {sectionTitle ? (
                          <tr>
                            {/* Group headers are quiet: a tinted band with the
                                label in ink. The brand on this page belongs to
                                the recommended plan, and spending it on five
                                structural labels made the one thing it should
                                mark unreadable. */}
                            <th
                              scope="colgroup"
                              colSpan={4}
                              className="s-ticket border-y border-site-line bg-site-ground px-5 py-3 text-start text-site-ink"
                            >
                              {sectionTitle}
                            </th>
                          </tr>
                        ) : null}
                        {/* The only motion in this table body, and it is a tint
                            rather than a reveal: forty rows arriving one at a
                            time is forty chances to make a comparison harder.
                            Tracking which row the eye is on across four columns
                            is the real problem at this width, and the Pro cell
                            has to deepen with the rest of the row or the
                            highlight stops halfway across. */}
                        <tr className="group/row row-settle hover:bg-site-ground">
                          <th
                            scope="row"
                            className="border-b border-site-line px-5 py-3.5 text-start text-site-sm font-medium text-site-ink"
                          >
                            {row.label}
                          </th>
                          {(["free", "pro", "custom"] as const).map((id) => (
                            <td
                              key={id}
                              className={cn(
                                "border-b border-site-line px-4 py-3.5 text-center",
                                id === "pro" &&
                                  "row-settle bg-site-brand-tint group-hover/row:bg-site-brand-tint/60",
                              )}
                            >
                              <Cell value={row[id]} yes={yes} no={no} />
                            </td>
                          ))}
                        </tr>
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <p className="s-ticket mt-6 text-site-muted">
            {t("staticFiguresNote")}
          </p>
        </Container>
      </Section>

      {/* ---------------------------------------------------------- 03 Payments */}
      <Section size="sm">
        <Container>
          <Grid className="items-center gap-y-8">
            <Col span={5} className="s-reveal-soft">
              <Ticket index={3}>{t("paymentMethodsTitle")}</Ticket>
              <p className="mt-4 text-site-body text-site-fg">
                {t("paymentMethodsDescription")}
              </p>
              <p className="s-ticket mt-4 flex items-center gap-2 text-site-positive">
                <FiShield className="size-3.5" aria-hidden />
                {t("paymentMethodsSecureNote")}
              </p>
            </Col>

            {/* One plate per accepted method: the marks are other companies'
                logos, and giving each its own surface keeps them from reading as
                one composite badge. */}
            {/* The plates arrive and then hold absolutely still. These are other
                companies' trademarks; animating someone else's logo is tacky and
                a payment mark that moves undercuts the exact thing it is here to
                signal. */}
            <Col span={7} start={6}>
              <ul className="s-stagger s-stagger-tight grid grid-cols-2 gap-3 sm:grid-cols-4">
                {PAYMENT_METHODS.map((method) => {
                  const label = t(`paymentMethod.${method.id}`);
                  return (
                    <li
                      key={method.id}
                      className="s-reveal-soft flex h-20 items-center justify-center rounded-site-card border border-site-line bg-site-bg px-4 shadow-site-sm"
                    >
                      {method.src.endsWith(".svg") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={method.src}
                          alt={label}
                          width={method.w}
                          height={method.h}
                          className="h-7 w-auto max-w-24 object-contain"
                        />
                      ) : (
                        <Image
                          src={method.src}
                          alt={label}
                          width={method.w}
                          height={method.h}
                          className="h-7 w-auto max-w-24 object-contain"
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            </Col>
          </Grid>
        </Container>
      </Section>

      {/* --------------------------------------------------------------- 04 FAQ */}
      <Section tone="tint">
        <Container>
          <Grid className="gap-y-10">
            <Col
              span={4}
              className="self-start lg:sticky lg:top-[calc(var(--s-header-h)+3rem)]"
            >
              <SectionHeading index={4} title={t("faqTitle")} />
            </Col>
            <Col span={7} start={6}>
              <div className="s-reveal">
                <Accordion items={faqItems} name="pricing-faq" />
              </div>
            </Col>
          </Grid>
        </Container>
      </Section>
    </>
  );
}
