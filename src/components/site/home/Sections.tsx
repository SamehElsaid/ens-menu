import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  FiBarChart2,
  FiCheck,
  FiGlobe,
  FiGrid,
  FiSmartphone,
  FiTruck,
  FiUsers,
  FiUploadCloud,
  FiCpu,
  FiEdit3,
  FiMaximize,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { templatesInfo } from "@/modules/TemplateShow/data";
import {
  Accordion,
  Badge,
  Card,
  Container,
  Section,
  SectionHeading,
} from "../index";
import { SiteButtonLink } from "../Button";

/* -------------------------------------------------------------------------- */
/* How it works                                                                */
/* -------------------------------------------------------------------------- */

const STEP_ICONS: IconType[] = [FiUploadCloud, FiCpu, FiEdit3, FiMaximize];

export function HowItWorks() {
  const t = useTranslations("site.how");
  const steps = ["upload", "extract", "review", "publish"] as const;

  return (
    <Section id="how-it-works" tone="default">
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          lead={t("lead")}
        />

        <ol className="s-stagger mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = STEP_ICONS[index];
            return (
              <li key={step} className="s-reveal relative">
                {/* The rule that joins one step to the next; the last step ends
                    the run, so it does not draw one. */}
                {index < steps.length - 1 ? (
                  <span
                    aria-hidden
                    className="absolute top-7 start-[calc(50%+2.5rem)] hidden h-px w-[calc(100%-5rem)] bg-gradient-to-r from-site-brand-line to-transparent lg:block"
                  />
                ) : null}

                <div className="flex flex-col items-center text-center">
                  <span className="relative flex size-14 items-center justify-center rounded-site-card bg-site-brand-tint text-site-brand ring-1 ring-site-brand-line ring-inset">
                    <Icon className="size-6" aria-hidden />
                    <span className="absolute -top-2 -end-2 flex size-6 items-center justify-center rounded-full bg-site-brand text-[11px] font-bold text-white">
                      {index + 1}
                    </span>
                  </span>
                  <h3 className="mt-5 text-site-h4">{t(`${step}.title`)}</h3>
                  <p className="mt-2 text-site-sm text-site-fg">
                    {t(`${step}.body`)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </Container>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* Features                                                                    */
/* -------------------------------------------------------------------------- */

const FEATURES: { id: string; icon: IconType }[] = [
  { id: "qr", icon: FiGrid },
  { id: "tableOrders", icon: FiSmartphone },
  { id: "delivery", icon: FiTruck },
  { id: "analytics", icon: FiBarChart2 },
  { id: "staff", icon: FiUsers },
  { id: "bilingual", icon: FiGlobe },
];

export function Features() {
  const t = useTranslations("site.features");

  return (
    <Section id="features" tone="tint">
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          lead={t("lead")}
        />

        <div className="s-stagger mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ id, icon: Icon }) => (
            <Card key={id} interactive className="s-reveal p-6">
              <span className="flex size-11 items-center justify-center rounded-site-control bg-site-brand-tint text-site-brand">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-5 text-site-h4">{t(`${id}.title`)}</h3>
              <p className="mt-2 text-site-sm text-site-fg">
                {t(`${id}.body`)}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* Templates showcase                                                          */
/* -------------------------------------------------------------------------- */

/**
 * The real template catalogue, read from the same source the design picker in
 * the dashboard reads. Showing invented mock-ups here would promise looks the
 * product cannot deliver, so this list is imported rather than authored — and
 * `hidePreviewImage` templates (works in progress) are filtered out because
 * they have nothing to show.
 */
export function Showcase() {
  const t = useTranslations("site.showcase");
  const locale = useLocale();
  const isAr = locale === "ar";

  const templates = templatesInfo
    .filter((tpl) => !tpl.hidePreviewImage && !tpl.isUnderConstruction)
    .slice(0, 6);

  if (templates.length === 0) return null;

  return (
    <Section tone="default">
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          lead={t("lead")}
        />

        <ul className="s-stagger mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((tpl) => (
            <li key={tpl.id} className="s-reveal">
              <Card
                interactive
                className="flex h-full flex-col overflow-hidden p-0"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-site-tint">
                  <Image
                    src={tpl.image}
                    alt={t("previewAlt", {
                      name: isAr ? tpl.nameAr : tpl.name,
                    })}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 22rem"
                    className="object-cover object-top transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03]"
                  />
                  <span className="absolute top-3 end-3">
                    <Badge tone={tpl.isFree ? "positive" : "brand"}>
                      {tpl.isFree ? t("freeBadge") : t("proBadge")}
                    </Badge>
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-site-h4">
                      {isAr ? tpl.nameAr : tpl.name}
                    </h3>
                    {tpl.isNew ? (
                      <Badge tone="warm">{t("newBadge")}</Badge>
                    ) : null}
                  </div>
                  <p className="mt-2 text-site-sm text-site-fg">
                    {isAr ? tpl.descriptionAr : tpl.description}
                  </p>
                </div>
              </Card>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex justify-center">
          <SiteButtonLink href="/auth/register" variant="secondary" size="md">
            {t("cta")}
          </SiteButtonLink>
        </div>
      </Container>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* Plans                                                                       */
/* -------------------------------------------------------------------------- */

export function Plans() {
  const t = useTranslations("site.plans");
  const free = ["menu", "qr", "items", "bilingual"] as const;
  const pro = [
    "tables",
    "orders",
    "delivery",
    "staff",
    "analytics",
    "domain",
  ] as const;

  return (
    <Section tone="tint">
      <Container>
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          lead={t("lead")}
        />

        <div className="s-stagger mx-auto mt-14 grid max-w-4xl gap-5 md:grid-cols-2">
          <Card className="s-reveal flex flex-col p-7">
            <h3 className="text-site-h3">{t("free.name")}</h3>
            <p className="mt-2 text-site-sm text-site-fg">{t("free.body")}</p>
            <ul className="mt-6 flex-1 space-y-3">
              {free.map((key) => (
                <li key={key} className="flex items-start gap-2.5 text-site-sm">
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
          </Card>

          <Card
            className="s-reveal relative flex flex-col border-site-brand-line p-7 ring-1 ring-site-brand-line"
            interactive
          >
            <span className="absolute -top-3 end-6 rounded-full bg-site-brand px-3 py-1 text-[11px] font-semibold text-white">
              {t("pro.badge")}
            </span>
            <h3 className="text-site-h3">{t("pro.name")}</h3>
            <p className="mt-2 text-site-sm text-site-fg">{t("pro.body")}</p>
            <ul className="mt-6 flex-1 space-y-3">
              {pro.map((key) => (
                <li key={key} className="flex items-start gap-2.5 text-site-sm">
                  <FiCheck
                    className="mt-0.5 size-4 shrink-0 text-site-brand"
                    aria-hidden
                  />
                  {t(`pro.items.${key}`)}
                </li>
              ))}
            </ul>
            <SiteButtonLink href="/pricing" size="md" block className="mt-7">
              {t("pro.cta")}
            </SiteButtonLink>
          </Card>
        </div>
      </Container>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/* FAQ                                                                         */
/* -------------------------------------------------------------------------- */

export function HomeFaq() {
  const t = useTranslations("site.faq");
  const keys = [
    "howLong",
    "needApp",
    "arabic",
    "existingMenu",
    "cost",
    "orders",
  ];

  return (
    <Section tone="default">
      <Container width="narrow">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          lead={t("lead")}
        />
        <div className="s-reveal mt-12">
          <Accordion
            name="home-faq"
            items={keys.map((key) => ({
              question: t(`${key}.q`),
              answer: t(`${key}.a`),
            }))}
          />
        </div>
        <p className="mt-10 text-center text-site-sm text-site-muted">
          {t("more")}{" "}
          <Link
            href="/faq"
            className="font-semibold text-site-brand underline underline-offset-4 hover:text-site-brand-hover"
          >
            {t("moreLink")}
          </Link>
        </p>
      </Container>
    </Section>
  );
}
