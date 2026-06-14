"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  FiActivity,
  FiAlertCircle,
  FiBell,
  FiGlobe,
  FiHeart,
  FiLayers,
  FiSmartphone,
  FiZap,
  FiClock,
  FiEdit3,
  FiUsers,
  FiImage,
  FiFileText,
  FiTrendingDown,
} from "react-icons/fi";
import {
  HiOutlineQrCode,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { buildCtaMenuItems } from "@/lib/mockDemoProducts";
import CtaPhoneMockup from "@/components/HomePage/CtaPhoneMockup";
import { Link } from "@/i18n/navigation";
import MarketingTrustFeatures from "@/components/marketing/MarketingTrustFeatures";
import { MARKETING_TRUST_FEATURE_IDS } from "@/lib/marketingTrustFeatureIds";
import { cn } from "@/lib/cn";
import { ds } from "@/lib/designSystem";

const PROBLEM_KEYS = [
  "paper",
  "prices",
  "ordering",
  "photos",
  "updates",
  "waiter",
  "tracking",
  "branches",
  "outdated",
] as const;

const PROBLEM_ICONS = {
  paper: FiFileText,
  prices: FiTrendingDown,
  ordering: FiClock,
  photos: FiImage,
  updates: FiEdit3,
  waiter: FiUsers,
  tracking: FiActivity,
  branches: FiLayers,
  outdated: FiAlertCircle,
} as const;

const BENTO_KEYS = [
  { key: "aiOrdering", icon: HiOutlineSparkles, span: "wide" },
  { key: "restaurants", icon: FiUsers, span: "normal" },
  { key: "qrSystem", icon: HiOutlineQrCode, span: "normal" },
  { key: "fasterService", icon: FiZap, span: "normal" },
  { key: "customerExperience", icon: FiHeart, span: "normal" },
  { key: "smartRecommendations", icon: HiOutlineSparkles, span: "wide" },
  { key: "liveOrders", icon: FiBell, span: "normal" },
  { key: "mobileDashboard", icon: FiSmartphone, span: "normal" },
] as const;

const DIFF_KEYS = [
  "ai",
  "arabic",
  "mobile",
  "multilang",
  "smartQr",
  "fastSetup",
  "restaurants",
] as const;

const DIFF_ICONS = {
  ai: HiOutlineSparkles,
  arabic: FiGlobe,
  mobile: FiSmartphone,
  multilang: FiGlobe,
  smartQr: HiOutlineQrCode,
  fastSetup: FiZap,
  restaurants: FiUsers,
} as const;

const HERO_PARTICLES = [
  { top: "12%", left: "8%", delay: "0s", size: "4px" },
  { top: "28%", left: "82%", delay: "1.2s", size: "3px" },
  { top: "62%", left: "14%", delay: "0.6s", size: "5px" },
  { top: "78%", left: "72%", delay: "1.8s", size: "3px" },
  { top: "44%", left: "48%", delay: "2.4s", size: "2px" },
  { top: "18%", left: "58%", delay: "0.3s", size: "3px" },
] as const;

function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function AboutHeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="about-hero-mesh absolute inset-0" />
      <div className="absolute -start-24 top-[-10%] h-80 w-80 rounded-full bg-purple-500/20 blur-[100px] dark:bg-purple-600/15" />
      <div className="absolute -end-20 top-[20%] h-72 w-72 rounded-full bg-indigo-500/15 blur-[90px] dark:bg-indigo-600/12" />
      <div className="absolute start-[35%] bottom-[-5%] h-64 w-64 rounded-full bg-violet-400/10 blur-[80px]" />
      {HERO_PARTICLES.map((particle, index) => (
        <span
          key={index}
          className="about-hero-particle absolute rounded-full bg-purple-400/50 dark:bg-purple-300/40"
          style={{
            top: particle.top,
            left: particle.left,
            width: particle.size,
            height: particle.size,
            animationDelay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}

function AboutHeroVisual() {
  const t = useTranslations("Landing.aboutPage.hero");

  const pills = [
    { label: t("visualPills.liveOrders"), tone: "text-purple-300" },
    { label: t("visualPills.qrTables"), tone: "text-sky-300" },
    { label: t("visualPills.kitchenAlerts"), tone: "text-amber-300" },
  ] as const;

  return (
    <div className="about-hero-visual relative mx-auto w-full max-w-[20rem] sm:max-w-[22rem] lg:max-w-none">
      <div
        className="about-hero-orbit pointer-events-none absolute inset-[-1.25rem] rounded-[2.75rem] border border-purple-300/20 dark:border-purple-500/15"
        aria-hidden
      />
      <div
        className="about-hero-glow pointer-events-none absolute -inset-10 rounded-[3rem] bg-gradient-to-br from-purple-500/25 via-violet-500/10 to-transparent blur-3xl"
        aria-hidden
      />
      <div className="about-hero-float relative rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-2.5 shadow-2xl shadow-purple-500/15 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/75 dark:shadow-purple-900/20 sm:p-3">
        <div className="overflow-hidden rounded-2xl bg-[#0f1219] ring-1 ring-white/10">
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
            <span className="text-[10px] font-semibold text-purple-300">ENSMENU</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Live
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 p-3">
            {pills.map((pill) => (
              <div
                key={pill.label}
                className="rounded-xl border border-white/6 bg-white/[0.04] px-2 py-2.5 text-center"
              >
                <p className={cn("text-[9px] font-semibold leading-snug", pill.tone)}>
                  {pill.label}
                </p>
              </div>
            ))}
          </div>
          <div className="mx-3 mb-3 space-y-2 rounded-xl border border-purple-500/20 bg-purple-500/10 p-2.5">
            <div className="flex items-center gap-2">
              <HiOutlineSparkles className="h-4 w-4 text-purple-300" aria-hidden />
              <p className="text-[10px] font-semibold text-purple-100">AI Menu Import</p>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="about-import-bar h-full w-[72%] rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 rtl:bg-gradient-to-l" />
            </div>
          </div>
        </div>
      </div>

      <div className="about-qr-chip absolute -end-2 top-[10%] z-10 rounded-xl border border-purple-200/70 bg-white/95 p-2 shadow-lg shadow-purple-500/15 dark:border-purple-500/30 dark:bg-slate-900/95 sm:-end-3 sm:p-2.5">
        <HiOutlineQrCode className="h-9 w-9 text-purple-600 dark:text-purple-400 sm:h-10 sm:w-10" aria-hidden />
      </div>

      <div className="about-ai-chip absolute -start-1 bottom-[16%] z-10 flex items-center gap-2 rounded-full border border-violet-200/70 bg-white/95 px-2.5 py-1.5 shadow-md dark:border-violet-500/25 dark:bg-slate-900/95 sm:-start-2 sm:px-3 sm:py-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-white sm:h-7 sm:w-7">
          <HiOutlineSparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
        </span>
        <span className="text-[10px] font-bold text-slate-800 dark:text-white sm:text-[11px]">
          Lina AI
        </span>
      </div>
    </div>
  );
}

export default function AboutPageView() {
  const t = useTranslations("Landing.aboutPage");
  const tTrust = useTranslations("marketingTrustFeatures");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const heroReveal = useReveal();
  const problemReveal = useReveal();
  const whyReveal = useReveal();
  const trustReveal = useReveal();

  const trustFeatures = MARKETING_TRUST_FEATURE_IDS.map((id) => ({
    id,
    title: tTrust(`${id}.title`),
  }));
  const diffReveal = useReveal();
  const visionReveal = useReveal();
  const ctaReveal = useReveal(0.08);

  const pills = ["pill1", "pill2", "pill3", "pill4"] as const;

  const menuItems = buildCtaMenuItems(
    {
      item1: t("cta.menu.item1"),
      item2: t("cta.menu.item2"),
      item3: t("cta.menu.item3"),
    },
    isRtl,
  ).map(({ name, price, image }) => ({ name, price, image }));

  return (
    <div className="about-page bg-white dark:bg-[#0d1117]">
      {/* Hero */}
      <section className="about-section about-section--hero relative overflow-hidden bg-gradient-app pt-20 pb-14 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20">
        <AboutHeroBackdrop />
        <div className="hero-background-grid pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.03]" aria-hidden />

        <div
          ref={heroReveal.ref}
          className={cn(
            "home-section-shell relative z-10",
            heroReveal.visible && "about-section--visible",
          )}
        >
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="text-center lg:text-start">
              <span className={cn(ds.badge, "about-reveal")}>
                <span className={ds.badgeDot} aria-hidden />
                {t("hero.badge")}
              </span>

              <h1 className={cn("about-hero-title about-reveal mt-6 font-black tracking-tight")}>
                {t("hero.titleBefore")}{" "}
                <span className={ds.type.accent}>{t("hero.titleAccent")}</span>
              </h1>

              <p className={cn("about-hero-subtitle about-reveal mx-auto mt-5 max-w-xl lg:mx-0")}>
                {t("hero.subtitle")}
              </p>

              <div className={cn(ds.pillRow, "about-reveal mt-8 justify-center lg:justify-start")}>
                {pills.map((key, i) => (
                  <span
                    key={key}
                    className={ds.pill}
                    style={{ transitionDelay: `${i * 70}ms` }}
                  >
                    {t(`hero.${key}`)}
                  </span>
                ))}
              </div>
            </div>

            <div className="about-reveal hidden lg:block lg:justify-self-end">
              <AboutHeroVisual />
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="about-section about-section--muted relative overflow-hidden py-14 md:py-16">
        <div className="about-section-fade pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white to-transparent dark:from-[#0d1117]" aria-hidden />
        <div
          ref={problemReveal.ref}
          className={cn(
            "home-section-shell relative z-10",
            problemReveal.visible && "about-section--visible",
          )}
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className={cn("about-eyebrow about-reveal")}>{t("problem.eyebrow")}</p>
            <h2 className={cn("about-section-title about-reveal mt-3")}>
              {t("problem.title")}{" "}
              <span className={ds.type.accent}>{t("problem.titleAccent")}</span>
            </h2>
          </div>

          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {PROBLEM_KEYS.map((key, i) => {
              const Icon = PROBLEM_ICONS[key];
              return (
                <article
                  key={key}
                  className={cn(
                    "about-problem-card about-reveal group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60 sm:p-5",
                  )}
                  style={{ transitionDelay: `${i * 55}ms` }}
                >
                  <div className="pointer-events-none absolute -end-6 -top-6 h-24 w-24 rounded-full bg-red-500/8 blur-2xl transition-opacity duration-500 group-hover:opacity-100 dark:bg-red-500/12" />
                  <div className="relative flex items-start gap-3.5 text-start sm:gap-4">
                    <span className="about-problem-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 dark:bg-red-500/10 dark:text-red-400 sm:h-11 sm:w-11">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white sm:text-[15px]">
                        {t(`problem.items.${key}.title`)}
                      </h3>
                      <p className="mt-1.5 text-[12px] leading-relaxed text-slate-500 dark:text-slate-400 sm:text-[13px]">
                        {t(`problem.items.${key}.hint`)}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why ENSMENU — Bento */}
      <section className="about-section relative py-14 md:py-16">
        <div className="about-section-divider pointer-events-none absolute inset-x-0 top-0" aria-hidden />
        <div
          ref={whyReveal.ref}
          className={cn(
            "home-section-shell",
            whyReveal.visible && "about-section--visible",
          )}
        >
          <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
            <p className={cn("about-eyebrow about-reveal")}>{t("why.eyebrow")}</p>
            <h2 className={cn("about-section-title about-reveal mt-3")}>{t("why.title")}</h2>
            <p className={cn("about-section-subtitle about-reveal mx-auto mt-4")}>
              {t("why.description")}
            </p>
          </div>

          <div className="about-bento-grid mt-9 sm:mt-10">
            {BENTO_KEYS.map(({ key, icon: Icon, span }, i) => {
              const featured = key === "aiOrdering";
              return (
                <article
                  key={key}
                  className={cn(
                    "about-bento-card about-reveal group rounded-2xl border p-4 text-start transition-all duration-300 sm:p-5",
                    span === "wide" && "about-bento-card--wide",
                    featured
                      ? "border-purple-200/80 bg-gradient-to-br from-purple-50 via-white to-violet-50/50 shadow-md shadow-purple-500/10 dark:border-purple-500/25 dark:from-purple-500/10 dark:via-slate-900/70 dark:to-slate-900/70"
                      : "border-slate-200/80 bg-white shadow-sm hover:border-purple-200/60 dark:border-slate-700/70 dark:bg-slate-900/60 dark:hover:border-purple-500/30",
                  )}
                  style={{ transitionDelay: `${i * 45}ms` }}
                >
                  <span
                    className={cn(
                      "about-bento-icon mb-3 flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-translate-y-0.5",
                      featured
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                        : "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300",
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white sm:text-[15px]">
                    {t(`why.bento.${key}.title`)}
                  </h3>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-slate-500 dark:text-slate-400 sm:text-[13px]">
                    {t(`why.bento.${key}.hint`)}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="about-section about-section--muted relative overflow-hidden py-12 md:py-16">
        <div className="about-section-divider pointer-events-none absolute inset-x-0 top-0" aria-hidden />
        <div
          ref={trustReveal.ref}
          className={cn(
            "home-section-shell relative z-10",
            trustReveal.visible && "about-section--visible",
          )}
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className={cn("about-eyebrow about-reveal")}>{t("trust.eyebrow")}</p>
            <h2 className={cn("about-section-title about-reveal mt-3")}>{t("trust.title")}</h2>
          </div>
          <MarketingTrustFeatures
            features={trustFeatures}
            variant="muted"
            columns={3}
            className="mt-8"
          />
        </div>
      </section>

      {/* Differentiators */}
      <section className="about-section relative py-14 md:py-16">
        <div className="about-section-divider pointer-events-none absolute inset-x-0 top-0" aria-hidden />
        <div
          ref={diffReveal.ref}
          className={cn(
            "home-section-shell",
            diffReveal.visible && "about-section--visible",
          )}
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className={cn("about-eyebrow about-reveal")}>{t("different.eyebrow")}</p>
            <h2 className={cn("about-section-title about-reveal mt-3")}>
              {t("different.title")}
            </h2>
          </div>

          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {DIFF_KEYS.map((key, i) => {
              const Icon = DIFF_ICONS[key];
              const featured = key === "ai";
              return (
                <article
                  key={key}
                  className={cn(
                    "about-diff-card about-reveal group rounded-2xl border p-4 text-start transition-all duration-300 sm:p-5",
                    featured
                      ? "border-purple-200/80 bg-gradient-to-br from-purple-50 via-white to-white shadow-md shadow-purple-500/10 dark:border-purple-500/25 dark:from-purple-500/10 dark:via-slate-900/70 dark:to-slate-900/70"
                      : "border-slate-200/80 bg-white shadow-sm hover:border-purple-200/60 dark:border-slate-700/70 dark:bg-slate-900/60 dark:hover:border-purple-500/30",
                  )}
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  <span
                    className={cn(
                      "mb-3 flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-translate-y-0.5",
                      featured
                        ? "bg-purple-600 text-white"
                        : "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300",
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white sm:text-[15px]">
                    {t(`different.items.${key}.title`)}
                  </h3>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-slate-500 dark:text-slate-400 sm:text-[13px]">
                    {t(`different.items.${key}.hint`)}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Vision / Mission */}
      <section className="about-section about-section--muted relative py-14 md:py-16">
        <div className="about-section-divider pointer-events-none absolute inset-x-0 top-0" aria-hidden />
        <div
          ref={visionReveal.ref}
          className={cn(
            "home-section-shell",
            visionReveal.visible && "about-section--visible",
          )}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <article className="about-reveal about-vision-card relative overflow-hidden rounded-3xl border border-purple-200/50 bg-gradient-to-br from-purple-600 to-indigo-700 p-6 text-start text-white shadow-xl shadow-purple-900/20 sm:p-8 rtl:bg-gradient-to-bl">
              <p className="text-[11px] font-bold uppercase tracking-widest text-purple-200">
                {t("vision.label")}
              </p>
              <p className="mt-4 text-xl font-black leading-snug sm:text-2xl">{t("vision.text")}</p>
            </article>
            <article className="about-reveal rounded-3xl border border-slate-200/80 bg-white p-6 text-start shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70 sm:p-8">
              <p className="text-[11px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">
                {t("mission.label")}
              </p>
              <p className="mt-4 text-xl font-black leading-snug text-slate-900 dark:text-white sm:text-2xl">
                {t("mission.text")}
              </p>
            </article>
          </div>

          <div className="about-reveal mt-8 text-center sm:mt-10">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {t("builtInEgypt")}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="home-cta-section relative overflow-x-clip">
        <div
          ref={ctaReveal.ref}
          className={cn(
            "home-section-shell relative z-[1] pb-2 pt-12 sm:pb-4 sm:pt-14 lg:pt-16",
            ctaReveal.visible && "home-cta-showcase--visible",
          )}
        >
          <div className="home-cta-showcase relative">
            <div className="relative flex flex-col gap-8 lg:flex-row-reverse lg:items-center lg:gap-14 xl:gap-16">
              <div className="home-cta-content min-w-0 flex-1 text-center lg:text-start">
                <span className="home-cta-badge mb-4 inline-flex items-center gap-2 rounded-full border border-purple-400/25 bg-purple-500/10 px-3.5 py-1 text-[11px] font-semibold text-purple-200">
                  <FiZap size={13} className="text-purple-300" aria-hidden />
                  {t("cta.badge")}
                </span>

                <h2 className="text-[1.65rem] font-bold leading-[1.15] tracking-tight text-white sm:text-[2rem] lg:text-[2.35rem]">
                  {t("cta.titleBefore")}{" "}
                  <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent rtl:bg-gradient-to-l">
                    {t("cta.titleAccent")}
                  </span>
                </h2>

                <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-slate-300 sm:text-base lg:mx-0">
                  {t("cta.subtitle")}
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                  <Link
                    href="/auth/register"
                    prefetch={false}
                    className="home-cta-btn-primary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold text-white shadow-[0_8px_32px_-8px_rgba(124,58,237,0.65)] transition-transform hover:scale-[1.02]"
                  >
                    <FiZap size={16} aria-hidden />
                    {t("cta.primary")}
                  </Link>
                  <Link
                    href="/Pricing"
                    prefetch={false}
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-[14px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
                  >
                    {t("cta.secondary")}
                  </Link>
                </div>
              </div>

              <div className="home-cta-visual hidden shrink-0 lg:block lg:w-[42%] xl:w-[40%]">
                <CtaPhoneMockup
                  restaurantName={t("cta.menu.restaurantName")}
                  items={menuItems}
                  addLabel={t("cta.menu.add")}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
