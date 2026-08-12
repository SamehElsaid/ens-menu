import { getTranslations } from "next-intl/server";
import { FiExternalLink, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import {
  Badge,
  Col,
  Container,
  Grid,
  PageHeader,
  Section,
  SectionHeading,
  SiteAnchorButton,
  Ticket,
} from "@/components/site";
import {
  ENSMENU_MAP_EMBED_URL,
  ENSMENU_MAP_EXTERNAL_URL,
  getContactInfo,
  getSocialLinks,
} from "@/modules/Footer/data";
import {
  ENSMENU_SUPPORT_EMAIL,
  ENSMENU_WHATSAPP_DISPLAY,
  ENSMENU_WHATSAPP_URL,
} from "@/lib/contactConstants";
import type { ContactInfo } from "@/types/types";

/**
 * Contact.
 *
 * One question decides this page: how does a venue owner reach a person right
 * now? So the two fastest channels are actions in the page head — before any
 * scrolling — the three live channels follow as a rail, the rest of the numbers
 * are a ledger, and the map is last. It is the only thing here nobody is in a
 * hurry to find.
 *
 * The three channels are three cards, and the recommended one is stated with
 * the brand: a filled medallion, a brand border and one step up the elevation
 * ladder. Nothing floats a "recommended" ribbon over a corner, because that is
 * the one treatment that cannot survive a forced-colours pass.
 *
 * A server component. The old page was a client component holding two `useMemo`
 * calls over static data.
 */

function Channel({
  label,
  value,
  note,
  href,
  external,
  icon: Icon,
  action,
  featured,
}: {
  label: string;
  value: string;
  note?: string;
  href: string;
  external?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  action: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`s-reveal s-lift s-press relative flex flex-col rounded-site-card border p-7 ${
        featured
          ? "border-site-brand bg-site-bg shadow-site-lg"
          : "border-site-line bg-site-bg shadow-site-sm"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        {/* The recommended channel says so with a lit medallion rather than a
            floating "best" pill: it is the same signal the rest of the site
            uses for "this one", and it survives forced colours. */}
        <span
          className={`s-press-mark flex size-11 items-center justify-center rounded-site-control border ${
            featured
              ? "border-transparent bg-site-brand text-white shadow-site-brand"
              : "border-site-brand-line bg-site-brand-tint text-site-brand-text"
          }`}
        >
          <Icon className="size-5" />
        </span>
        <Ticket>{label}</Ticket>
      </div>

      <p
        className="mt-6 font-site-mono text-site-h4 font-semibold wrap-break-word text-site-ink"
        dir="ltr"
      >
        {value}
      </p>
      {note ? (
        <p className="mt-3 flex-1 text-site-sm text-site-fg">{note}</p>
      ) : (
        <div className="flex-1" />
      )}

      <SiteAnchorButton
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        variant={featured ? "primary" : "secondary"}
        block
        className="mt-7"
      >
        {action}
      </SiteAnchorButton>
    </div>
  );
}

function PhoneRow({
  info,
  index,
  label,
  callLabel,
  whatsappLabel,
}: {
  info: ContactInfo;
  index: number;
  label: string;
  callLabel: string;
  whatsappLabel: string;
}) {
  return (
    /* `row-settle`, not `s-lift`: a phone list is scanned rather than read, and
       lifting the row would move the number the visitor is about to dial. */
    <li className="s-reveal-soft row-settle flex flex-wrap items-center justify-between gap-4 rounded-site-card border border-site-line bg-site-bg px-5 py-4 shadow-site-sm hover:bg-site-ground">
      <div className="flex min-w-0 items-baseline gap-4">
        <span className="s-ticket text-site-brand-text">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0">
          <p className="s-ticket text-site-muted">{label}</p>
          <p
            className="mt-1 font-site-mono text-site-body font-semibold text-site-ink"
            dir={info.dir ?? "ltr"}
          >
            {info.value}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {info.href ? (
          <SiteAnchorButton href={info.href} variant="secondary" size="sm">
            <FiPhone className="size-3.5" aria-hidden />
            {callLabel}
          </SiteAnchorButton>
        ) : null}
        {info.whatsappHref ? (
          <SiteAnchorButton
            href={info.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            variant="ghost"
            size="sm"
          >
            <FaWhatsapp className="size-3.5" aria-hidden />
            {whatsappLabel}
          </SiteAnchorButton>
        ) : null}
      </div>
    </li>
  );
}

export default async function ContactView() {
  const t = await getTranslations("Landing.contactPage");
  const tFooter = await getTranslations("Landing.footer");
  const contactInfo = getContactInfo(tFooter);
  const socials = getSocialLinks();

  const phones = contactInfo.filter((info) => info.type === "phone");
  const salesPhone = phones.find((info) => info.subLabelKey === "sales");
  const lina = contactInfo.find((info) => info.type === "linaWhatsapp");

  const phoneLabel = (info: ContactInfo) =>
    info.subLabelKey
      ? t(`phoneTags.${info.subLabelKey}`)
      : info.labelKey
        ? t(`labels.${info.labelKey}`)
        : info.value;

  return (
    <>
      <PageHeader
        ticket={t("eyebrow")}
        title={`${t("titleBefore")} ${t("titleHighlight")}`}
        lead={t("description")}
        meta={[
          { label: t("whatsappLabel"), value: ENSMENU_WHATSAPP_DISPLAY },
          { label: t("labels.email"), value: ENSMENU_SUPPORT_EMAIL },
          ...(salesPhone
            ? [{ label: t("phoneTags.sales"), value: salesPhone.value }]
            : []),
        ]}
        actions={
          <>
            <SiteAnchorButton
              href={ENSMENU_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
            >
              <FaWhatsapp className="size-4" aria-hidden />
              {t("actions.whatsapp")}
            </SiteAnchorButton>
            <SiteAnchorButton
              href={`mailto:${ENSMENU_SUPPORT_EMAIL}`}
              variant="secondary"
              size="lg"
            >
              <FiMail className="size-4" aria-hidden />
              {t("actions.email")}
            </SiteAnchorButton>
          </>
        }
      >
        <p className="s-ticket s-enter-soft s-enter-d3 s-enter-rule mt-10 border-t border-site-line pt-5 text-site-muted">
          {t("supportNote")}
        </p>
      </PageHeader>

      {/* --------------------------------------------------------- 01 Channels */}
      <Section>
        <Container>
          <Ticket index={1}>{t("channelsTitle")}</Ticket>
          <div className="s-stagger s-stagger-editorial mt-8 grid gap-4 md:grid-cols-3">
            <Channel
              featured
              icon={FaWhatsapp}
              label={t("whatsappLabel")}
              value={ENSMENU_WHATSAPP_DISPLAY}
              note={t("whatsappDescription")}
              href={ENSMENU_WHATSAPP_URL}
              external
              action={t("actions.whatsapp")}
            />
            {salesPhone ? (
              <Channel
                icon={FiPhone}
                label={t("phoneTags.sales")}
                value={salesPhone.value}
                href={salesPhone.href ?? "#"}
                action={t("actions.call")}
              />
            ) : null}
            <Channel
              icon={FiMail}
              label={t("labels.email")}
              value={ENSMENU_SUPPORT_EMAIL}
              href={`mailto:${ENSMENU_SUPPORT_EMAIL}`}
              action={t("actions.email")}
            />
          </div>
        </Container>
      </Section>

      {/* -------------------------------------------------- 02 Numbers + social */}
      <Section tone="tint">
        <Container>
          <Grid className="gap-y-12">
            <Col
              span={4}
              className="self-start lg:sticky lg:top-[calc(var(--s-header-h)+3rem)]"
            >
              <SectionHeading
                index={2}
                eyebrow={t("detailsTitle")}
                title={t("numbersTitle")}
              />
              {lina ? (
                <div className="mt-8 rounded-site-card border border-site-line bg-site-bg p-5 shadow-site-sm">
                  <div className="flex items-center gap-3">
                    <FaWhatsapp
                      className="size-5 shrink-0 text-site-brand-text"
                      aria-hidden
                    />
                    <p className="flex flex-wrap items-center gap-2 text-site-sm font-semibold text-site-ink">
                      {t("linaWhatsapp.name")}
                      <Badge tone="neutral">{t("linaWhatsapp.badge")}</Badge>
                    </p>
                  </div>
                  <p className="mt-3 text-site-sm text-site-muted">
                    {t("linaWhatsapp.subtitle")}
                  </p>
                </div>
              ) : null}
            </Col>

            <Col span={7} start={6}>
              <ul className="s-stagger s-stagger-tight flex flex-col gap-3">
                {phones.map((info, index) => (
                  <PhoneRow
                    key={info.value}
                    info={info}
                    index={index}
                    label={phoneLabel(info)}
                    callLabel={t("actions.call")}
                    whatsappLabel={t("actions.whatsapp")}
                  />
                ))}
              </ul>

              <h3 className="s-ticket mt-12 text-site-muted">
                {t("socialTitle")}
              </h3>
              {/* The same round plates the footer uses, so the social row is
                  recognisably one element of the system rather than a different
                  shape on every page. */}
              <ul className="s-stagger s-stagger-tight mt-4 flex flex-wrap gap-2">
                {socials.map((social) => (
                  <li key={social.name} className="s-reveal-soft">
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                      className="flex size-12 items-center justify-center rounded-full border border-site-line bg-site-bg text-site-fg transition-[background-color,border-color,color,transform] duration-(--dur-tint) ease-(--ease-settle) hover:border-transparent hover:bg-site-brand hover:text-white motion-safe:active:scale-[0.94]"
                    >
                      <social.icon className="size-[18px]" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </Col>
          </Grid>
        </Container>
      </Section>

      {/* --------------------------------------------------------- 03 Location */}
      <Section>
        <Container>
          <Grid className="gap-y-10">
            <Col span={4} className="s-reveal">
              <SectionHeading index={3} title={t("labels.location")} />
              <p className="mt-6 flex items-start gap-2.5 text-site-body text-site-fg">
                <FiMapPin
                  className="mt-1 size-[18px] shrink-0 text-site-muted"
                  aria-hidden
                />
                {tFooter("location")}
              </p>
              <SiteAnchorButton
                href={ENSMENU_MAP_EXTERNAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
                className="mt-7"
              >
                <FiExternalLink className="size-4" aria-hidden />
                {t("actions.openInGoogleMaps")}
              </SiteAnchorButton>
            </Col>

            <Col span={8} start={5}>
              {/* The card deliberately does not reveal, and this is the most
                  important negative decision on the page: animating opacity on
                  an ancestor of a cross-origin iframe makes the browser
                  composite the whole embedded document every frame of the
                  animation. The caption is a sibling of the iframe rather than
                  its ancestor, so it can reveal on its own. */}
              <div className="overflow-hidden rounded-site-card border border-site-line bg-site-bg shadow-site-sm">
                <p className="s-reveal-soft s-ticket border-b border-site-line px-5 py-3 text-site-muted">
                  {t("labels.location")}
                </p>
                <iframe
                  src={ENSMENU_MAP_EMBED_URL}
                  title={t("labels.location")}
                  className="block h-80 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </Col>
          </Grid>
        </Container>
      </Section>
    </>
  );
}
