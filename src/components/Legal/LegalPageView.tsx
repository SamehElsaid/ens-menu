"use client";

import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import {
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiCreditCard,
  FiDatabase,
  FiFileText,
  FiInfo,
  FiMail,
  FiShield,
  FiShare2,
  FiSlash,
  FiUser,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { ds } from "@/lib/designSystem";

export type LegalSection = {
  id: string;
  heading: string;
  body: string;
};

export type LegalDocument = {
  title: string;
  subtitle: string;
  badge: string;
  closingCard: string;
  sections: LegalSection[];
};

type LegalPageViewProps = {
  doc: LegalDocument;
  backToHome: string;
  updatedLabel: string;
  tocLabel: string;
  contactCta: string;
};

const SECTION_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  intro: FiInfo,
  acceptance: FiCheckCircle,
  "data-collected": FiDatabase,
  "data-use": FiActivity,
  "data-protection": FiShield,
  ai: HiOutlineSparkles,
  cookies: FiZap,
  "data-sharing": FiShare2,
  "user-responsibility": FiUser,
  "user-rights": FiCheckCircle,
  contact: FiMail,
  service: FiFileText,
  accounts: FiUsers,
  allowed: FiCheckCircle,
  prohibited: FiSlash,
  payment: FiCreditCard,
  suspension: FiAlertTriangle,
  liability: FiShield,
  ip: FiFileText,
  changes: FiActivity,
};

function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? Math.min(100, (scrollTop / max) * 100) : 0);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return progress;
}

function useActiveSection(sectionIds: string[]) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "");

  useEffect(() => {
    const nodes = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [sectionIds]);

  return activeId;
}

