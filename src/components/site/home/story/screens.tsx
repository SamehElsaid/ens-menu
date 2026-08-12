"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  FiCheck,
  FiChevronLeft,
  FiDownload,
  FiEye,
  FiFile,
  FiSearch,
  FiZap,
} from "react-icons/fi";
import {
  mockDemoProductImages,
  mockDemoProductPrices,
  type MockDemoProductId,
} from "@/lib/mockDemoProducts";
import { cn } from "@/lib/cn";
import { StyledQrCode } from "@/components/Global/StyledQrCode";

/**
 * The product, drawn at phone size.
 *
 * Six states, all of them things ENSMENU actually does: the guest menu a
 * diner sees, the three screens of the AI import (upload → read → review),
 * the published QR, and the guest menu again with the code live. Nothing here
 * is invented to make an animation look good — the copy comes from the same
 * `site.demo` / `site.story` keys the rest of the site uses, the dishes and
 * prices from `mockDemoProducts`, the paper photograph from the hero, and the
 * QR from the same `StyledQrCode` the owner console renders.
 *
 * Every animatable part carries `data-part`, so the story director in
 * `StoryPhone` can choreograph a screen without knowing how it is built.
 */

export const PHONE_STATES = [
  "menu",
  "upload",
  "extract",
  "review",
  "publish",
  "live",
] as const;

export type PhoneState = (typeof PHONE_STATES)[number];

/** Chapters of the story section, in scroll order, and the state each shows. */
export const STORY_CHAPTERS = [
  { id: "upload", state: "upload" },
  { id: "extract", state: "extract" },
  { id: "review", state: "review" },
  { id: "publish", state: "publish" },
] as const;

const MENU_ITEMS: MockDemoProductId[] = [
  "grilledChicken",
  "orangeJuice",
  "cheesecake",
  "potatoWedges",
];

/* -------------------------------------------------------------------------- */
/* Frame + chrome                                                              */
/* -------------------------------------------------------------------------- */

/**
 * The device. `s-daylight` pins the screen light: a guest's phone does not
 * follow this visitor's theme.
 */
export function PhoneFrame({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "relative aspect-[300/610] rounded-[2.5rem] border-[6px] border-site-ink-bg bg-site-ink-bg shadow-site-lg",
        className,
      )}
    >
      <div className="s-daylight relative size-full overflow-hidden rounded-[2rem] bg-site-bg">
        {children}
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-1 text-[10px] font-semibold text-site-ink/60">
      <span dir="ltr">9:41</span>
      <span aria-hidden className="flex items-center gap-1">
        <span className="size-1 rounded-full bg-site-ink/30" />
        <span className="size-1 rounded-full bg-site-ink/30" />
        <span className="size-1 rounded-full bg-site-ink/30" />
      </span>
    </div>
  );
}

/** Owner-side header. The console is used on phones, so this is its shape. */
function OwnerChrome({
  title,
  step,
  chip,
}: {
  title: string;
  step: number;
  chip?: string;
}) {
  const t = useTranslations("site.story.phone");
  return (
    <div className="border-b border-site-line px-4 pt-2 pb-3">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="flex size-6 items-center justify-center rounded-lg bg-site-tint text-site-muted"
        >
          <FiChevronLeft className="size-3.5 rtl:rotate-180" />
        </span>
        <p className="flex-1 truncate text-[12px] font-bold text-site-ink">
          {title}
        </p>
        {chip ? (
          <span className="flex items-center gap-1 rounded-full bg-site-brand-tint px-2 py-0.5 text-[9px] font-bold tracking-[0.08em] text-site-brand-text">
            <FiZap className="size-2.5" aria-hidden />
            {chip}
          </span>
        ) : null}
      </div>
      <div className="mt-2.5 flex items-center gap-1.5">
        {[1, 2, 3, 4].map((index) => (
          <span
            key={index}
            className={cn(
              "h-1 flex-1 rounded-full",
              index <= step ? "bg-site-brand" : "bg-site-line",
            )}
          />
        ))}
      </div>
      <p className="mt-1.5 text-[9px] font-semibold tracking-[0.08em] text-site-muted uppercase">
        {t("stepOf", { index: step })}
      </p>
    </div>
  );
}

