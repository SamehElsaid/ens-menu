"use client";

import Image from "next/image";
import { FiCheck, FiX } from "react-icons/fi";
import CtaPhoneMockup, { type CtaMenuItem } from "@/components/HomePage/CtaPhoneMockup";
import { cn } from "@/lib/cn";

const PAPER_MENU_IMAGE = "/images/demo/paper-menu.jpg";

type TransformBeforeAfterProps = {
  beforeLabel: string;
  afterLabel: string;
  beforeItems: string[];
  afterItems: string[];
  beforeFooter: string;
  afterFooter: string;
  paperMenuAlt: string;
  restaurantName: string;
  menuItems: CtaMenuItem[];
  addLabel: string;
};

function PaperMenuVisual({ alt }: { alt: string }) {
  return (
    <div className="transform-paper-stage relative mx-auto w-full max-w-[19rem] sm:max-w-[21rem]">
      <div
        aria-hidden
        className="transform-paper-glow pointer-events-none absolute -inset-4 rounded-[2rem] bg-amber-500/12 blur-3xl dark:bg-amber-600/8"
      />

      <div className="transform-paper-table relative overflow-hidden rounded-[1.15rem] border border-amber-900/10 px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_50px_-28px_rgba(61,43,31,0.55)] sm:px-5 sm:py-6 dark:border-amber-500/10">
        <div
          aria-hidden
          className="transform-paper-warm-light pointer-events-none absolute inset-0"
        />
        <div
          aria-hidden
          className="transform-paper-vignette pointer-events-none absolute inset-0"
        />

        <div
          aria-hidden
          className="transform-paper-back absolute inset-x-[14%] top-[14%] h-[78%] rotate-[6deg] rounded-[3px] bg-[#ebe4d8]/90 shadow-[0_4px_14px_-6px_rgba(15,23,42,0.35)] dark:bg-[#2e2b27]"
        />

        <div className="transform-paper-sheet relative mx-auto w-[90%] max-w-[15.5rem] sm:max-w-[16.5rem]">
          <div
            aria-hidden
            className="transform-paper-stain pointer-events-none absolute bottom-[14%] start-[8%] z-10 h-12 w-16 rounded-full bg-amber-950/20 blur-md"
          />
          <div
            aria-hidden
            className="transform-paper-stain-ring pointer-events-none absolute bottom-[10%] start-[4%] z-10 h-20 w-24 rounded-full bg-amber-900/10 blur-xl"
          />

          <div className="transform-paper-photo relative overflow-hidden rounded-[3px] border border-amber-900/15 shadow-[0_18px_48px_-16px_rgba(15,23,42,0.45),0_6px_18px_-8px_rgba(61,43,31,0.35)] dark:border-amber-500/15">
            <Image
              src={PAPER_MENU_IMAGE}
              alt={alt}
              width={520}
              height={680}
              className="transform-paper-image h-auto w-full object-cover"
              sizes="(max-width: 640px) 72vw, 16.5rem"
              priority
            />

            <div aria-hidden className="transform-paper-grade pointer-events-none absolute inset-0" />
            <div aria-hidden className="transform-paper-edge-blur pointer-events-none absolute inset-0" />
            <div aria-hidden className="transform-paper-noise pointer-events-none absolute inset-0" />

            <div
              aria-hidden
              className="pointer-events-none absolute end-0 top-0 h-0 w-0 border-s-[2.25rem] border-t-[2.25rem] border-s-transparent border-t-[#d9d0c2] shadow-[-2px_2px_6px_rgba(15,23,42,0.12)] dark:border-t-[#3a3630]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute end-0 top-0 h-[2.25rem] w-[2.25rem] bg-gradient-to-bl from-white/25 via-transparent to-transparent"
            />
          </div>
        </div>

        <div
          aria-hidden
          className="transform-paper-shadow pointer-events-none absolute inset-x-[12%] -bottom-1 h-4 rounded-[100%] bg-amber-950/25 blur-md dark:bg-black/50"
        />
      </div>
    </div>
  );
}

function SmartMenuVisual({
  restaurantName,
  menuItems,
  addLabel,
}: {
  restaurantName: string;
  menuItems: CtaMenuItem[];
  addLabel: string;
}) {
  return (
    <div className="transform-smart-scene relative mx-auto w-full max-w-[15.5rem] sm:max-w-[17rem]">
      <CtaPhoneMockup
        restaurantName={restaurantName}
        items={menuItems}
        addLabel={addLabel}
        className="transform-smart-mockup max-w-none"
      />
    </div>
  );
}

