import { getTranslations } from "next-intl/server";
import { FiExternalLink, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import {
  Badge,
  Card,
  Container,
  Eyebrow,
  Section,
  SiteAnchorButton,
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
 * now? So the three live channels come first at full size, the rest of the
 * numbers follow as a plain list, and the map is last — it is the only thing
 * here nobody is in a hurry to find.
 *
 * A server component. The old page was a client component holding two `useMemo`
 * calls over static data.
 */

function ChannelCard({
  eyebrow,
  title,
  value,
  note,
  href,
  external,
  icon: Icon,
  action,
  featured,
}: {
  eyebrow: string;
  title: string;
  value?: string;
  note?: string;
  href: string;
  external?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  action: string;
  featured?: boolean;
}) {
  return (
    <Card
      interactive
      className={
        featured
          ? "s-reveal flex flex-col border-site-brand-line p-7 shadow-site"
          : "s-reveal flex flex-col p-7"
      }
    >
      <div className="flex-1">
        <span className="flex size-11 items-center justify-center rounded-site-control bg-site-brand-tint text-site-brand">
          <Icon className="size-5" aria-hidden />
        </span>
        <p className="mt-6 text-site-xs font-semibold tracking-[0.08em] text-site-muted uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-site-h4 font-semibold break-words text-site-ink">
          {title}
        </h2>
        {value ? (
          <p className="mt-1 text-site-sm text-site-fg" dir="ltr">
            {value}
          </p>
        ) : null}
        {note ? <p className="mt-3 text-site-sm text-site-fg">{note}</p> : null}
      </div>
      <SiteAnchorButton
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        variant={featured ? "primary" : "secondary"}
        block
        className="mt-7"
      >
        {action}
      </SiteAnchorButton>
    </Card>
  );
}

function PhoneRow({
  info,
  label,
  callLabel,
  whatsappLabel,
}: {
  info: ContactInfo;
  label: string;
  callLabel: string;
  whatsappLabel: string;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-4 border-b border-site-line py-4 last:border-0">
      <div className="flex min-w-0 items-center gap-3">
        <info.icon
          className="size-[18px] shrink-0 text-site-muted"
          aria-hidden
        />
        <div className="min-w-0">
          <p className="text-site-xs text-site-muted">{label}</p>
          <p
            className="text-site-body font-semibold text-site-ink"
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
      {/* ----------------------------------------------------------------- Hero */}
      <Section
        size="lg"
        className="isolate -mt-(--s-header-h) pt-[calc(var(--s-header-h)+4rem)] pb-0"
      >
        <div aria-hidden className="s-aurora" />
        <Container>
          <div className="max-w-2xl">
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <h1 className="mt-5 text-site-h1">
              {t("titleBefore")} {t("titleHighlight")}
            </h1>
            <p className="mt-6 text-site-lead text-site-fg">
              {t("description")}
            </p>
            <p className="mt-3 text-site-sm text-site-muted">
              {t("supportNote")}
            </p>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------- Channels */}
      <Section>
        <Container>
          <div className="s-stagger grid gap-5 md:grid-cols-3">
            <ChannelCard
              featured
              icon={FaWhatsapp}
              eyebrow={t("whatsappLabel")}
              title={t("whatsappCta")}
              value={ENSMENU_WHATSAPP_DISPLAY}
              note={t("whatsappDescription")}
              href={ENSMENU_WHATSAPP_URL}
              external
              action={t("actions.whatsapp")}
            />
            {salesPhone ? (
              <ChannelCard
                icon={FiPhone}
                eyebrow={t("phoneTags.sales")}
                title={salesPhone.value}
                href={salesPhone.href ?? "#"}
                action={t("actions.call")}
              />
            ) : null}
            <ChannelCard
              icon={FiMail}
              eyebrow={t("labels.email")}
              title={ENSMENU_SUPPORT_EMAIL}
              href={`mailto:${ENSMENU_SUPPORT_EMAIL}`}
              action={t("actions.email")}
            />
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------ All numbers + location */}
      <Section tone="tint">
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <h2 className="text-site-h3">{t("detailsTitle")}</h2>
              <ul className="mt-6">
                {phones.map((info) => (
                  <PhoneRow
                    key={info.value}
                    info={info}
                    label={phoneLabel(info)}
                    callLabel={t("actions.call")}
                    whatsappLabel={t("actions.whatsapp")}
                  />
                ))}
              </ul>

              {lina ? (
                <div className="mt-6 flex items-center gap-3 rounded-site-card border border-site-line bg-site-bg p-4">
                  <FaWhatsapp
                    className="size-5 shrink-0 text-site-muted"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-site-sm font-semibold text-site-ink">
                      {t("linaWhatsapp.name")}
                      <Badge tone="neutral">{t("linaWhatsapp.badge")}</Badge>
                    </p>
                    <p className="mt-0.5 text-site-sm text-site-muted">
                      {t("linaWhatsapp.subtitle")}
                    </p>
                  </div>
                </div>
              ) : null}

              <h2 className="mt-12 text-site-h3">{t("socialTitle")}</h2>
              <ul className="mt-5 flex flex-wrap gap-2.5">
                {socials.map((social) => (
                  <li key={social.name}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                      className="flex size-11 items-center justify-center rounded-site-control border border-site-line bg-site-bg text-site-fg transition-colors duration-150 hover:border-site-brand-line hover:bg-site-brand-tint hover:text-site-brand"
                    >
                      <social.icon className="size-[18px]" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-site-h3">{t("labels.location")}</h2>
              <p className="mt-3 flex items-start gap-2.5 text-site-body text-site-fg">
                <FiMapPin
                  className="mt-1 size-[18px] shrink-0 text-site-muted"
                  aria-hidden
                />
                {tFooter("location")}
              </p>
              <div className="mt-6 overflow-hidden rounded-site-card border border-site-line">
                <iframe
                  src={ENSMENU_MAP_EMBED_URL}
                  title={t("labels.location")}
                  className="block h-72 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <SiteAnchorButton
                href={ENSMENU_MAP_EXTERNAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
                className="mt-4"
              >
                <FiExternalLink className="size-4" aria-hidden />
                {t("actions.openInGoogleMaps")}
              </SiteAnchorButton>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
