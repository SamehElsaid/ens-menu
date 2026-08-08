"use client";

import { Fragment, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { FiCheck, FiMessageCircle, FiMinus, FiShield } from "react-icons/fi";
import {
  Accordion,
  Badge,
  Card,
  Container,
  Section,
  SectionHeading,
} from "@/components/site";
import { SiteAnchorButton, SiteButtonLink } from "@/components/site/Button";
import {
  BillingSwitch,
  PriceBlock,
  PriceFigure,
  type BillingCycle,
} from "@/components/site/pricing/PriceBlock";
import type {
  CellVal,
  ComparisonRow,
  PlanId,
} from "@/components/Pricing/pricingComparisonTypes";
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

function PlanCard({
  featured,
  children,
}: {
  featured?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card
      className={cn(
        "s-reveal relative flex flex-col p-7 lg:row-span-5 lg:grid lg:grid-rows-subgrid",
        featured && "border-site-brand-line shadow-site-lg",
      )}
    >
      {children}
    </Card>
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
  return <span className="text-site-sm text-site-fg">{value}</span>;
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
  planLabels,
  sectionTitleFor,
}: {
  rows: ComparisonRow[];
  yes: string;
  no: string;
  planLabels: Record<PlanId, string>;
  sectionTitleFor: (rowId: string) => string | undefined;
}) {
  const [plan, setPlan] = useState<PlanId>("pro");

  return (
    <div className="md:hidden">
      <div
        role="group"
        aria-label={planLabels.pro}
        className="flex rounded-full border border-site-line bg-site-bg p-1"
      >
        {(["free", "pro", "custom"] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setPlan(id)}
            aria-pressed={plan === id}
            className={cn(
              "flex-1 rounded-full px-3 py-2 text-site-xs font-semibold transition-colors",
              plan === id
                ? "bg-site-brand text-white"
                : "text-site-fg hover:text-site-ink",
            )}
          >
            {planLabels[id]}
          </button>
        ))}
      </div>

      <dl className="mt-6">
        {rows.map((row) => {
          const sectionTitle = sectionTitleFor(row.id);
          return (
            <Fragment key={row.id}>
              {sectionTitle ? (
                <p className="pt-7 pb-2 text-site-xs font-semibold tracking-[0.08em] text-site-brand uppercase">
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

  const bulletList = (plan: PlanId) => (
    <ul className="mt-7 flex-1 space-y-3">
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
                <span className="text-site-muted"> — {value}</span>
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
    <>
      {/* ---------------------------------------------------------------- Plans */}
      <Section size="lg">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow={tSite("eyebrow")}
            title={tSite("title")}
            lead={tSite("lead")}
          >
            <BillingSwitch value={cycle} onChange={setCycle} className="mt-4" />
          </SectionHeading>

          {/* Subgrid: the name, blurb, price, feature list and button each get
              their own row shared across all three cards, so the prices sit on
              one line and the buttons on another however the copy wraps. */}
          <div className="s-stagger mt-14 grid gap-5 lg:grid-cols-3 lg:grid-rows-[auto_auto_auto_1fr_auto] lg:gap-y-0">
            {/* Free */}
            <PlanCard>
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
            </PlanCard>

            {/* Pro — the recommended path, and the only card carrying a ring */}
            <PlanCard featured>
              <span className="absolute -top-3 start-7">
                <Badge>{tLanding("popular")}</Badge>
              </span>
              <h2 className="text-site-h3">{planLabels.pro}</h2>
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
              <SiteButtonLink
                href={upgradeHref}
                size="lg"
                block
                className="mt-8"
              >
                {t("ctaUpgrade")}
              </SiteButtonLink>
            </PlanCard>

            {/* Custom */}
            <PlanCard>
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
            </PlanCard>
          </div>

          <p className="mt-8 text-center text-site-xs text-site-muted">
            {t("noteLimits")}
          </p>
        </Container>
      </Section>

      {/* ----------------------------------------------------------- Comparison */}
      <Section tone="tint" id="compare">
        <Container>
          <SectionHeading title={t("compareTitle")} />

          <div className="mt-12">
            <MobileComparison
              rows={rows}
              yes={yes}
              no={no}
              planLabels={planLabels}
              sectionTitleFor={(id) => sectionTitleById.get(id)}
            />

            <div className="hidden overflow-hidden rounded-site-lg border border-site-line bg-site-bg md:block">
              <table className="w-full table-fixed border-collapse">
                <caption className="sr-only">{t("compareTitle")}</caption>
                <colgroup>
                  <col className="w-[34%]" />
                  <col className="w-[22%]" />
                  <col className="w-[22%]" />
                  <col className="w-[22%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-site-line">
                    <th scope="col" className="px-5 py-5 text-start">
                      <span className="text-site-xs font-semibold tracking-[0.08em] text-site-muted uppercase">
                        {t("columnFeature")}
                      </span>
                    </th>
                    {(["free", "pro", "custom"] as const).map((id) => (
                      <th
                        key={id}
                        scope="col"
                        className={cn(
                          "px-4 py-5 text-center text-site-h4",
                          id === "pro" && "bg-site-brand-tint",
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
                            <th
                              scope="colgroup"
                              colSpan={4}
                              className="border-y border-site-line bg-site-tint px-5 py-2.5 text-start text-site-xs font-semibold tracking-[0.08em] text-site-brand uppercase"
                            >
                              {sectionTitle}
                            </th>
                          </tr>
                        ) : null}
                        <tr className="border-b border-site-line last:border-0">
                          <th
                            scope="row"
                            className="px-5 py-3.5 text-start text-site-sm font-medium text-site-ink"
                          >
                            {row.label}
                          </th>
                          {(["free", "pro", "custom"] as const).map((id) => (
                            <td
                              key={id}
                              className={cn(
                                "px-4 py-3.5 text-center",
                                id === "pro" && "bg-site-brand-tint/40",
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

          <p className="mt-6 text-center text-site-xs text-site-muted">
            {t("staticFiguresNote")}
          </p>
        </Container>
      </Section>

      {/* ------------------------------------------------------------- Payments */}
      <Section size="sm">
        <Container width="narrow">
          <div className="flex flex-col items-center gap-5 text-center">
            <Badge tone="positive">
              <FiShield className="size-3.5" aria-hidden />
              {t("paymentMethodsTitle")}
            </Badge>
            <p className="max-w-xl text-site-body text-site-fg">
              {t("paymentMethodsDescription")}
            </p>
            <ul className="flex flex-wrap justify-center gap-3">
              {PAYMENT_METHODS.map((method) => {
                const label = t(`paymentMethod.${method.id}`);
                return (
                  <li
                    key={method.id}
                    className="flex h-14 min-w-28 items-center justify-center rounded-site-control border border-site-line bg-site-bg px-5"
                  >
                    {method.src.endsWith(".svg") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={method.src}
                        alt={label}
                        width={method.w}
                        height={method.h}
                        className="h-7 w-auto max-w-28 object-contain"
                      />
                    ) : (
                      <Image
                        src={method.src}
                        alt={label}
                        width={method.w}
                        height={method.h}
                        className="h-7 w-auto max-w-28 object-contain"
                      />
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="text-site-xs text-site-muted">
              {t("paymentMethodsSecureNote")}
            </p>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------------ FAQ */}
      <Section tone="tint">
        <Container width="narrow">
          <SectionHeading title={t("faqTitle")} />
          <div className="s-reveal mt-10">
            <Accordion items={faqItems} />
          </div>
        </Container>
      </Section>
    </>
  );
}