function PainPointList({
  items,
  variant,
}: {
  items: string[];
  variant: "before" | "after";
}) {
  const isBefore = variant === "before";

  return (
    <ul
      className={cn(
        "grid gap-2 sm:grid-cols-2 sm:gap-x-3 sm:gap-y-2",
        isBefore ? "sm:gap-y-2.5" : "sm:gap-y-2.5",
      )}
    >
      {items.map((item) => (
        <li
          key={item}
          className={cn(
            "flex items-start gap-2 text-start text-[12.5px] leading-snug sm:text-[13px]",
            isBefore
              ? "text-slate-600 dark:text-slate-400"
              : "text-slate-700 dark:text-slate-300",
          )}
        >
          <span
            className={cn(
              "mt-0.5 flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center rounded-full",
              isBefore
                ? "bg-slate-200/80 text-slate-500 dark:bg-slate-800"
                : "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
            )}
          >
            {isBefore ? <FiX size={11} /> : <FiCheck size={11} strokeWidth={3} />}
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function TransformBeforeAfter({
  beforeLabel,
  afterLabel,
  beforeItems,
  afterItems,
  beforeFooter,
  afterFooter,
  paperMenuAlt,
  restaurantName,
  menuItems,
  addLabel,
}: TransformBeforeAfterProps) {
  return (
    <div className="relative grid gap-6 sm:gap-7 lg:grid-cols-2 lg:items-stretch lg:gap-8">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-purple-100 bg-white text-purple-500 shadow-[0_4px_20px_-8px_rgba(124,58,237,0.2)] lg:flex dark:border-purple-500/20 dark:bg-[#0d1117]"
      >
        <span className="text-sm rtl:rotate-180">→</span>
      </div>

      <article className="transform-panel transform-panel--before flex flex-col overflow-hidden rounded-[1.25rem] border border-amber-200/40 bg-gradient-to-b from-amber-50/40 to-slate-50/60 shadow-[0_4px_24px_-16px_rgba(120,80,40,0.12)] dark:border-amber-500/10 dark:from-amber-950/10 dark:to-slate-900/25">
        <div className="border-b border-amber-200/35 px-5 py-3 dark:border-amber-500/10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/90 px-3 py-0.5 text-xs font-semibold text-amber-900/80 dark:bg-amber-500/10 dark:text-amber-200/80">
            <FiX size={12} />
            {beforeLabel}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-4 p-4 sm:gap-5 sm:p-6">
          <div className="flex items-center justify-center py-2 sm:min-h-[14.5rem] sm:py-0 lg:min-h-[16rem]">
            <PaperMenuVisual alt={paperMenuAlt} />
          </div>
          <PainPointList items={beforeItems} variant="before" />
        </div>
        <p className="border-t border-amber-200/35 bg-amber-100/50 px-5 py-3 text-center text-xs text-amber-950/70 dark:border-amber-500/10 dark:bg-amber-950/20 dark:text-amber-100/70">
          {beforeFooter}
        </p>
      </article>

      <article className="transform-panel transform-panel--after flex flex-col overflow-visible rounded-[1.25rem] border border-purple-200/45 bg-white shadow-[0_4px_24px_-16px_rgba(124,58,237,0.12)] dark:border-purple-500/20 dark:bg-[#0d1117]">
        <div className="border-b border-purple-100/60 px-5 py-3 dark:border-purple-500/15">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-3 py-0.5 text-xs font-semibold text-white dark:bg-purple-500">
            <FiCheck size={12} />
            {afterLabel}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-4 overflow-visible p-4 sm:gap-5 sm:p-6">
          <div className="flex items-center justify-center overflow-visible py-2 sm:min-h-[14rem] sm:py-1 lg:min-h-[16rem]">
            <SmartMenuVisual
              restaurantName={restaurantName}
              menuItems={menuItems}
              addLabel={addLabel}
            />
          </div>
          <PainPointList items={afterItems} variant="after" />
        </div>
        <p className="rounded-b-[1.25rem] border-t border-purple-100/60 bg-purple-600/90 px-5 py-3 text-center text-xs font-medium text-white dark:border-purple-500/20 dark:bg-purple-600/80">
          {afterFooter}
        </p>
      </article>
    </div>
  );
}
