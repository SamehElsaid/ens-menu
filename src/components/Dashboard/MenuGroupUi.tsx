"use client";

import type { ReactNode } from "react";
import { IoCheckmark, IoCloseOutline, IoGitNetworkOutline, IoRestaurant } from "react-icons/io5";
import LoadImage from "@/components/ImageLoad";
import CustomBtn from "@/components/Custom/CustomBtn";
import type { Menu } from "@/types/Menu";

const TEAL = {
  header:
    "bg-linear-to-br from-teal-600 via-teal-600 to-emerald-700 dark:from-teal-800 dark:via-teal-800 dark:to-emerald-900",
  ring: "ring-teal-500/40 dark:ring-teal-400/30",
  selected:
    "border-teal-500 bg-teal-50/90 shadow-sm shadow-teal-500/10 dark:border-teal-500/70 dark:bg-teal-950/50",
  idle:
    "border-slate-200/90 bg-white hover:border-teal-300/60 hover:bg-teal-50/40 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-teal-700/50 dark:hover:bg-teal-950/20",
};

type MenuGroupModalShellProps = {
  title: string;
  subtitle?: string;
  onClose: () => void;
  closeLabel: string;
  isRTL?: boolean;
  children: ReactNode;
  footer: ReactNode;
  maxWidth?: "md" | "lg";
};

export function MenuGroupModalShell({
  title,
  subtitle,
  onClose,
  closeLabel,
  isRTL = false,
  children,
  footer,
  maxWidth = "lg",
}: MenuGroupModalShellProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      dir={isRTL ? "rtl" : "ltr"}
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl ring-1 ring-slate-200/80 dark:bg-slate-900 dark:ring-slate-700/80 sm:rounded-3xl ${
          maxWidth === "md" ? "sm:max-w-md" : "sm:max-w-lg"
        }`}
      >
        <div className={`relative px-5 pb-5 pt-5 text-white ${TEAL.header}`}>
          <div className="pointer-events-none absolute -end-8 -top-8 size-32 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-6 start-8 size-24 rounded-full bg-emerald-400/20 blur-xl" />
          <div className="relative flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
              <IoGitNetworkOutline className="text-2xl" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <h2 className="text-lg font-bold leading-snug sm:text-xl">{title}</h2>
              {subtitle ? (
                <p className="mt-1 text-sm leading-relaxed text-teal-50/90">{subtitle}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/90 transition hover:bg-white/20"
              aria-label={closeLabel}
            >
              <IoCloseOutline className="text-xl" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>

        <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/80">
          {footer}
        </div>
      </div>
    </div>
  );
}

type MenuGroupModalFooterProps = {
  cancelLabel: string;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: () => void;
  loading?: boolean;
  disabled?: boolean;
  selectedCount?: number;
  selectedCountLabel?: string;
};

export function MenuGroupModalFooter({
  cancelLabel,
  submitLabel,
  onCancel,
  onSubmit,
  loading = false,
  disabled = false,
  selectedCount,
  selectedCountLabel,
}: MenuGroupModalFooterProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {selectedCount != null && selectedCountLabel ? (
        <span className="inline-flex w-fit items-center rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-800 dark:bg-teal-900/50 dark:text-teal-200 sm:me-auto">
          {selectedCountLabel}
        </span>
      ) : (
        <span className="hidden sm:block sm:me-auto" />
      )}
      <div className="flex gap-2 sm:ms-auto sm:min-w-[240px]">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          {cancelLabel}
        </button>
        <CustomBtn
          onClick={onSubmit}
          loading={loading}
          disabled={disabled}
          className="flex-1! rounded-xl!"
        >
          {submitLabel}
        </CustomBtn>
      </div>
    </div>
  );
}

export function MenuGroupSectionLabel({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-3">
      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{children}</p>
      {hint ? (
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

type MenuGroupPickItemProps = {
  menu: Menu;
  name: string;
  selected: boolean;
  onToggle: () => void;
  badge?: string;
  mode?: "checkbox" | "radio";
  nameAttr?: string;
};

export function MenuGroupPickItem({
  menu,
  name,
  selected,
  onToggle,
  badge,
  mode = "checkbox",
  nameAttr,
}: MenuGroupPickItemProps) {
  return (
    <li>
      <label
        className={`group flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-all duration-200 ${
          selected ? TEAL.selected : TEAL.idle
        } ${selected ? `ring-2 ${TEAL.ring}` : ""}`}
      >
        <input
          type={mode}
          name={nameAttr}
          checked={selected}
          onChange={onToggle}
          className="sr-only"
        />
        <div
          className={`flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border shadow-sm transition ${
            selected
              ? "border-teal-300/80 bg-white dark:border-teal-600/50 dark:bg-slate-800"
              : "border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-800"
          }`}
        >
          {menu.logo ? (
            <LoadImage
              src={menu.logo}
              alt=""
              width={48}
              height={48}
              className="size-full object-contain p-1"
            />
          ) : (
            <IoRestaurant
              className={`text-xl ${selected ? "text-teal-600 dark:text-teal-400" : "text-slate-400"}`}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
            {name}
          </p>
          {badge ? (
            <span className="mt-0.5 inline-block rounded-md bg-teal-100/80 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
              {badge}
            </span>
          ) : null}
        </div>
        <div
          className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
            selected
              ? "border-teal-600 bg-teal-600 text-white dark:border-teal-500 dark:bg-teal-500"
              : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800"
          }`}
          aria-hidden
        >
          {selected ? <IoCheckmark className="text-sm" /> : null}
        </div>
      </label>
    </li>
  );
}

