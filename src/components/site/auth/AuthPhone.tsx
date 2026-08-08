"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  FiBell,
  FiCheck,
  FiLock,
  FiMail,
  FiSearch,
} from "react-icons/fi";
import {
  mockDemoProductImages,
  mockDemoProductPrices,
  type MockDemoProductId,
} from "@/lib/mockDemoProducts";
import { cn } from "@/lib/cn";

export type AuthPhoneVariant =
  | "login"
  | "register"
  | "reset"
  | "staff"
  | "verify";

const MENU_ITEMS: MockDemoProductId[] = [
  "grilledChicken",
  "orangeJuice",
  "cheesecake",
];

function Shell({
  className,
  label,
  children,
}: {
  className?: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[300/610] shrink-0 rounded-[2.5rem] border-[6px] border-site-ink-bg bg-site-ink-bg shadow-site-lg",
        className,
      )}
      aria-label={label}
      role="img"
    >
      <div className="s-daylight relative flex size-full flex-col overflow-hidden rounded-[2rem] bg-site-bg">
        <div className="flex items-center justify-between px-4 pt-3 pb-1 text-[10px] font-semibold text-site-ink/60">
          <span dir="ltr">9:41</span>
          <span aria-hidden className="flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-site-ink/30" />
            <span className="h-1 w-1 rounded-full bg-site-ink/30" />
            <span className="h-1 w-1 rounded-full bg-site-ink/30" />
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

function RegisterScreen() {
  const t = useTranslations("site.demo");
  return (
    <>
      <div className="px-4 pt-2 pb-3">
        <p className="text-[10px] font-semibold tracking-[0.1em] text-site-brand uppercase">
          {t("tableLabel")}
        </p>
        <p className="mt-0.5 font-site-display text-[17px] font-extrabold text-site-ink">
          {t("venueName")}
        </p>
        <div className="mt-2.5 flex items-center gap-2 rounded-full bg-site-tint px-3 py-2 text-[11px] text-site-muted">
          <FiSearch className="size-3.5" aria-hidden />
          {t("searchPlaceholder")}
        </div>
      </div>
      <div className="flex gap-1.5 overflow-hidden px-4 pb-3">
        {[t("catAll"), t("catGrills"), t("catDrinks")].map((cat, i) => (
          <span
            key={cat}
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold",
              i === 0
                ? "bg-site-brand text-white"
                : "bg-site-tint text-site-muted",
            )}
          >
            {cat}
          </span>
        ))}
      </div>
      <ul className="flex-1 space-y-2.5 overflow-hidden px-4 pb-4">
        {MENU_ITEMS.map((id) => (
          <li
            key={id}
            className="flex items-center gap-3 rounded-2xl border border-site-line bg-site-bg p-2 shadow-site-sm"
          >
            <Image
              src={mockDemoProductImages[id]}
              alt=""
              width={96}
              height={96}
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
        ))}
      </ul>
      <div className="border-t border-site-line px-4 py-3">
        <div className="flex h-10 items-center justify-center rounded-xl bg-site-ink-bg text-[12px] font-semibold text-white">
          {t("orderButton")}
        </div>
      </div>
    </>
  );
}