function LivePill({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-site-positive-tint px-2 py-0.5 text-[9px] font-bold tracking-[0.1em] text-site-positive">
      <span className="size-1.5 rounded-full bg-site-positive" aria-hidden />
      {label}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* 01 — the guest menu                                                         */
/* -------------------------------------------------------------------------- */

function DishRow({
  id,
  priority,
}: {
  id: MockDemoProductId;
  priority?: boolean;
}) {
  const t = useTranslations("site.demo");
  return (
    <li
      data-part="row"
      className="flex items-center gap-3 rounded-2xl border border-site-line bg-site-bg p-2 shadow-site-sm"
    >
      <Image
        src={mockDemoProductImages[id]}
        alt=""
        width={96}
        height={96}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        sizes="56px"
        className="size-14 shrink-0 rounded-xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-semibold text-site-ink">
          {t(`items.${id}`)}
        </p>
        <p className="mt-0.5 text-[11px] font-bold text-site-brand">
          {mockDemoProductPrices[id]} {t("currency")}
        </p>
      </div>
      <span
        aria-hidden
        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-site-brand text-[15px] leading-none font-bold text-white"
      >
        +
      </span>
    </li>
  );
}

export function ScreenMenu({
  live = false,
  priority = false,
}: {
  /** The closing beat: the same menu, now published and being scanned. */
  live?: boolean;
  priority?: boolean;
}) {
  const t = useTranslations("site.demo");
  const s = useTranslations("site.story.phone");
  const chips = [t("catAll"), t("catGrills"), t("catDrinks"), t("catDesserts")];

  return (
    <div className="flex size-full flex-col">
      <StatusBar />

      <div className="px-4 pt-2 pb-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold tracking-[0.1em] text-site-brand uppercase">
            {t("tableLabel")}
          </p>
          {live ? (
            <span data-part="live">
              <LivePill label={s("livePill")} />
            </span>
          ) : null}
        </div>
        {/* Not a heading: the whole mock is one `role="img"`, and a venue that
            does not exist should not appear in the page outline. */}
        <p className="mt-0.5 font-site-display text-[17px] font-extrabold text-site-ink">
          {t("venueName")}
        </p>
        <div
          data-part="search"
          className="mt-2.5 flex items-center gap-2 rounded-full bg-site-tint px-3 py-2 text-[11px] text-site-muted"
        >
          <FiSearch className="size-3.5" aria-hidden />
          {t("searchPlaceholder")}
        </div>
      </div>

      <div className="flex gap-1.5 overflow-hidden px-4 pb-3">
        {chips.map((chip, index) => (
          <span
            key={chip}
            data-part="chip"
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold",
              index === 0
                ? "bg-site-brand text-white"
                : "bg-site-tint text-site-muted",
            )}
          >
            {chip}
          </span>
        ))}
      </div>

      <ul className="flex-1 space-y-2.5 overflow-hidden px-4 pb-4">
        {MENU_ITEMS.map((id, index) => (
          <DishRow key={id} id={id} priority={priority && index === 0} />
        ))}
      </ul>

      <div
        data-part="bar"
        className="border-t border-site-line px-4 py-3"
      >
        <div className="flex h-10 items-center justify-center rounded-xl bg-site-ink-bg text-[12px] font-semibold text-white">
          {t("orderButton")}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 02 — upload                                                                 */
/* -------------------------------------------------------------------------- */

function PaperPhoto({ className }: { className?: string }) {
  const t = useTranslations("site.hero");
  return (
    <Image
      src="/images/demo/paper-menu.jpg"
      alt={t("paperAlt")}
      width={300}
      height={400}
      sizes="220px"
      /* The photograph is mostly dark table around a centred sheet, so the crop
         is pushed up to keep the printed page in frame. */
      className={cn("aspect-3/4 w-full object-cover object-[50%_35%]", className)}
    />
  );
}

export function ScreenUpload() {
  const s = useTranslations("site.story.phone");

  return (
    <div className="flex size-full flex-col">
      <StatusBar />
      <OwnerChrome title={s("importTitle")} step={1} />

      <div className="flex flex-1 flex-col px-4 pt-4 pb-4">
        <div
          data-part="drop"
          className="rounded-2xl border-2 border-dashed border-site-brand-line bg-site-brand-tint/40 p-2.5"
        >
          <div
            data-part="photo"
            className="overflow-hidden rounded-xl border border-site-line bg-[#f3ebe0] shadow-site-sm"
          >
            <PaperPhoto />
          </div>

          <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-site-line bg-site-bg p-2">
            <span
              aria-hidden
              className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-site-brand-tint text-site-brand-text"
            >
              <FiFile className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p
                dir="ltr"
                className="truncate text-start text-[11px] font-semibold text-site-ink"
              >
                {s("fileName")}
              </p>
              <p className="text-[9px] text-site-muted">{s("fileMeta")}</p>
            </div>
            <span
              data-part="percent"
              className="text-[10px] font-bold text-site-brand-text tabular-nums"
            >
              0%
            </span>
          </div>

          <div className="mt-2 h-1 overflow-hidden rounded-full bg-site-line">
            <span
              data-part="bar-fill"
              className="block h-full w-full origin-left rounded-full bg-site-brand"
            />
          </div>
        </div>

        <p
          data-part="hint"
          className="mt-auto pt-4 text-center text-[10px] leading-relaxed text-site-muted"
        >
          {s("uploadHint")}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 03 — the AI read                                                            */
/* -------------------------------------------------------------------------- */

const EXTRACTED: Array<{ id: MockDemoProductId; cat: string }> = [
  { id: "grilledChicken", cat: "catGrills" },
  { id: "potatoWedges", cat: "catSides" },
  { id: "orangeJuice", cat: "catDrinks" },
  { id: "cheesecake", cat: "catDesserts" },
];

export function ScreenExtract() {
  const s = useTranslations("site.story.phone");
  const demo = useTranslations("site.demo");

  return (
    <div className="flex size-full flex-col">
      <StatusBar />
      <OwnerChrome title={s("readingTitle")} step={2} chip={s("aiChip")} />

      <div className="px-4 pt-3">
        <div className="flex items-center gap-3">
          <div
            data-part="scan"
            className="relative w-14 shrink-0 overflow-hidden rounded-lg border border-site-line bg-[#f3ebe0]"
          >
            <PaperPhoto />
            <span
              aria-hidden
              data-part="scanline"
              className="s-story-scanline absolute inset-x-0 top-0 h-1/3"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p
              data-part="count"
              className="font-site-display text-[15px] font-extrabold text-site-ink tabular-nums"
            >
              {s("found", { items: 12, categories: 4 })}
            </p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-site-line">
              <span
                data-part="bar-fill"
                className="block h-full w-full origin-left rounded-full bg-site-brand"
              />
            </div>
          </div>
        </div>
      </div>

      <ul className="mt-3 flex-1 space-y-1.5 overflow-hidden px-4 pb-4">
        {EXTRACTED.map(({ id, cat }) => (
          <li
            key={id}
            data-part="row"
            className="flex items-center gap-2 rounded-xl border border-site-line bg-site-bg px-2.5 py-2 shadow-site-sm"
          >
            <span className="shrink-0 rounded-full bg-site-tint px-1.5 py-0.5 text-[8px] font-bold text-site-muted">
              {cat === "catSides" ? s("catSides") : demo(cat)}
            </span>
            <p className="min-w-0 flex-1 truncate text-[11px] font-semibold text-site-ink">
              {demo(`items.${id}`)}
            </p>
            <p className="text-[10px] font-bold text-site-ink tabular-nums">
              {mockDemoProductPrices[id]}
            </p>
            <span
              aria-hidden
              data-part="tick"
              className="flex size-4 shrink-0 items-center justify-center rounded-full bg-site-positive-tint text-site-positive"
            >
              <FiCheck className="size-2.5" />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 04 — review                                                                 */
/* -------------------------------------------------------------------------- */

export function ScreenReview() {
  const s = useTranslations("site.story.phone");
  const demo = useTranslations("site.demo");

  return (
    <div className="flex size-full flex-col">
      <StatusBar />
      <OwnerChrome title={s("reviewTitle")} step={3} />

      <div className="flex flex-1 flex-col px-4 pt-3 pb-4">
        <div
          data-part="card"
          className="rounded-2xl border border-site-brand-line bg-site-bg p-2.5 shadow-site"
        >
          <div className="flex items-center gap-2.5">
            <Image
              src={mockDemoProductImages.cheesecake}
              alt=""
              width={96}
              height={96}
              sizes="48px"
              className="size-12 shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-site-ink">
                {demo("items.cheesecake")}
              </p>
              <p className="text-[9px] text-site-muted">
                {demo("catDesserts")}
              </p>
            </div>
            <span
              data-part="saved"
              className="flex items-center gap-1 rounded-full bg-site-positive-tint px-1.5 py-0.5 text-[8px] font-bold text-site-positive"
            >
              <FiCheck className="size-2.5" aria-hidden />
              {s("savedLabel")}
            </span>
          </div>

          <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-site-brand bg-site-brand-tint/50 px-2.5 py-2">
            <p className="text-[9px] font-bold tracking-[0.08em] text-site-muted uppercase">
              {s("priceLabel")}
            </p>
            <p className="ms-auto flex items-baseline gap-1">
              <span
                data-part="price"
                className="font-site-display text-[15px] font-extrabold text-site-ink tabular-nums"
              >
                {mockDemoProductPrices.cheesecake}
              </span>
              <span className="text-[9px] font-semibold text-site-muted">
                {demo("currency")}
              </span>
            </p>
            <span
              aria-hidden
              data-part="caret"
              className="ms-1 h-4 w-px bg-site-brand"
            />
          </div>

          <div className="mt-2 flex items-center gap-2 rounded-xl border border-site-line px-2.5 py-2">
            <p className="flex-1 text-[10px] font-semibold text-site-ink">
              {s("availableLabel")}
            </p>
            <span
              aria-hidden
              data-part="toggle"
              className="relative flex h-4 w-7 items-center rounded-full bg-site-brand px-0.5"
            >
              <span
                data-part="knob"
                className="size-3 rounded-full bg-white shadow-site-sm"
              />
            </span>
          </div>
        </div>

        <ul className="mt-2 space-y-1.5" data-part="rest">
          {(["grilledChicken", "orangeJuice"] as const).map((id) => (
            <li
              key={id}
              className="flex items-center gap-2 rounded-xl border border-site-line bg-site-bg/70 px-2.5 py-2"
            >
              <p className="min-w-0 flex-1 truncate text-[10px] font-medium text-site-muted">
                {demo(`items.${id}`)}
              </p>
              <p className="text-[10px] font-semibold text-site-muted tabular-nums">
                {mockDemoProductPrices[id]}
              </p>
            </li>
          ))}
        </ul>

        <div data-part="bar" className="mt-auto pt-3">
          <div className="flex h-10 items-center justify-center rounded-xl bg-site-brand text-[12px] font-bold text-white shadow-site-brand">
            {s("publishCta")}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 05 — published                                                              */
/* -------------------------------------------------------------------------- */

/** The real menu URL shape, so the code resolves to something that exists. */
const QR_VALUE = "https://ensmenu.com";

export function ScreenPublish({ qrReady }: { qrReady: boolean }) {
  const s = useTranslations("site.story.phone");
  const demo = useTranslations("site.demo");

  return (
    <div className="flex size-full flex-col">
      <StatusBar />

      <div className="flex items-center gap-2 px-4 pt-2 pb-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-site-display text-[15px] font-extrabold text-site-ink">
            {demo("venueName")}
          </p>
          <p className="text-[9px] text-site-muted">{s("liveTitle")}</p>
        </div>
        <span data-part="live">
          <LivePill label={s("livePill")} />
        </span>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4">
        <div
          data-part="qr-card"
          className="flex flex-col items-center rounded-2xl border border-site-line bg-white p-3 shadow-site"
        >
          <div
            data-part="qr"
            className="flex size-30 items-center justify-center overflow-hidden rounded-xl"
          >
            {qrReady ? (
              <StyledQrCode value={QR_VALUE} size={360} displaySize={120} />
            ) : (
              <span
                aria-hidden
                className="s-skeleton block size-full rounded-xl"
              />
            )}
          </div>
          <p
            dir="ltr"
            className="mt-2 rounded-full bg-site-tint px-2 py-0.5 text-[9px] font-semibold text-site-ink"
          >
            {s("menuUrl")}
          </p>
        </div>

        <p
          data-part="hint"
          className="mt-2.5 text-center text-[9px] text-site-muted"
        >
          {s("scanHint")}
        </p>

        <div className="mt-2.5 grid grid-cols-2 gap-2" data-part="stats">
          <div className="rounded-xl border border-site-line bg-site-bg p-2">
            <p className="flex items-center gap-1 text-[8px] font-bold tracking-[0.08em] text-site-muted uppercase">
              <FiEye className="size-2.5" aria-hidden />
              {s("viewsLabel")}
            </p>
            <p
              data-part="views"
              className="mt-0.5 font-site-display text-[15px] font-extrabold text-site-ink tabular-nums"
            >
              847
            </p>
          </div>
          <div className="rounded-xl border border-site-line bg-site-bg p-2">
            <p className="text-[8px] font-bold tracking-[0.08em] text-site-muted uppercase">
              {demo("tableLabel")}
            </p>
            <p className="mt-0.5 font-site-display text-[15px] font-extrabold text-site-ink">
              QR
            </p>
          </div>
        </div>

        <div data-part="bar" className="mt-auto pt-3">
          <div className="flex h-10 items-center justify-center gap-2 rounded-xl border border-site-line bg-site-bg text-[11px] font-semibold text-site-ink">
            <FiDownload className="size-3.5" aria-hidden />
            {s("downloadQr")}
          </div>
        </div>
      </div>
    </div>
  );
}
