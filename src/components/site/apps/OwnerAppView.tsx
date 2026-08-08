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
  Card,
  Container,
  Eyebrow,
  Section,
  SectionHeading,
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
      {/* ----------------------------------------------------------------- Hero */}
      <Section
        size="lg"
        className="isolate -mt-(--s-header-h) pt-[calc(var(--s-header-h)+4rem)]"
      >
        <div aria-hidden className="s-aurora" />
        {/* Centred, because there is nothing honest to put beside it: the
            owner app has no screen recording in the repository, and a hero
            that fills half a screen with a placeholder device promises a
            screenshot it cannot deliver. */}
        <Container width="narrow">
          <div className="flex flex-col items-center text-center">
            <Eyebrow>{t("badge")}</Eyebrow>
            <h1 className="mt-5 text-site-h1">
              {t("titleStart")}{" "}
              <span className="text-site-brand">{t("titleHighlight")}</span>
            </h1>
            <p className="mt-6 max-w-xl text-site-lead text-site-fg">
              {t("description")}
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <GooglePlayButton
                href={OWNER_GOOGLE_PLAY_URL}
                kicker={tHero("getItOn")}
              />
              <AppStoreSoon soonLabel={t("appleComingSoon")} />
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------- Features */}
      <Section tone="tint">
        <Container>
          <SectionHeading
            title={t("featuresSectionTitle")}
            lead={t("featuresSectionSubtitle")}
          />
          <div className="s-stagger mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ key, icon: Icon }) => (
              <Card
                key={key}
                interactive
                className="s-reveal flex items-center gap-3.5 p-5"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-site-sm bg-site-brand-tint text-site-brand">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="text-site-sm font-semibold text-site-ink">
                  {t(`features.${key}`)}
                </h3>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------------ CTA */}
      <Section>
        <Container width="narrow">
          <div className="s-reveal flex flex-col items-center gap-7 text-center">
            <h2 className="text-site-h2">{t("ctaTitle")}</h2>
            {/* Only the store that exists. The iOS slot is shown once, in the
                hero, and restated in the status line below — a second greyed
                badge here would be the third mention on one short page. */}
            <GooglePlayButton
              href={OWNER_GOOGLE_PLAY_URL}
              kicker={tHero("getItOn")}
            />
            <p className="text-site-xs text-site-muted">
              Android — {t("ctaAndroidStatus")} · iOS — {t("ctaIosStatus")}
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
