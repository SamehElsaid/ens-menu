"use client";

import type { ReactNode } from "react";
import {
  IoCheckmark,
  IoGitNetworkOutline,
  IoRestaurant,
} from "react-icons/io5";
import LoadImage from "@/components/ImageLoad";
import { Alert, Badge, Button, Modal } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Menu } from "@/types/Menu";

/** Selectable row chrome shared by the menu and group pickers. */
const pickRow = (selected: boolean) =>
  cn(
    "group flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors duration-150",
    "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring",
    selected
      ? "border-brand bg-brand-soft"
      : "border-line bg-surface hover:border-brand-line hover:bg-surface-2",
  );

type MenuGroupModalShellProps = {
  title: string;
  subtitle?: string;
  onClose: () => void;
  closeLabel: string;
  children: ReactNode;
  footer: ReactNode;
  maxWidth?: "md" | "lg";
};

export function MenuGroupModalShell({
  title,
  subtitle,
  onClose,
  closeLabel,
  children,
  footer,
  maxWidth = "lg",
}: MenuGroupModalShellProps) {
  return (
    <Modal
      open
      onClose={onClose}
      title={title}
      description={subtitle}
      icon={<IoGitNetworkOutline className="size-5" />}
      size={maxWidth === "md" ? "sm" : "md"}
      closeLabel={closeLabel}
      footer={footer}
    >
      {children}
    </Modal>
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
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
      {selectedCount != null && selectedCountLabel ? (
        <Badge tone="brand" size="md" className="w-fit sm:me-auto">
          {selectedCountLabel}
        </Badge>
      ) : null}
      <div className="flex flex-col-reverse gap-2 sm:ms-auto sm:flex-row">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant="primary"
          onClick={onSubmit}
          loading={loading}
          disabled={disabled}
        >
          {submitLabel}
        </Button>
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
      <p className="text-[13px] font-semibold text-fg">{children}</p>
      {hint ? (
        <p className="mt-0.5 text-xs leading-relaxed text-fg-muted">{hint}</p>
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
      <label className={pickRow(selected)}>
        <input
          type={mode}
          name={nameAttr}
          checked={selected}
          onChange={onToggle}
          className="sr-only"
        />
        <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-surface-2">
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
              className={cn(
                "text-xl",
                selected ? "text-brand" : "text-fg-subtle",
              )}
            />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-fg">
            {name}
          </span>
          {badge ? (
            <Badge tone="brand" className="mt-1">
              {badge}
            </Badge>
          ) : null}
        </span>
        <span
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-150",
            selected
              ? "border-brand bg-brand text-on-brand"
              : "border-line-strong bg-surface",
          )}
          aria-hidden
        >
          {selected ? <IoCheckmark className="size-3.5" /> : null}
        </span>
      </label>
    </li>
  );
}

export function MenuGroupPickList({ children }: { children: ReactNode }) {
  return (
    <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto rounded-lg bg-surface-2 p-2 sm:max-h-72">
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
    <div className="mb-5 flex items-center gap-3 rounded-lg bg-surface-2 p-3">
      <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-surface">
        {menu.logo ? (
          <LoadImage
            src={menu.logo}
            alt=""
            width={56}
            height={56}
            className="size-full object-contain p-1.5"
          />
        ) : (
          <IoRestaurant className="text-2xl text-brand" />
        )}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-fg">{name}</p>
        {hint ? (
          <p className="mt-0.5 text-xs leading-relaxed text-fg-muted">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

export function MenuGroupEmptyHint({ children }: { children: ReactNode }) {
  return <Alert tone="warning">{children}</Alert>;
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
    <label className={cn(pickRow(selected), "p-4")}>
      <input
        type="radio"
        name={nameAttr}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          selected ? "bg-brand text-on-brand" : "bg-surface-2 text-fg-muted",
        )}
        aria-hidden
      >
        <IoGitNetworkOutline className="text-lg" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-fg">
          {name}
        </span>
        <span className="block text-xs text-fg-muted">{memberCount}</span>
      </span>
      <span
        className={cn(
          "size-5 shrink-0 rounded-full border transition-colors duration-150",
          selected ? "border-brand bg-brand" : "border-line-strong bg-surface",
        )}
        aria-hidden
      />
    </label>
  );
}