function LoginScreen() {
  const t = useTranslations("site.authPhone.login");
  const menus = [
    { name: t("menuA"), meta: t("menuAMeta"), tone: "brand" as const },
    { name: t("menuB"), meta: t("menuBMeta"), tone: "warm" as const },
  ];

  return (
    <div className="flex flex-1 flex-col px-4 pt-2 pb-4">
      <p className="text-[10px] font-semibold tracking-[0.1em] text-site-brand uppercase">
        {t("eyebrow")}
      </p>
      <p className="mt-0.5 font-site-display text-[17px] font-extrabold text-site-ink">
        {t("heading")}
      </p>

      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-site-brand-line bg-site-brand-tint px-3 py-2.5">
        <span className="flex size-8 items-center justify-center rounded-full bg-site-brand text-[12px] font-bold text-white">
          3
        </span>
        <span className="text-start text-[11px] font-semibold text-site-brand-deep">
          {t("liveOrders")}
        </span>
      </div>

      <ul className="mt-3 space-y-2.5">
        {menus.map((menu) => (
          <li
            key={menu.name}
            className="rounded-2xl border border-site-line bg-site-bg p-3 text-start shadow-site-sm"
          >
            <p className="text-[12px] font-semibold text-site-ink">
              {menu.name}
            </p>
            <p
              className={cn(
                "mt-1 text-[10px] font-semibold",
                menu.tone === "brand" ? "text-site-brand" : "text-site-warm",
              )}
            >
              {menu.meta}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-auto rounded-xl bg-site-tint px-3 py-2.5 text-[11px] font-medium text-site-muted">
        {t("footer")}
      </div>
    </div>
  );
}

function ResetScreen() {
  const t = useTranslations("site.authPhone.reset");
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 pb-8 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-site-brand-tint text-site-brand">
        <FiLock className="size-6" aria-hidden />
      </span>
      <p className="mt-5 font-site-display text-[16px] font-extrabold text-site-ink">
        {t("heading")}
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-site-muted">
        {t("body")}
      </p>
      <div className="mt-5 flex w-full items-center gap-2 rounded-xl border border-site-line bg-site-tint px-3 py-2.5 text-start">
        <FiMail className="size-4 shrink-0 text-site-brand" aria-hidden />
        <span className="truncate text-[11px] font-medium text-site-ink" dir="ltr">
          {t("email")}
        </span>
      </div>
      <p className="mt-4 text-[10px] font-semibold text-site-brand">
        {t("status")}
      </p>
    </div>
  );
}

function StaffScreen() {
  const t = useTranslations("site.authPhone.staff");
  const tables = [
    { id: "12", state: "busy" as const },
    { id: "8", state: "new" as const },
    { id: "3", state: "free" as const },
    { id: "15", state: "busy" as const },
    { id: "5", state: "free" as const },
    { id: "9", state: "busy" as const },
  ];

  return (
    <div className="flex flex-1 flex-col px-4 pt-2 pb-4">
      <div className="flex items-start justify-between gap-2">
        <div className="text-start">
          <p className="text-[10px] font-semibold tracking-[0.1em] text-site-brand uppercase">
            {t("eyebrow")}
          </p>
          <p className="mt-0.5 font-site-display text-[17px] font-extrabold text-site-ink">
            {t("heading")}
          </p>
        </div>
        <span className="relative flex size-9 items-center justify-center rounded-full bg-site-brand-tint text-site-brand">
          <FiBell className="size-4" aria-hidden />
          <span className="absolute -top-0.5 -end-0.5 size-2.5 rounded-full bg-site-critical ring-2 ring-site-bg" />
        </span>
      </div>

      <div className="mt-3 rounded-2xl border border-site-warm/30 bg-site-warm-tint px-3 py-2.5 text-start">
        <p className="text-[10px] font-bold text-site-warm">{t("alert")}</p>
        <p className="mt-0.5 text-[11px] font-semibold text-site-ink">
          {t("alertBody")}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {tables.map((table) => (
          <div
            key={table.id}
            className={cn(
              "flex aspect-square flex-col items-center justify-center rounded-2xl border text-[11px] font-bold",
              table.state === "new" &&
                "border-site-warm bg-site-warm-tint text-site-warm",
              table.state === "busy" &&
                "border-site-brand-line bg-site-brand-tint text-site-brand",
              table.state === "free" &&
                "border-site-line bg-site-bg text-site-muted",
            )}
          >
            <span className="text-[9px] font-semibold opacity-70">
              {t("table")}
            </span>
            <span className="text-[15px]" dir="ltr">
              {table.id}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VerifyScreen() {
  const t = useTranslations("site.authPhone.verify");
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 pb-8 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-site-positive-tint text-site-positive">
        <FiCheck className="size-7" aria-hidden strokeWidth={2.5} />
      </span>
      <p className="mt-5 font-site-display text-[16px] font-extrabold text-site-ink">
        {t("heading")}
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-site-muted">
        {t("body")}
      </p>
      <div className="mt-6 w-full rounded-xl bg-site-ink-bg px-3 py-3 text-[12px] font-semibold text-white">
        {t("cta")}
      </div>
    </div>
  );
}

/**
 * Phone mock for the auth aside. Each screen shows the product moment that
 * page is about — guest menu on register, floor map on staff, and so on —
 * so the panel is not the same picture five times over.
 */
export function AuthPhone({
  variant,
  className,
}: {
  variant: AuthPhoneVariant;
  className?: string;
}) {
  const t = useTranslations(`site.authPhone.${variant}`);

  return (
    <Shell className={className} label={t("label")}>
      {variant === "login" ? <LoginScreen /> : null}
      {variant === "register" ? <RegisterScreen /> : null}
      {variant === "reset" ? <ResetScreen /> : null}
      {variant === "staff" ? <StaffScreen /> : null}
      {variant === "verify" ? <VerifyScreen /> : null}
    </Shell>
  );
}

export default AuthPhone;