export function MenuGroupPickList({ children }: { children: ReactNode }) {
  return (
    <ul className="max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-slate-200/80 bg-slate-50/50 p-2 dark:border-slate-700 dark:bg-slate-800/30 sm:max-h-72">
      {children}
    </ul>
  );
}

export function MenuGroupMenuPreview({
  menu,
  name,
  hint,
}: {
  menu: Menu;
  name: string;
  hint?: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3 rounded-2xl border border-teal-200/70 bg-linear-to-r from-teal-50/80 to-white p-3 dark:border-teal-800/40 dark:from-teal-950/30 dark:to-slate-900">
      <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-teal-200/60 bg-white shadow-sm dark:border-teal-700/40 dark:bg-slate-800">
        {menu.logo ? (
          <LoadImage
            src={menu.logo}
            alt=""
            width={56}
            height={56}
            className="size-full object-contain p-1.5"
          />
        ) : (
          <IoRestaurant className="text-2xl text-teal-600 dark:text-teal-400" />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-base font-bold text-slate-900 dark:text-slate-50">
          {name}
        </p>
        {hint ? (
          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

export function MenuGroupEmptyHint({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 dark:border-amber-800/40 dark:bg-amber-950/25">
      <span className="text-lg leading-none" aria-hidden>
        💡
      </span>
      <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-100">{children}</p>
    </div>
  );
}

export function MenuGroupGroupOption({
  name,
  memberCount,
  selected,
  onSelect,
  nameAttr,
}: {
  name: string;
  memberCount: string;
  selected: boolean;
  onSelect: () => void;
  nameAttr: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all ${
        selected ? TEAL.selected : TEAL.idle
      } ${selected ? `ring-2 ${TEAL.ring}` : ""}`}
    >
      <input
        type="radio"
        name={nameAttr}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
          selected
            ? "bg-teal-600 text-white dark:bg-teal-500"
            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
        }`}
      >
        <IoGitNetworkOutline className="text-lg" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-900 dark:text-slate-50">{name}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{memberCount}</p>
      </div>
      <div
        className={`size-5 shrink-0 rounded-full border-2 ${
          selected
            ? "border-teal-600 bg-teal-600 ring-4 ring-teal-500/20 dark:border-teal-500 dark:bg-teal-500"
            : "border-slate-300 dark:border-slate-600"
        }`}
      />
    </label>
  );
}
