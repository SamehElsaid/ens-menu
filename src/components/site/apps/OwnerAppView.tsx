import { getTranslations } from "next-intl/server";
import {
  FiCloud,
  FiEdit3,
  FiGlobe,
  FiImage,
  FiRefreshCw,
  FiTag,
} from "react-icons/fi";
import { HiOutlineQrCode, HiOutlineSparkles } from "react-icons/hi2";
import {
  Col,
  Container,
  Grid,
  PageHeader,
  Section,
  SectionHeading,
  Ticket,
} from "@/components/site";
import {
  AppStoreSoon,
  GooglePlayButton,
} from "@/components/site/apps/StoreButtons";

/**
 * ENSMENU Owner — Android landing.
 *
 * There is no screen recording of the owner app in the repository, so this page
 * does not show a phone at all. The previous version filled the frame with a
 * gradient and a placeholder icon, which promises a screenshot and delivers a
 * rectangle; type and the store badge are the honest version of that.
 */

const OWNER_GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.ensmenu.ens_owner_app";

const FEATURES = [
  { key: "qrMenu", icon: HiOutlineQrCode },
  { key: "aiAssistant", icon: HiOutlineSparkles },
  { key: "menuManagement", icon: FiEdit3 },
  { key: "uploadPhotos", icon: FiImage },
  { key: "uploadLogo", icon: FiTag },
  { key: "multiLanguage", icon: FiGlobe },
  { key: "realtimeUpdates", icon: FiRefreshCw },
  { key: "securePlatform", icon: FiCloud },
] as const;

export default async function OwnerAppView() {
  const t = await getTranslations("Landing.OwnerApp");
  const tHero = await getTranslations("Landing.Hero");

  return (
    <>
      {/* The header carries no device frame: the owner app has no screen
          recording in the repository, and a hero that fills half a screen with
          a placeholder promises a screenshot it cannot deliver. The platform
          stub fills the trailing columns with facts instead. */}
      <PageHeader
        ticket={t("badge")}
        title={
          <>
            {t("titleStart")}{" "}
            <span className="relative inline-block">
              <span className="relative z-10">{t("titleHighlight")}</span>
              {/* The page's one flourish, and it lands on the product name. */}
              <span
                aria-hidden
                className="s-enter-line absolute inset-x-0 bottom-[0.02em] z-0 h-[0.14em] bg-site-brand/70"
              />
            </span>
          </>
        }
        lead={t("description")}
        meta={[
          { label: "Android", value: t("ctaAndroidStatus") },
          { label: "iOS", value: t("ctaIosStatus") },
        ]}
        actions={
          <>
            <GooglePlayButton
              href={OWNER_GOOGLE_PLAY_URL}
              kicker={tHero("getItOn")}
            />
            <AppStoreSoon soonLabel={t("appleComingSoon")} />
          </>
        }
      />

      {/* ---------------------------------------------------------- 01 Features */}
      <Section tone="tint">
        <Container>
          <Grid className="gap-y-12">
            <Col
              span={4}
              className="self-start lg:sticky lg:top-[calc(var(--s-header-h)+3rem)]"
            >
              <SectionHeading
                index={1}
                title={t("featuresSectionTitle")}
                lead={t("featuresSectionSubtitle")}
              />
            </Col>

            {/* Eight capability names with no supporting copy: that is a
                specification list, so it is set as one. Eight bordered cards
                spent eight borders saying what eight ruled rows say. */}
            <Col span={7} start={6}>
              <ul className="s-stagger grid border-t border-site-line sm:grid-cols-2">
                {FEATURES.map(({ key, icon: Icon }, index) => (
                  <li
                    key={key}
                    /* The rule draws beneath the row on the row's own beat, so
                       the spec sheet assembles as it is read. Nothing here is
                       interactive and nothing gets a hover state: a tint on
                       non-interactive text promises a click that does not
                       exist. */
                    className="s-reveal-soft s-rule-row flex items-center gap-3.5 border-b border-site-line py-4 sm:even:border-s sm:even:ps-6"
                  >
                    <span className="s-ticket text-site-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Icon
                      className="size-[18px] shrink-0 text-site-brand"
                      aria-hidden
                    />
                    <h3 className="text-site-sm font-semibold text-site-ink">
                      {t(`features.${key}`)}
                    </h3>
                  </li>
                ))}
              </ul>
            </Col>
          </Grid>
        </Container>
      </Section>

      {/* --------------------------------------------------------------- 02 CTA */}
      <Section>
        <Container>
          <Grid className="items-center gap-y-8">
            {/* Closing quietly and deliberately: no gradient band, no rake.
                This page has no `CtaBand` and should not grow one — a visitor
                who has read a spec sheet to the end already wants the app. */}
            <Col span={7} className="s-reveal">
              <Ticket index={2}>{t("badge")}</Ticket>
              <h2 className="mt-5 text-site-h2">{t("ctaTitle")}</h2>
            </Col>
            {/* Only the store that exists. The iOS slot is stated once, in the
                page head, so a second greyed badge here would be the third
                mention on one short page. */}
            <Col span={4} start={9} className="s-reveal">
              <GooglePlayButton
                href={OWNER_GOOGLE_PLAY_URL}
                kicker={tHero("getItOn")}
              />
            </Col>
          </Grid>
        </Container>
      </Section>
    </>
  );
}