function LegalSectionCard({
  section,
  index,
}: {
  section: LegalSection;
  index: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const Icon = SECTION_ICONS[section.id] ?? FiFileText;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id={section.id}
      className={cn(
        "legal-section-card relative scroll-mt-28 rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm sm:p-6 lg:p-7",
        "dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_8px_32px_-16px_rgba(124,58,237,0.15)]",
        visible && "legal-section-card--visible",
      )}
      style={{ transitionDelay: `${Math.min(index * 40, 200)}ms` }}
    >
      <div
        aria-hidden
        className="legal-section-card__glow pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500"
      />
      <div className="relative flex items-start gap-3.5 sm:gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100/90 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400 sm:h-11 sm:w-11">
          <Icon className="size-[18px] sm:size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
            {section.heading}
          </h2>
          <div className="mt-3 space-y-2.5 text-[14px] leading-relaxed text-slate-600 dark:text-slate-300 sm:text-[15px]">
            {section.body.split("\n").map((line) => {
              const trimmed = line.trim();
              if (!trimmed) return null;
              const isBullet = trimmed.startsWith("•");
              return (
                <p
                  key={trimmed}
                  className={cn(isBullet && "flex gap-2 text-start")}
                >
                  {isBullet ? (
                    <>
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-purple-500" aria-hidden />
                      <span>{trimmed.slice(1).trim()}</span>
                    </>
                  ) : (
                    trimmed
                  )}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LegalPageView({
  doc,
  backToHome,
  updatedLabel,
  tocLabel,
  contactCta,
}: LegalPageViewProps) {
  const progress = useScrollProgress();
  const sectionIds = doc.sections.map((s) => s.id);
  const activeId = useActiveSection(sectionIds);
  const mobileTocRef = useRef<HTMLDivElement>(null);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const node = mobileTocRef.current?.querySelector(`[data-section="${activeId}"]`);
    node?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeId]);

  return (
    <div className="legal-page relative min-h-screen bg-gradient-app pb-24 lg:pb-20">
      <div
        className="legal-page__progress pointer-events-none fixed inset-x-0 top-[4.25rem] z-40 h-0.5 bg-transparent sm:top-[4.5rem]"
        aria-hidden
      >
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 transition-[width] duration-150 rtl:bg-gradient-to-l"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -start-24 top-20 h-72 w-72 rounded-full bg-purple-500/12 blur-3xl dark:bg-purple-600/10" />
        <div className="absolute -end-16 top-[38%] h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-600/8" />
        <div className="absolute bottom-0 start-1/3 h-56 w-56 rounded-full bg-violet-400/8 blur-3xl" />
      </div>

      <div className="home-section-shell relative z-10 pt-24 pb-10 sm:pt-28 sm:pb-12 lg:pt-32">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-sm font-semibold text-purple-600 transition-colors hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
        >
          <span aria-hidden className="text-base rtl:rotate-180">
            ←
          </span>
          {backToHome}
        </Link>

        <header className="legal-page__hero relative mx-auto mt-8 max-w-3xl text-center lg:mt-10">
          <div
            aria-hidden
            className="legal-page__hero-glow pointer-events-none absolute left-1/2 top-1/2 h-40 w-[min(100%,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-full"
          />
          <span className={cn(ds.badge, "mb-4 inline-flex")}>
            <span className={ds.badgeDot} aria-hidden />
            {doc.badge}
          </span>
          <h1 className={cn(ds.type.display, "mx-auto max-w-2xl")}>{doc.title}</h1>
          <p className={cn(ds.type.subtitle, "mx-auto mt-4 max-w-2xl text-center")}>
            {doc.subtitle}
          </p>
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
            {updatedLabel}
          </p>
        </header>

        <div className="mx-auto mt-10 grid max-w-6xl gap-8 lg:mt-12 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[16.5rem_minmax(0,1fr)] xl:gap-12">
          <aside className="hidden lg:block">
            <nav
              aria-label={tocLabel}
              className="legal-page__toc sticky top-28 rounded-2xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]"
            >
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {tocLabel}
              </p>
              <ul className="space-y-1">
                {doc.sections.map((section) => (
                  <li key={section.id}>
                    <button
                      type="button"
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        "w-full rounded-lg px-2.5 py-2 text-start text-[13px] font-medium leading-snug transition-colors",
                        activeId === section.id
                          ? "bg-purple-100/90 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300"
                          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white",
                      )}
                    >
                      {section.heading}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="min-w-0">
            <div
              ref={mobileTocRef}
              className="legal-page__toc-mobile -mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
              role="navigation"
              aria-label={tocLabel}
            >
              {doc.sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  data-section={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    "shrink-0 snap-center rounded-full border px-3.5 py-2 text-[12px] font-semibold transition-colors",
                    activeId === section.id
                      ? "border-purple-300/60 bg-purple-600 text-white shadow-[0_4px_20px_-6px_rgba(124,58,237,0.55)] dark:border-purple-500/40 dark:bg-purple-500"
                      : "border-slate-200/80 bg-white/90 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300",
                  )}
                >
                  {section.heading}
                </button>
              ))}
            </div>

            <div className="space-y-4 sm:space-y-5">
              {doc.sections.map((section, index) => (
                <LegalSectionCard key={section.id} section={section} index={index} />
              ))}
            </div>

            <div className="legal-page__closing relative mt-8 overflow-hidden rounded-2xl border border-purple-200/50 bg-gradient-to-br from-purple-50/90 via-white to-indigo-50/50 p-6 text-center shadow-[0_12px_40px_-20px_rgba(124,58,237,0.35)] sm:p-8 dark:border-purple-500/25 dark:from-purple-950/40 dark:via-[#12151f] dark:to-indigo-950/30">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.12),transparent_65%)]"
              />
              <p className="relative text-base font-semibold leading-relaxed text-slate-800 dark:text-slate-100 sm:text-lg">
                {doc.closingCard}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="legal-page__sticky-cta pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 sm:bottom-6">
        <Link
          href="/contact"
          prefetch={false}
          className="pointer-events-auto inline-flex w-full max-w-md items-center justify-center rounded-full bg-purple-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_40px_-10px_rgba(124,58,237,0.65)] transition-transform hover:scale-[1.02] sm:w-auto sm:min-w-[14rem] dark:bg-purple-500"
        >
          {contactCta}
        </Link>
      </div>
    </div>
  );
}
